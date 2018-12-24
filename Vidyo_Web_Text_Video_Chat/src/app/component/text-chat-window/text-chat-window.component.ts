import { Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { VidyoClientService } from '../../service/vidyo-client.service';

@Component({
  selector: 'app-text-chat-window',
  templateUrl: './text-chat-window.component.html',
  styleUrls: ['./text-chat-window.component.css']
})
export class TextChatWindowComponent implements OnInit, AfterViewInit {
  // Refrence of DOM element
  @ViewChild('messageSendInputBox') messageInputBox: ElementRef;
  @ViewChild('chatMessageBox') chatMessageBox: ElementRef;

  // Message array
  messageList = [];

  constructor(private vidyoClientService: VidyoClientService) {
    // subscribe to messageSendRecievedConfirmed observer this observer provide chat messages.
    vidyoClientService.messageSendRecievedConfirmed$.subscribe(
      data => {
        this.messageList.push(data);
      });
  }

  ngOnInit() { }

  ngAfterViewInit() {
    // Set focus on send message input box
    this.messageInputBox.nativeElement.focus();
    // Observer to detect the change in chat dispaly area.If any change occur in
    // chat display area than scroll down to the bottom of chat area.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => this.scrollToBottom());
    });

    // Observer to detect the change in chat dispaly area.
    observer.observe(this.chatMessageBox.nativeElement, {
      attributes: true,
      childList: true,
      characterData: true
    });

  }

  /**
   * Description: Scroll to the bottom of chat message display area.
   */
  scrollToBottom(): void {
    try {
      this.chatMessageBox.nativeElement.scrollTop = this.chatMessageBox.nativeElement.scrollHeight;
    } catch (err) { }
  }

  /**
   * Description: check mesage is blank.
   */
  isMessageBlank(str) {
    return (!str || /^\s*$/.test(str));
  }

  /**
   * Description: Send chat message method.
   */
  sendChatMsg() {
    const chatMessage = this.messageInputBox.nativeElement.value;
    if (!this.isMessageBlank(chatMessage)) {
      // send chat message
      this.vidyoClientService.sendChatMsg(chatMessage);
    }
    this.messageInputBox.nativeElement.value = '';
    this.messageInputBox.nativeElement.focus();
  }
}
