import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed } from '@capacitor/core';
import { BroadcastService } from './broadcast.service';
import { IonicAlertService } from './ionic.alert.service';

const { PushNotifications } = Plugins;

@Injectable()
export class PushNotificationService {
  private isCapacitor = false;

  constructor(
    private broadcastService: BroadcastService,
    private platform: Platform,
    private navCtrl: NavController,
    private ionicAlertService: IonicAlertService,
  ) {
    const $this = this;

    this.platform.ready().then(() => {
      this.isCapacitor = this.platform.is('capacitor');
    });
  }

  public requestToken() {
    const msgHdr = 'requestToken: ';
    const $this = this;
    if (!PushNotifications || !this.isCapacitor) {
      console.log(msgHdr + 'push plugin not available');
      $this.ionicAlertService.presentAlert('Sorry - Push notifications are not available on this device');
      return;
    }

    if (this.isCapacitor) {
      PushNotifications.requestPermission().then((result) => {
        if (result.granted) {
          console.log(msgHdr + 'result = ', result);
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register().then(() => {
            $this.ionicAlertService.presentAlert('Push notifications registered successfully');
          })
          .catch(() => {
            $this.ionicAlertService.presentAlert('Sorry - there was an error trying to get push notifications configured');
          });
        } else {
          console.log(msgHdr + 'errRequestPush = ', result);
          // Show some error
          $this.ionicAlertService.presentAlert('Sorry - there was an error trying to get push notifications granted');
        }
      }).catch((err) => {
        $this.ionicAlertService.presentAlert('Sorry - there was an error trying to register push notifications');
      });
    }


  }

  public registerListeners() {
    const msgHdr = 'registerListeners: ';
    const $this = this;

    this.platform.ready().then(() => {
      this.isCapacitor = this.platform.is('capacitor');
      if (PushNotifications && this.isCapacitor) {
        // Request permission to use push notifications
        // iOS will prompt user and return if they granted permission or not
        // Android will just grant without prompting
        console.log(msgHdr + 'requesting push notifications');

        PushNotifications.addListener('registration',
          (token: PushNotificationToken) => {
            console.log(msgHdr + 'Push registration success, token = ', token);
            if (!token.value) {
              console.error(msgHdr + 'expected missing value in token = ', token);
              return;
            }
            $this.broadcastService.broadcast('new-push-token', {
              token: token.value,
            });
            // alert('Push registration success, token: ' + token.value);
          },
        );

        PushNotifications.addListener('registrationError',
          (error: any) => {
            console.error(msgHdr + 'Error on registration: ' + JSON.stringify(error));
          },
        );

        PushNotifications.addListener('pushNotificationReceived',
          (notification: PushNotification) => {
            console.log('pushNotificationReceived = ', JSON.stringify(notification));
            // NJC - DO NOT UNCOMMENT THIS OUT.  This will switch the user in session
            // if (notification.data && notification.data.url) {
            //   const url = notification.data.url.replace('https://app.logreps.com/', '');
            //   $this.navCtrl.navigateForward(url);
            // }
            // alert('Push received: ' + JSON.stringify(notification));
          },
        );

        PushNotifications.addListener('pushNotificationActionPerformed',
          (notification: PushNotificationActionPerformed) => {
            console.log('PushNotificationActionPerformed = ', JSON.stringify(notification));
            // alert('Push action performed: ' + JSON.stringify(notification));
          },
        );

      }
    });
  }

}
