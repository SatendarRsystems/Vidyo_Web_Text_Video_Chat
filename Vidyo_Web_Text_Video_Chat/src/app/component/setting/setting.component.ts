import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  @Output()
  hideSetting: EventEmitter<any> = new EventEmitter<any>();

  cameras = [];         // array of cameras
  microphones = [];     // array of microphones
  speakers = [];        // array of speakers
  selectedCameraId;     // selected cameras id
  selectedMicrophoneId; // selected microphone id
  selectedSpeakerId;    // selected speaker id

  /**
  * Description: Constructor of setting component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) {

    this.vidyoClientService.deviceChangeRecievedConfirmed$.subscribe(
      () => {
        this.updateConnectedDeviceData();
        this.currentSelectedDevice();
      });
  }

  /**
  * Description: Get some data on init
  */
  ngOnInit() {
    this.updateConnectedDeviceData();
    this.currentSelectedDevice();
  }

  /**
  * Description: Get current selected device data
  */
  currentSelectedDevice = () => {
    const selectedLocalSetting = this.vidyoClientService.getSelectedDeviceInformation();
    this.selectedCameraId = selectedLocalSetting.selectedLocalCamera || this.cameras[0].id;
    this.selectedMicrophoneId = selectedLocalSetting.selectedLocalMicrophone || this.microphones[0].id;
    this.selectedSpeakerId = selectedLocalSetting.selectedLocalSpeaker || this.speakers[0].id;
  }

  /**
  * Description: Get events while on change the drop down of the device.
  * @param object  type
  * @param object  event
  */
  changed = (type, event) => {
    let deviceData;
    const selectedIndex = event.target.selectedIndex;
    switch (type) {
      case 'camera':
        deviceData = this.cameras[selectedIndex];
        break;
      case 'microphone':
        deviceData = this.microphones[selectedIndex];
        break;
      case 'speaker':
        deviceData = this.speakers[selectedIndex];
        break;
    }
    this.vidyoClientService.handleDeviceChange(type, deviceData);
  }

  /**
  * Description: Get device data from service
  */
  updateConnectedDeviceData = () => {
    const deviceData = this.vidyoClientService.getDeviceInforamtion();
    this.cameras = deviceData.cameras;
    this.microphones = deviceData.microphones;
    this.speakers = deviceData.speakers;
  }

  /**
  * Description: Send value false through EventEmitter
  */
  closeSetting = () => {
    this.hideSetting.emit(false);
  }
}
