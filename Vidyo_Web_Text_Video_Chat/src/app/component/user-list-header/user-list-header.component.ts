import { Component, OnInit } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-user-list-header',
  templateUrl: './user-list-header.component.html',
  styleUrls: ['./user-list-header.component.css']
})
export class UserListHeaderComponent implements OnInit {
  /**
  * Description: Constructor of user-list-header component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) { }

  /**
  * Description: oninit of user-list-header component
  */
  ngOnInit() {
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
