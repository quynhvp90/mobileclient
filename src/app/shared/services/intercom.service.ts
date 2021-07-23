import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GlobalService } from './global.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { Platform } from '@ionic/angular';

const jsFilename = 'intercomService: ';

@Injectable()
export class IntercomService {
  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private broadcastService: BroadcastService,
    private platform: Platform,

  ) {
    const $this = this;
  }

  public hideIntercom() {
    const intercomElement = document.getElementById('intercom-container');
    if (typeof(intercomElement) !== 'undefined' && intercomElement != null) {
      intercomElement.style.display = 'none';
    }
  }

  public showIntercom() {
    // if (this.deviceService.isMobile()) {
    //   return;
    // }

    const intercomElement = document.getElementById('intercom-container');
    if (typeof(intercomElement) !== 'undefined' && intercomElement != null) {
      intercomElement.style.display = '';
      intercomElement.style.visibility = 'visible';
    }
  }

  public trackEvent(eventName, options: any) {
    const $this = this;
    const intercom = (<any>window).Intercom;

    if (intercom) {
      intercom('trackEvent', eventName, options);
    }

    let platforms = 'unknown';

    if (this.platform.platforms() && this.platform.platforms().length > 0) {
      platforms = this.platform.platforms().join(',');
    }

    options.platforms = platforms;

    // this.apiService.post({
    //   resource: 'logger',
    //   payload: {
    //     eventName: eventName,
    //     metadata: options,
    //   },
    // }).subscribe((res: any) => {
    //   console.log('res = ', res);
    // }, (err) => {
    //   console.error('err = ', err);
    // });
  }

  public update(settings?) {
    // alert('boot: intercomSettings.hide_default_launcher = ' + settings.hide_default_launcher);
    console.log(jsFilename + 'update = ', settings);
    const intercom = (<any>window).Intercom;
    if (intercom) {
      if (settings) {
        intercom('update', settings);
      } else {
        intercom('update');
      }
    }
  }

  public boot(settings) {
    // alert('boot: intercomSettings.hide_default_launcher = ' + settings.hide_default_launcher);
    // console.log(jsFilename + 'boot = ', settings);
    const intercom = (<any>window).Intercom;
    if (intercom) {
      intercom('boot', settings);
    }
  }
}
