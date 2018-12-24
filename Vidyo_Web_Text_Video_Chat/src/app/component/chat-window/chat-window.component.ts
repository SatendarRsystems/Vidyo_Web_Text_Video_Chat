import { Component, OnInit, AfterViewInit } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';
import string_constant from '../../constant/message_constant';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, AfterViewInit {
  isLoading = false;      // default value for isloading
  showSetting = false;    // display setting container
  errorOccured = false;   // default value for errorOccured
  error_message = '';     // error message

  /**
  * Description: Constructor of chat-window component
  * @param object  vidyoClientService
  */
  constructor(private vidyoClientService: VidyoClientService) {
    this.isLoading = true;
    // subscribe to meetingJoinedConfirmed observer this observer inform about the meeting join status
    this.vidyoClientService.meetingJoinedConfirmed$.subscribe(
      status => {
        switch (status.type) {
          case string_constant.ERROR:         // Error occure during conneting to meeting
          case string_constant.FALIURE:       // Failed
          case string_constant.FAILED:        // Failed
            this.isLoading = false;
            this.error_message = string_constant[status.data] || string_constant.UNABLE_TO_JOIN;
            this.errorOccured = true;
            break;
          case string_constant.SUCESS:         // success
            this.isLoading = false;
            break;
        }
      });
  }

  /**
  * Description: oninit of user chat-window component
  */
  ngOnInit() {
  }

  /**
  * Description: redirect to login page.
  */
  close() {
    this.vidyoClientService.logout();
  }

  /**
  * Description: show/hide setting component.
  * @param boolean show
  */
  displaySetting(show) {
    this.showSetting = show;
  }

  /**
  * Description: init vidyo connector after viewinit
  */
  ngAfterViewInit() {
    this.vidyoClientService.initVidyoConnector();   // init vidyo connector
  }
}

