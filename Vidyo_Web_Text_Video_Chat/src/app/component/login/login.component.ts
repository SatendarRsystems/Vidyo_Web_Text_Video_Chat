import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';
import { Router } from '@angular/router';

import string_constant from '../../constant/message_constant';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  // DOM element refrence
  @ViewChild('connectionStatus') connectionStatus: ElementRef;
  @ViewChild('helperText') helperText: ElementRef;
  @ViewChild('helperPlugInDownload') helperPlugInDownload: ElementRef;
  @ViewChild('helperAppDownload') helperAppDownload: ElementRef;
  @ViewChild('logintext') loginInput: ElementRef;
  @ViewChild('meetingtext') meetingInput: ElementRef;
  @ViewChild('hosttext') HostNameInput: ElementRef;
  @ViewChild('tokentext') tokenInput: ElementRef;

  login = {
    userName: '',
    meetingRoom: '',
    hostName: '',
    token: ''
  };

  disableJoinButton = false;
  isLoading = false;
  errorOccured = false;
  TIMEOUTOCCUR = false;

  /**
  * Description: Constructor of login component
  * @param object  vidyoClientService
  * @param object  router
  */
  constructor(private vidyoClientService: VidyoClientService, private router: Router) {
    this.vidyoClientService.loadVidyoSDK();
    // subscribe to sdkLoadConfirmed observer this observer inform about the sdk intialization status
    this.vidyoClientService.sdkLoadConfirmed$.subscribe(
      status => {
        let helperText = '';
        switch (status.state) {
          case string_constant.READY: // The library is operating normally
            this.disableJoinButton = false;
            break;
          case string_constant.RETRYING: // The library operating is temporarily paused
            this.isLoading = false;
            this.errorOccured = true;
            this.connectionStatus.nativeElement.innerHTML = 'Temporarily unavailable retrying in ' + status.nextTimeout / 1000 + ' seconds';
            break;
          case string_constant.FAILED: // The library operating has stopped
            if (!this.TIMEOUTOCCUR) {
              this.isLoading = false;
              this.errorOccured = true;
              helperText = '';
              // Display the error
              helperText += '<h2>An error occurred, please reload</h2>';
              helperText += '<p>' + status.description + '</p>';

              this.helperText.nativeElement.innerHTML = helperText;
              this.connectionStatus.nativeElement.innerHTML = 'Failed: ' + status.description;
            }
            break;
          case string_constant.FAILEDVERSION: // The library operating has stopped
            this.isLoading = false;
            this.errorOccured = true;
            helperText = '';
            // Display the error
            helperText += '<h4>Please Download a new plugIn and restart the browser</h4>';
            helperText += '<p>' + status.description + '</p>';

            this.helperText.nativeElement.innerHTML = helperText;
            this.connectionStatus.nativeElement.innerHTML = 'Failed: ' + status.description;
            this.helperPlugInDownload.nativeElement.innerHTML = status.downloadPathPlugIn;
            this.helperAppDownload.nativeElement.innerHTML = status.downloadPathApp;
            break;
          case string_constant.NOTAVAILABLE: // The library is not available
            this.isLoading = false;
            this.errorOccured = true;
            this.connectionStatus.nativeElement.innerHTML = status.description;
            break;
          case string_constant.TIMEDOUT:
            this.TIMEOUTOCCUR = true;
            this.disableJoinButton = false;
            break;
        }
      });
  }

  /**
  * Description: oninit of login component
  */
  ngOnInit() {
  }

  /**
  * Description: Focus on user name input box after login page load
  */
  ngAfterViewInit() {
    // Focus on user name input box after login page load
    this.loginInput.nativeElement.focus();
  }

  /**
  * Description: Join the meeting
  */
  joinMeeting() {
    if (!this.validateInput()) {
      return;
    }
    this.vidyoClientService.setData(this.login.userName, this.login.meetingRoom, this.login.hostName, this.login.token);
    const redirect = '/chat';
    this.router.navigate([redirect]);
  }

  /**
   * Description: validate the user name and meeting room text.
   * @return boolean
   */
  validateInput() {
    this.login.userName = this.login.userName.trim();
    this.login.meetingRoom = this.login.meetingRoom.trim();
    const letters = /^[0-9a-zA-Z]+$/;
    // Validation for user name only alpha numeric values are allowed
    if (this.login.userName === '' || !this.login.userName.match(letters)) {
      this.errorOccured = true;
      this.connectionStatus.nativeElement.innerHTML = string_constant.DISPLAY_NAME_ERROR_MSG;
      this.loginInput.nativeElement.focus();
      return false;
    } else if (this.login.meetingRoom === '' || !this.login.meetingRoom.match(letters)) {
      // Validation for meeting room only alpha numeric values are allowed
      this.errorOccured = true;
      this.connectionStatus.nativeElement.innerHTML = string_constant.RESOURCE_ID_ERROR_MSG;
      this.meetingInput.nativeElement.focus();
      return false;
    } else if (this.login.hostName === '') {
      // Validation for meeting room only alpha numeric values are allowed
      this.errorOccured = true;
      this.connectionStatus.nativeElement.innerHTML = string_constant.HOST_NAME_ERROR_MSG;
      this.HostNameInput.nativeElement.focus();
      return false;
    } else if (this.login.token === '') {
      // Validation for meeting room only alpha numeric values are allowed
      this.errorOccured = true;
      this.connectionStatus.nativeElement.innerHTML = string_constant.TOKEN_ERROR_MSG;
      this.tokenInput.nativeElement.focus();
      return false;
    } else {
      this.errorOccured = false;
      return true;
    }
  }
}
