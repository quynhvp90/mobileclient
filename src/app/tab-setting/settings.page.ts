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

const jsFilename = 'SettingsPage: ';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
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
      resource: 'v1/version',
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
        // $this.foundUser = this.userService.user;
        // this.setSubscription();
      }
    });
    this.subscriptions.push(subscription);

    this.platform.ready().then(() => {
      this.isCapacitor = this.platform.is('capacitor');
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
