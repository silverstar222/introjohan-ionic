/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var pushNotification;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      // console.log('also here');
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      
      // this.receivedEvent('deviceready');
      // alert('ok');

      try {
      // alert('Device is ready! Make sure you set your app_id below this alert.');
        console.log('Fb init attempt');
        FB.init({ appId: "656728317707923", nativeInterface: CDV.FB, useCachedDialogs: false });
        // document.getElementById('data').innerHTML = "";
        console.log('Fb initiated');
      } catch (e) {
        alert(e);
      }
    
      // pushNotification = window.plugins.pushNotification;
      // // if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){

      // //     pushNotification.register(
      // //     successHandler,
      // //     errorHandler,
      // //     {
      // //         "senderID":"replace_with_sender_id",
      // //         "ecb":"onNotification"
      // //     });
      // // } else {
      //     pushNotification.register(
      //     tokenHandler,
      //     errorHandler,
      //     {
      //         "badge":"true",
      //         "sound":"true",
      //         "alert":"true",
      //         "ecb":"onNotificationAPN"
      //     });
      // // }

      // function errorHandler (error) {
      //     alert('error = ' + error);
      // }

      // function successHandler (result) {
      //     // $("#app-status-ul").append('<li>success:'+ result +'</li>');
      //     alert('successhandler');
      //     // alert(result);
      // }

      // function tokenHandler (result) {
      //     // Your iOS push server needs to know the token before it can push to this device
      //     // here is where you might want to send it the token for later use.
      //     console.log('device token = ' + result);
      // }
      // // pushNotification.setApplicationIconBadgeNumber(successCallback, errorCallback, badgeCount);

      // function onNotificationAPN(e) {
      //           if (e.alert) {
      //             alert('here');
      //                // $("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
      //                // showing an alert also requires the org.apache.cordova.dialogs plugin
      //                navigator.notification.alert(e.alert);
      //           }
                    
      //           if (e.sound) {
      //               // playing a sound also requires the org.apache.cordova.media plugin
      //               var snd = new Media(e.sound);
      //               snd.play();
      //           }
                
      //           if (e.badge) {
      //             alert('here2');
      //               pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
      //           }
      //       }
      }
    // Update DOM on a Received Event
    // receivedEvent: function(id) {
    //     var parentElement = document.getElementById(id);
    //     var listeningElement = parentElement.querySelector('.listening');
    //     var receivedElement = parentElement.querySelector('.received');

    //     listeningElement.setAttribute('style', 'display:none;');
    //     receivedElement.setAttribute('style', 'display:block;');

    //     console.log('Received Event: ' + id);
    // }
};
