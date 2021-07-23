import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

declare const window: any;

@Injectable()
export class WindowService {
  constructor(
    private platform: Platform,
  ) {}

  public createWindow(
    url: string,
    name: string = 'Window',
    width: number = 500,
    height: number = 600,
    left: number = 0,
    top: number = 0) {

    if (url == null) {
      return null;
    }

    const options = `width=${width},height=${height},left=${left},top=${top}`;

    this.platform.ready().then(() => {
      // if (this.platform.is('cordova')) {
      //   // _self is definitely not correct, google no longer authorizes  https://github.com/meteor/meteor/issues/8253
      //   // _blank opens up safari which can't handle redirect
      //   return window.cordova.In-App-Browser.open(url, '_system', 'location=yes');
      // }
      return window.open(url, name, options);
    });
  }
}

