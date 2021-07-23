import { Injectable, Optional, SkipSelf, PlatformRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { CONFIG } from '../../config';
const filename = 'globalservice: ';

@Injectable()
export class GlobalService {

  public isLoggedIn = false;

  public logs: string[] = [];

  public isMobile = false;
  public isDesktop = false;
  public isCordova = false;
  public isCapacitor = false;
  public isIOS = false;
  public isAndroid = false;
  public websiteUrl = null;
  public platforms: string[] = [];
  public version  = '';

  public token: string = null;

  public lastSeenNotification: Date = null;
  public lastSeenChallenge: Date = null;

  constructor(
    @Optional() @SkipSelf() prior: GlobalService,
    private platform: Platform,
  ) {
    if (prior) { return prior; }
    const msgHdr = 'constructor: ';

    this.platform.ready().then(() => {
      console.log('platform ready');
      this.isMobile = this.platform.is('mobile');
      this.isDesktop = this.platform.is('desktop');
      this.isCordova = this.platform.is('cordova');
      this.isCapacitor = this.platform.is('capacitor');
      this.isIOS = this.platform.is('ios');
      this.isAndroid = this.platform.is('android');
      this.websiteUrl = environment.website;
      this.platforms = this.platform.platforms();
      this.version = CONFIG.version;
      // console.log(msgHdr + 'isMobile = ', this.isMobile);
      // console.log(msgHdr + 'isDesktop = ', this.isDesktop);
      // console.log(msgHdr + 'isCordova = ', this.isCordova);
      // console.log(msgHdr + 'isCapacitor = ', this.isCapacitor);
    });
  }
}
