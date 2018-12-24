import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import config from '../../config';
import string_constant from '../constant/message_constant';
import Helper from '../common/helper';

// After the VidyoClient is successfully initialized a global VC object will become available
declare var VC: any;

@Injectable({
    providedIn: 'root'
})
export class VidyoClientService {
    private vidyoConnector;   // Vidyo connector object
    private userName;         // user Name
    private meetingRoom;      // Meeting Room Name
    private hostName;         // host Name
    private token;            // Vidyo token
    private users;            // Array of users present in meeting room
    private cameraPrivacy = false;  // camera privacy
    private micPrivacy = false;     // microphone privacy

    private cameras;         // array for available cameras
    private selectedLocalCamera; // currently selected camera
    private microphones; // array for available microphones
    private selectedLocalMicrophone;  // currently selected microphone
    private speakers; // array for available speakers
    private selectedLocalSpeaker; // currently selected speaker

    // Observers //
    private sdkLoadSubject = new Subject<any>();
    // Observable for Vidyo SDK Load Event
    sdkLoadConfirmed$ = this.sdkLoadSubject.asObservable();

    private joinMeetingSubject = new Subject<any>();
    // Observable for user joined the meeting room
    meetingJoinedConfirmed$ = this.joinMeetingSubject.asObservable();

    private messageSendRecievedSubject = new Subject<any>();
    // Observable for chat message recieve and send
    messageSendRecievedConfirmed$ = this.messageSendRecievedSubject.asObservable();

    private deviceChangeRecievedSubject = new Subject();
    // Observable for device recieve and send
    deviceChangeRecievedConfirmed$ = this.deviceChangeRecievedSubject.asObservable();

    /**
    * Description: Constructor of vidyo-client service
    * @param object  router
    */
    constructor(private router: Router) {
        /* Exposing onVidyoClientLoaded method to outside angular zone */
        window['onVidyoClientLoaded'] = (status) => {
            this.sdkLoadSubject.next(status);
        };

        // intialize the value on load
        this.intializeValue();
    }

    /*
    * Description: intialize the value on load
    */
    intializeValue = () => {
        // Intialize users to empty array
        this.users = [];
        this.cameras = [];
        this.microphones = [];
        this.speakers = [];

        this.selectedLocalCamera = 0;
        this.selectedLocalMicrophone = 0;
        this.selectedLocalSpeaker = 0;
        this.cameras[0] = { id: '0', name: 'None' };
        this.microphones[0] = { id: '0', name: 'None' };
        this.speakers[0] = { id: '0', name: 'None' };
    }

