import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-video-chat-window',
  templateUrl: './video-chat-window.component.html',
  styleUrls: ['./video-chat-window.component.css']
})
export class VideoChatWindowComponent {
  @ViewChild('videosection') videoSection: ElementRef;

  preview: Boolean = false;   // variable to toggle camera preview
  muted: Boolean = false;     // variable to toggle microphone
  isConnected = true;         // variable for connection/disconnection from meeting


  /**
  * Description: Constructor of vidyo-client component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) {
  }

  /*
  * Description: toggle tunr on/off camera
  */
  togglePreview() {
    this.preview = this.vidyoClientService.toggleCameraPrivacy();
  }

  /*
  * Description: toggle tunr on/off microphone
  */
  toggleMic() {
    this.muted = this.vidyoClientService.toggleMicPrivacy();
  }

  /*
  * Description: connect/disconnect from meeting
  */
  toggleConnect() {
    this.isConnected = false;
    this.vidyoClientService.logout();
  }

}
