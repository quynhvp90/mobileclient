import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService, BroadcastService, HealthService, GlobalService, IonicAlertService, ShareService } from '../shared/services';
import { CONFIG } from '../config';
import { environment } from '../../environments/environment';
import { ApiService, ISetting } from '../shared/services/api.service';
import { Subscription } from 'rxjs/Subscription';
import { Storage } from '@ionic/storage';
import { Platform, ModalController } from '@ionic/angular';
import { UserHealthComponent } from '../shared/components/user-health/user-health.component';
import { UserWeeklyReportComponent } from '../shared/components/user-weeklyreport/user-weeklyreport.component';
import { UserPrivacyComponent } from '../shared/components/user-privacy/user-privacy.component';
import { IUserDocument, IUserPublic } from '../shared/models/user/user.interface';
import { NotificationsComponent } from '../shared/modal/notifications/notifications.component';
import { ExportDataModal } from '../shared/modal/export-data/export-data-modal';
import { FeatureSuggestionsComponent } from '../shared/components/feature-suggestions/feature-suggestions.component';
// import { Deploy } from 'cordova-plugin-ionic';

const jsFilename = 'tab3.page: ';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit, OnDestroy {
  public version = CONFIG.version;
  public apiVersion = 'tbd';
  public apiEndpoint = environment.api;
  public subscribed = false;
  public isCapacitor = false;
  public notHasLicense = true;
  private subscriptions: Subscription[] = [];

  public isLocalDev = (environment.api === 'http://localhost:4000');

  public foundUser: IUserDocument = null;

  public ionicConfig = {
    deployChannel: '',
    isBeta: false,
    downloadProgress: 0,
    downloadStarted: false,
    updateAvailable: false,
    updateSnapshot: '',
    msg: '',
  };

  constructor(
    private apiService: ApiService,
    private platform: Platform,
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    public globalService: GlobalService,
    private ionicAlertService: IonicAlertService,
    private shareService: ShareService,
    private userService: UserService) {

    const $this = this;
    $this.foundUser = this.userService.user;
  }

  public ngOnInit(): void {
    // this.authenticationService.logout();
    const $this = this;

    this.apiService.get({
      resource: 'version',
    }).subscribe((res) => {
      console.log('res = ', res);
      $this.apiVersion = res.toString();
    });

    let subscription = this.userService.getCurrentUser().subscribe((user) => {
      console.log('getCurrentUser: res = ', user);
      // if (user.license) {
      //   this.notHasLicense = false;
      // }
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';
      if (msg.name === 'login') {
        $this.foundUser = this.userService.user;
        this.setSubscription();
      }
    });
    this.subscriptions.push(subscription);

    this.platform.ready().then(() => {
      this.isCapacitor = this.platform.is('capacitor');
    });

    this.setSubscription();

    // this.authenticationService.logout();
    this.checkChannel();
  }

  private setSubscription() {
    this.subscribed = this.userService.user.subscribed;
    if (this.foundUser.isTempAccount) {
      this.subscribed = false;
    }
  }

  public updateSubcription(event: any) {
    if (this.foundUser.isTempAccount) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.ionicAlertService.presentAlert('You must sign in (for FREE) to configure your weekly reports');
      return;
    }
    this.userService.patch({
      action: 'update-subscription',
      subscribed: !this.subscribed, // save the opposite as will toggle
    }).subscribe((res) => {
      console.log('res = ', res);
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public async openUserHealth() {
    const $this = this;
    const msgHdr = jsFilename + 'openUserHealth: ';

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: UserHealthComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then((resp) => {
      console.log(msgHdr + 'resp = ', resp);
    });

    await modal.present();
  }

  public async openPrivacy() {
    const $this = this;
    const msgHdr = jsFilename + 'openPrivacy: ';

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: UserPrivacyComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then((resp) => {
      console.log(msgHdr + 'resp = ', resp);
    });

    await modal.present();
  }

  public async openFeatureSuggestions() {
    const $this = this;
    const msgHdr = jsFilename + 'openFeatureSuggestions: ';

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: FeatureSuggestionsComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then((resp) => {
      console.log(msgHdr + 'resp = ', resp);
    });

    await modal.present();
  }

  public async openWeeklyReport() {
    const $this = this;
    const msgHdr = jsFilename + 'openWeeklyReport: ';

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: UserWeeklyReportComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then((resp) => {
      console.log(msgHdr + 'resp = ', resp);
    });

    await modal.present();
  }

  public async exportData() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ExportDataModal,
      });
    modal.onDidDismiss().then((detail) => {
      console.log('detail = ', detail);
      if (detail !== null && detail.data !== 'close') {

      }
    });
    await modal.present();
  }

  public async openNotifications() {
    const $this = this;
    const msgHdr = jsFilename + 'openNotifications: ';

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: NotificationsComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then((resp) => {
      console.log(msgHdr + 'resp = ', resp);
    });

    await modal.present();
  }

  private checkUpdate() {
    const msgHdr = jsFilename + 'checkUpdate: ';
    const $this = this;

    // Deploy.checkForUpdate().then((update) => {
    //   $this.ionicConfig.updateAvailable = update.available;
    //   $this.ionicConfig.updateSnapshot = update.snapshot;
    // });
  }

  private checkChannel() {
    const msgHdr = jsFilename + 'checkChannel: ';
    const $this = this;
    try {
      // $this.ionicConfig.msg = 'get configuration';
      // Deploy.getConfiguration().then((config) => {
      //   console.log(msgHdr + 'config = ', config);
      //   if (config) {
      //     $this.ionicConfig.deployChannel = config.channel;
      //     $this.ionicConfig.isBeta = (config.channel === 'Beta');
      //   } else {
      //     console.log(msgHdr + 'no config found');
      //   }
      // }, (err) => {
      //   $this.ionicConfig.msg = err;
      //   $this.ionicConfig.msg = 'err = ' + err;
      // });
    } catch (err2) {
      console.error(msgHdr + 'err2 = ', err2);
      $this.ionicConfig.msg = 'err2 = ' + err2;
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      // Pro.monitoring.exception(err);
    }
  }

  public performManualUpdate() {
    const $this = this;
    $this.ionicConfig.downloadStarted = true;

    try {
      $this.ionicConfig.msg = 'checking updates';
      // Deploy.checkForUpdate().then((update) => {
      //   $this.ionicConfig.msg = 'update = ' + update;
      //   if (update.available) {
      //     $this.ionicConfig.downloadProgress = 0;

      //     $this.ionicConfig.msg = 'downloading update';
      //     Deploy.downloadUpdate((progress) => {
      //       this.ionicConfig.downloadProgress = progress;
      //     }).then(() => {
      //       $this.ionicConfig.msg = 'extracting update';
      //       Deploy.extractUpdate().then(() => {
      //         $this.ionicConfig.msg = 'reloading app';
      //         Deploy.reloadApp().then(() => {
      //           $this.ionicConfig.msg = 'done';
      //         });
      //       });
      //     });
      //   }
      // });
    } catch (err3) {
      $this.ionicConfig.msg = 'err3 = ' + err3;
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      // Pro.monitoring.exception(err);
    }

  }
}
