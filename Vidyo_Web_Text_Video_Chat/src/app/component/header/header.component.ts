import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output()
  showSetting: EventEmitter<any> = new EventEmitter<any>();

  /**
  * Description: Constructor of header component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) { }

  /**
  * Description: oninit of header component
  */
  ngOnInit() {
  }

  /**
  * Description: Set the show setting valut to true
  */
  displaySetting() {
    this.showSetting.emit(true);
  }

  /**
  * Description: logout the application by calling serice method
  */
  logout() {
    this.vidyoClientService.logout();
  }

  /**
  * Description: funtion to get the resource ID
  * @returns string resourceID
  */
  getResourceID() {
    return this.vidyoClientService.getResourceID();
  }

  /**
  * Description: funtion to get the user name
  * @returns string userName
  */
  getUserName() {
    return this.vidyoClientService.getUserName();
  }

  /**
  * Description: funtion to get the users present in meeting
  * @returns array Users
  */
  getUsers() {
    return this.vidyoClientService.getUsers();
  }
}
