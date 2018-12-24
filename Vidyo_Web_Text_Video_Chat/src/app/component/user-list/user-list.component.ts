import { Component, OnInit } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  /**
  * Description: Constructor of user-list component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) { }

  /**
  * Description: oninit of user-list component
  */
  ngOnInit() {
  }

  /**
  * Description: funtion to get the users present in meeting
  * @returns array Users
  */
  getUsers() {
    return this.vidyoClientService.getUsers();
  }

}
