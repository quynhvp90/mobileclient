import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { BroadcastService, GlobalService, SettingsService, UserService } from '../../services';
import { IBannerData } from '../../services/settings.service';
import { Storage } from '@ionic/storage';
import { IUserDocument } from '../../models/user/user.interface';
import { NavController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

const jsFilename = 'banner-ad: ';

@Component({
  selector: 'banner-ad',
  templateUrl: './banner-ad.component.html',
  styleUrls: ['./banner-ad.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BannerAdComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  @Input() public mode = null;

  public bannerAdItem: IBannerData = null;
  public foundUser: IUserDocument;

  private loginAd: IBannerData = {
    title: 'LOGIN',
    body: 'It is HIGHLY recommended that you login/create an account so that your data is saved.',
    colors: {
      background: '#9b2424',
      font: '#ffffff',
    },
    button: {
      label: 'GO TO SETTINGS',
      link: 'settings',
    },
  };

  constructor(
    private globalService: GlobalService,
    private storage: Storage,
    private userService: UserService,
    private settingService: SettingsService,
    private broadcastService: BroadcastService,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
  ) {
    const $this = this;

    this.foundUser = this.userService.user;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';
      if (msg.name === 'login') {
        $this.foundUser = this.userService.user;
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    if (!this.mode) {
      this.storage.get('rated').then((hasRated) => {
        if (hasRated) {
          $this.mode = 'support';
        } else {
          $this.mode = 'rate';
        }
      });
    }

    const lastbanner = (new Date()).getDate();

    this.storage.get('lastbanner').then((storedLastBanner) => {
      if (lastbanner !== storedLastBanner) {
        $this.getNextBannerAd();
        this.storage.set('lastbanner', lastbanner);
      }
    });
  }

  private getNextBannerAd() {
    const $this = this;
    const msgHdr = jsFilename + 'getNextBannerAd: ';
    console.log(msgHdr);
    this.settingService.getBannerData()
    .subscribe((bannerData) => {
      if (bannerData && bannerData.length > 0) {
        const randomIndex = Math.floor(Math.random() * bannerData.length);
        $this.bannerAdItem = bannerData[randomIndex];
        $this.bannerAdItem.body = <string> $this.sanitizer.bypassSecurityTrustHtml($this.bannerAdItem.body);
      }

      if (this.foundUser && this.foundUser.isTempAccount) {
        if (this.foundUser.stats && this.foundUser.stats.logins > 3) {
          $this.bannerAdItem = $this.loginAd;
        }
      }
    });
  }

  public ngOnDestroy() {
    const $this = this;

    $this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public adClicked() {
    const $this = this;
    if ($this.bannerAdItem) {
      const link = $this.bannerAdItem.button.link;
      if (link.indexOf('http') >= 0) {
        window.open(link);
      } else if (link.indexOf('support@logreps.com') >= 0) {
        window.location.href = 'mailto:support@logreps.com';
      } else if (link === 'challenges') {
        $this.navCtrl.navigateRoot('tabs/challenges');
      } else if (link === 'settings') {
        $this.navCtrl.navigateRoot('tabs/settings');
      } else if (link === 'invite') {
        $this.navCtrl.navigateForward('tabs/social', {
          queryParams: {
            invite: true,
          },
        });
      } else {
        console.error('unknown link for bannerAdItem = ', $this.bannerAdItem);
      }
    }

    $this.bannerAdItem = null;
  }

  public rateApp() {
    if (this.globalService.isCapacitor) {
      if (this.globalService.isAndroid) {
        window.open('market://details?id=com.logreps.app');
      } else {
        window.open('https://apps.apple.com/app/id/id972446701?action=write-review');
      }
    } else {
      window.open('https://apps.apple.com/app/id/id972446701?action=write-review');
    }
    this.storage.set('rated', true);
    this.mode = 'support';
  }
}
