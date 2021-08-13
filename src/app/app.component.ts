
import { Component, ViewEncapsulation, NgZone } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BroadcastService } from './shared/services/broadcast.service';
import { UserService } from './shared/services/user.service';
import { Storage } from '@ionic/storage';
// import { FCM } from '@ionic-native/fcm/ngx';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { GlobalService, DeepLinkService, NotificationService } from './shared/services';

import {
  Plugins,
} from '@capacitor/core';
import { PushNotificationService } from './shared/services/push-notification.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

const { App } = Plugins;

const jsFilename = 'App: ';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  public userLoggedIn = false;

  public logs: string[] = [];

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private broadcastService: BroadcastService,
    public globalService: GlobalService,
    private userService: UserService,
    private navCtrl: NavController,
    private zone: NgZone,
    private router: Router,
    private storage: Storage,
    private deeplinkService: DeepLinkService,
    private notificationService: NotificationService,
    private pushNotificationService: PushNotificationService,
    // private fcm: FCM,
    private firebaseDynamicLinks: FirebaseDynamicLinks,
  ) {
    const msgHdr = jsFilename + 'constructor: ';

    this.initializeApp();

    try {
      this.userLoggedIn = this.userService.hasStoredToken();
      this.pushNotificationService.registerListeners();

      const $this = this;
      this.broadcastService.subjectUniversal.subscribe((msg) => {
        if (msg.name === 'login') {
          $this.userLoggedIn = true;
        } else if (msg.name === 'logout') {
          $this.userLoggedIn = false;
        }
      });
    } catch (e) {
      console.error(msgHdr + 'general error e = ', e);
    }
  }

  initializeApp() {
    const msgHdr = jsFilename + 'initializeApp: ';
    const $this = this;
    console.log(msgHdr);

    try {
      if (App) {
        console.log(msgHdr + 'isApp');
        App.addListener('appUrlOpen', (data: any) => {
          this.zone.run(() => {
            console.log(msgHdr + 'appUrlOpen data - ', data);
            if (data && data.url) {
              if (data.url.indexOf('logreps.page.link') >= 0) {
                if (data.url.indexOf('?') >= 0) { // https://logreps.page.link/?link=https://app.logreps.com/home&apn=com.logreps.app&isi=972446701&ibi=com.logreps.app&cid=8639198780632985982&_osl=https://logreps.page.link/8V2f&_fpb=CJsFEPcCGgJlbg==&_cpt=cpit&_iumenbl=1&_iumchkactval=1&_plt=1157&_uit=5067&_cpb=1
                  let tokens: string[] = data.url.split('?');
                  if (tokens.length === 2) {
                    tokens = tokens[1].split('&'); // link=https://app.logreps.com/home
                    if (tokens && tokens.length > 0) {
                      tokens.forEach((token) => {
                        if (token.indexOf('link=') === 0) {
                          const subTokens = token.split('=');
                          if (subTokens && subTokens.length === 2) {
                            let url = subTokens[1];
                            url = url.replace('https://app.logreps.com/', '');
                            $this.navCtrl.navigateForward(url);
                          }
                        }
                      });
                    }
                  }
                } else {
                  $this.deeplinkService.getDeepLink(data.url).subscribe((foundDeeplink) => {
                    console.log('foundDeeplink = ', foundDeeplink);
                    if (foundDeeplink && foundDeeplink.url) {
                      if (foundDeeplink.params && foundDeeplink.params.length > 0) {
                        let url = foundDeeplink.params[0].value;
                        url = url.replace('https://app.logreps.com/', '');
                        $this.navCtrl.navigateForward(url);
                      }
                    }
                  });
                }
              } else if (data.url.indexOf('app.logreps.com') >= 0) {
                console.log(msgHdr + 'is web link');
                const url = data.url.replace('https://app.logreps.com/', '');
                $this.navCtrl.navigateForward(url);
              }
            }
          });
        });
      }
    } catch (e) {
      console.error(msgHdr + 'error in App.addListener, e = ', e);
    }

    this.platform.ready().then(() => {
      console.log('platform ready');
      if (this.platform.is('cordova')) {
        console.log('is cordova, hiding splash screen');
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }

      if (this.platform.is('capacitor')) {
        console.log('is capacitor, hiding splash screen');
        if (Plugins) {
          console.log(msgHdr + 'hiding splash screen');
          Plugins.SplashScreen.hide();
        } else {
          console.log(msgHdr + 'unable to hide splash screen as no Plugins detected');
        }
      }

      // if ($this.globalService.isMobile) {
      //   console.log(msgHdr + '$this.isMoble = ', $this.globalService.isMobile);
      //   this.statusBar.styleDefault();
      //   this.splashScreen.hide();
      // }

      if (this.platform.is('capacitor')) {
        console.log(msgHdr + 'starting up firebase');
        $this.globalService.logs.push('starting up');
        $this.globalService.logs.push('$this.isMobile = ' + $this.globalService.isMobile);
        try {
          this.firebaseDynamicLinks.onDynamicLink()
          .subscribe((data: any) => {
            console.error(msgHdr + 'firebaseDynamicLinks = ', data);
            $this.globalService.logs.push('link received');
            $this.globalService.logs.push(JSON.stringify(data, null, 4));
            if (data.deepLink && data.deepLink.indexOf('logreps.com') >= 0) {
              const newUrl = data.deepLink.replace('https://app.logreps.com/', '');
              $this.navCtrl.navigateForward(newUrl);
            }
          }, (error:any) => {
            $this.globalService.logs.push('error');
            $this.globalService.logs.push(error.toString());
            console.error(msgHdr + 'firebaseDynamicLinks error = ', error);
          });
        } catch (e) {
          console.error(msgHdr + 'error trying to read dynamic link, e = ', e);
        }
      } else {
        console.log(msgHdr + 'capacitor not detected, not loading dynamic link');
      }
    });
  }
  public changeOrg() {
    this.router.navigate(['list-org-screen']);
    this.menu.close();
  }
  public closeMenu() {
    // this.ionMenu.close();
  }
}