    /**
    * Description: Load vidyo library.
    * This method create a script tag with source pointing to vidyo library and add append this script tag into head of application
    */
    loadVidyoSDK = () => {
        if (typeof VC !== 'undefined') {
            return;
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = config.VIDYO_LIB;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    /**
    * Description: Set login variables.
    * @param string userName
    * @param string meetingRoom
    * @param string hostName
    * @param string token
    */
    setData = (userName, meetingRoom, hostName, token) => {
        this.userName = userName.trim();
        this.meetingRoom = meetingRoom.trim();
        this.hostName = hostName.trim();
        this.token = token.trim();
    }

    /**
    * Description: Register the message listener.This listner listen for message receive event
    */
    registerMessageListener = () => {
        // Register Message event listener
        this.vidyoConnector.RegisterMessageEventListener({
            onChatMessageReceived: (participant, chatMessage) => {
                // Recieved New Message
                if (chatMessage.userId !== 'local') {
                    const jsonObject = JSON.parse(chatMessage.body);
                    const userBgColor = this.getUserBgColor(participant.name);
                    const mItem = { isUser: false, data: jsonObject, username: participant.name, userBgColor: userBgColor };
                    this.messageSendRecievedSubject.next(mItem);
                }
            }
        }).then(() => {
            console.log('RegisterMessageEventListener Success');
        }).catch(() => {
            console.log('RegisterMessageEventListener Failed');
        });
    }

    /**
    * Description: get the background color of user
    * @param string userName
    * @return string bgColor
    */
    getUserBgColor = (userName) => {
        const user = this.users.find((item) => {
            return item.name === userName;
        });
        return user.bgColor;
    }

    /**
    * Description: Create Vidyo connector
    */
    initVidyoConnector = () => {
        VC.CreateVidyoConnector({
            viewId: 'video-section', // Div ID where the composited video will be rendered, see VidyoConnector.html;
            viewStyle: 'VIDYO_CONNECTORVIEWSTYLE_Default', // Visual style of the composited renderer
            remoteParticipants: 8,     // Maximum number of participants to render
            logFileFilter: 'warning info@VidyoClient info@VidyoConnector',
            logFileName: '',
            userData: '',
        }).then((vc) => {
            this.vidyoConnector = vc;
            this.ShowRenderer();
            this.registerDeviceListeners();

            this.handleParticipantChangeListener();
            this.registerMessageListener();
            this.joinRoom();
        }).catch((err) => { });
    }


    /**
    * Description: Register device(i.e camera , microphone , speaker) listener
    */
    registerDeviceListeners() {
        // Handle appearance and disappearance of camera devices in the system
        this.vidyoConnector.RegisterLocalCameraEventListener({
            onAdded: (localCamera) => {
                // New camera is available
                this.cameras.push(localCamera);
                this.deviceChangeRecievedSubject.next();
            },
            onRemoved: (localCamera) => {
                this.cameras = Helper.filterItems(this.cameras, localCamera);
                if (this.cameras.length <= 1) {
                    this.selectedLocalCamera = 0;
                }
                this.deviceChangeRecievedSubject.next();
            },
            onSelected: (localCamera) => {
                if (localCamera) {
                    this.selectedLocalCamera = localCamera.id;
                } else {
                    this.selectedLocalCamera = 0;
                }
            },
            onStateUpdated: (localCamera, state) => {
                // Camera state was updated
            }
        }).then(() => {
            console.log('RegisterLocalCameraEventListener Success');
        }).catch(() => {
            console.error('RegisterLocalCameraEventListener Failed');
        });

        // Handle appearance and disappearance of microphone devices in the system
        this.vidyoConnector.RegisterLocalMicrophoneEventListener({
            onAdded: (localMicrophone) => {
                this.microphones.push(localMicrophone);
                this.deviceChangeRecievedSubject.next();
            },
            onRemoved: (localMicrophone) => {
                this.microphones = Helper.filterItems(this.microphones, localMicrophone);
                if (this.microphones.length <= 1) {
                    this.selectedLocalMicrophone = 0;
                }
                this.deviceChangeRecievedSubject.next();
            },
            onSelected: (localMicrophone) => {
                // Microphone was selected/unselected by you or automatically
                if (localMicrophone) {
                    this.selectedLocalMicrophone = localMicrophone.id;
                } else {
                    this.selectedLocalMicrophone = 0;
                }
            },
            onStateUpdated: (localMicrophone, state) => {
                // Microphone state was updated
            }
        }).then(() => {
            console.log('RegisterLocalMicrophoneEventListener Success');
        }).catch(() => {
            console.error('RegisterLocalMicrophoneEventListener Failed');
        });

        // Handle appearance and disappearance of speaker devices in the system
        this.vidyoConnector.RegisterLocalSpeakerEventListener({
            onAdded: (localSpeaker) => {
                this.speakers.push(localSpeaker);
                this.deviceChangeRecievedSubject.next();
            },
            onRemoved: (localSpeaker) => {
                this.speakers = Helper.filterItems(this.speakers, localSpeaker);
                if (this.speakers.length <= 1) {
                    this.selectedLocalSpeaker = 0;
                }
                this.deviceChangeRecievedSubject.next();
            },
            onSelected: (localSpeaker) => {
                // Speaker was selected/unselected by you or automatically
                if (localSpeaker) {
                    this.selectedLocalSpeaker = localSpeaker.id;
                } else {
                    this.selectedLocalSpeaker = 0;
                }
            },
            onStateUpdated: (localSpeaker, state) => {
                // Speaker state was updated
            }
        }).then(() => {
            console.log('RegisterLocalSpeakerEventListener Success');
        }).catch(() => {
            console.error('RegisterLocalSpeakerEventListener Failed');
        });
    }

    /**
    * Description: Register the participant change listener.
    */
    handleParticipantChangeListener = () => {
        this.vidyoConnector.RegisterParticipantEventListener({
            // Define handlers for participant change events.
            onJoined: (participant) => {
                // participant Joined
                console.log('[vc] participant onJoined= ' + JSON.stringify(participant));
                this.addUser(participant);
            },
            onLeft: (participant) => {
                // participant Left
                console.log('[vc] participant onLeft= ' + JSON.stringify(participant));
                this.removeUser(participant);
            },
            onDynamicChanged: (participants) => {
                console.log('[vc] participant onDynamicChanged= ' + JSON.stringify(participants));
            },
            onLoudestChanged: (participant, audioOnly) => {
                // participant talking
                participant.audioOnly = audioOnly;
                console.log('[vc] participant onLoudestChanged= ' + JSON.stringify(participant));
                console.log('[vc] participant onLoudestChanged audioOnly= ' + JSON.stringify(audioOnly));
            }
        }).then(() => {
            console.log('[vc] RegisterParticipantEventListener Success');
        }).catch(() => {
            console.error('[vc] RegisterParticipantEventListener Failed');
        });
    }

    /**
    * Description: turn on/off camera .
    */
    toggleCameraPrivacy() {
        this.cameraPrivacy = !this.cameraPrivacy;
        this.vidyoConnector.SetCameraPrivacy({ privacy: this.cameraPrivacy });
        return this.cameraPrivacy;
    }

    /**
    * Description: turn on/off microphone .
    */
    toggleMicPrivacy() {
        this.micPrivacy = !this.micPrivacy;
        this.vidyoConnector.SetMicrophonePrivacy({ privacy: this.micPrivacy });
        return this.micPrivacy;
    }

    /**
    * Description: Generate random color code.
    * @return string color
    */
    getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
    * Description: Add user in users array object.
    * @param Object user
    */
    addUser = (user) => {
        user.bgColor = this.getRandomColor();
        user.firstChar = user.name.substr(0, 1).toUpperCase();
        this.users.push(user);
    }

    /**
    * Description: remove user from users array object.
    * @param Object user
    */
    removeUser = (user) => {
        this.users = this.users.filter((item) => {
            return item.id !== user.id;
        });
    }

    /**
    * Description: connect to the conference.
    * @param string token
    * @param string userName
    * @param string meetingRoom
    */
    joinRoom = () => {
        if (this.meetingRoom.indexOf(' ') !== -1 || this.meetingRoom.indexOf('@') !== -1) {
            console.error('Connect meeting aborted due to invalid Resource ID');
            const status = {
                type: string_constant.FALIURE,
                data: string_constant.INVALID_RESOURCE_ID
            };
            this.joinMeetingSubject.next(status);
            return;
        }
        this.vidyoConnector.Connect({
            // Take input from options form
            host: this.hostName,
            token: this.token,
            displayName: this.userName,
            resourceId: this.meetingRoom,

            // Define handlers for connection events.
            onSuccess: () => {
                // Connected
                console.log('vidyoConnector.Connect : onSuccess callback received');
                this.ShowRenderer();
                const selfId = { name: this.userName + '(You)' };
                this.addUser(selfId);
                const status = {
                    type: string_constant.SUCESS,
                    data: string_constant.NONE
                };
                this.joinMeetingSubject.next(status);
            },
            onFailure: (reason) => {
                // Failed
                console.error('vidyoConnector.Connect : onFailure callback received');
                const status = {
                    type: string_constant.FALIURE,
                    data: reason
                };
                this.joinMeetingSubject.next(status);
            },
            onDisconnected: (reason) => {
                // Disconnected
                console.log('vidyoConnector.Connect : onDisconnected callback received');
                this.ShowRenderer();
                const status = {
                    type: string_constant.DISCONNECTED,
                    data: reason
                };
                this.joinMeetingSubject.next(status);
            }
        }).then((status) => {
            if (status) {
                console.log('[vc] Connect Success');

            } else {
                console.error('[vc] Connect Failed');
            }
        }).catch(() => {
            const status = {
                type: string_constant.FAILED,
                data: ''
            };
            this.joinMeetingSubject.next(status);
        });
    }

    /**
    * Description: function to broadcast the entered message from the user
    */
    sendChatMsg = (chatMessage) => {
        const message = '{ "type": "PublicChat",' +
            '"message": "' + chatMessage + '" }';
        this.vidyoConnector.SendChatMessage({ message });
        const userBgColor = this.getUserBgColor(this.userName + '(You)');
        const messageData = {
            message: chatMessage
        };
        const mItem = { isUser: true, data: messageData, username: this.userName, userBgColor: userBgColor };
        this.messageSendRecievedSubject.next(mItem);
    }

    /**
    * Description: function logout to conference
    */
    logout = () => {
        const redirect = '/login';
        this.vidyoConnector.Disconnect().then(() => {
            this.vidyoConnector.Disable();
            this.deInitAppData();
            this.router.navigate([redirect]);
        }).catch(() => {
            this.vidyoConnector.Disable();
            this.deInitAppData();
            this.router.navigate([redirect]);
        });
    }

    /**
    * Description: function to reset application data.
    */
    deInitAppData = () => {
        this.intializeValue();
    }

    /**
    * Description: function disconnect to conference
    */
    disconnect = () => {
        this.vidyoConnector.SetCameraPrivacy({ privacy: true });
        this.vidyoConnector.SetMicrophonePrivacy({ privacy: true });
        this.vidyoConnector.hideView('video-section');
    }

    /**
     * Description: function reconnect to conference
     */
    reconnect = () => {
        this.vidyoConnector.SetCameraPrivacy({ privacy: false });
        this.vidyoConnector.SetMicrophonePrivacy({ privacy: false });
        this.ShowRenderer();
    }

    /**
    * Description: function to get all connected device(i.e. camera,microphone and speaker) information
    * @return deviceData
    */
    getDeviceInforamtion = () => {
        const deviceData = { cameras: [], microphones: [], speakers: [] };
        deviceData.cameras = this.cameras;
        deviceData.microphones = this.microphones;
        deviceData.speakers = this.speakers;
        return deviceData;
    }

    /**
    * Description: function to set the selected device (i.e. camera,microphone and speaker)
    */
    handleDeviceChange = (deviceType, deviceData) => {
        deviceData = deviceData.name === 'None' ? null : deviceData;

        switch (deviceType) {
            case 'camera':
                this.vidyoConnector.SelectLocalCamera({
                    localCamera: deviceData
                }).then(function () {
                    console.log('Select Camera Success');
                }).catch(function () {
                    console.error('Select Camera Failed');
                });
                this.selectedLocalCamera = deviceData === null ? 0 : this.selectedLocalCamera;
                break;
            case 'microphone':
                this.vidyoConnector.SelectLocalMicrophone({
                    localMicrophone: deviceData
                }).then(function () {
                    console.log('Select Microphone Success');
                }).catch(function () {
                    console.error('Select Microphone Failed');
                });
                this.selectedLocalMicrophone = deviceData === null ? 0 : this.selectedLocalMicrophone;
                break;
            case 'speaker':
                this.vidyoConnector.SelectLocalSpeaker({
                    localSpeaker: deviceData
                }).then(function () {
                    console.log('Select Speaker Success');
                }).catch(function () {
                    console.error('Select Speaker Failed');
                });
                this.selectedLocalSpeaker = deviceData === null ? 0 : this.selectedLocalSpeaker;
                break;
        }
    }

    /**
    * Description: function return currently selected device (i.e. camera,microphone and speaker) information
    */
    getSelectedDeviceInformation = () => {
        const selectedLocalSetting = {
            selectedLocalCamera: this.selectedLocalCamera,
            selectedLocalMicrophone: this.selectedLocalMicrophone,
            selectedLocalSpeaker: this.selectedLocalSpeaker
        };
        return selectedLocalSetting;
    }

    /**
    * Description: Set the camera view
    */
    ShowRenderer = () => {
        const rndr = document.getElementById('video-section');
        this.vidyoConnector.ShowViewAt({
            viewId: 'video-section',
            x: rndr.offsetLeft,
            y: rndr.offsetTop,
            width: rndr.offsetWidth,
            height: rndr.offsetHeight
        });
    }

    /**
     * Description: funtion to get the user name
     * @returns string userName
    */
    getUserName = () => {
        return this.userName;
    }

    /**
     * Description: funtion to get the users present in meeting
     * @returns array Users
    */
    getUsers = () => {
        return this.users;
    }

    /**
     * Description: funtion to get the resource ID
     * @returns string resourceID
    */
    getResourceID = () => {
        return this.meetingRoom;
    }


}
