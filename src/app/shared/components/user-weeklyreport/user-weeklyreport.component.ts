import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, ToastService, IonicAlertService, GlobalService, StatsService } from '../../../shared/services';
const jsFilename = 'user-weeklyreport: ';
import * as moment from 'moment-timezone';

@Component({
  selector: 'user-weeklyreport',
  templateUrl: './user-weeklyreport.component.html',
  styleUrls: ['./user-weeklyreport.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UserWeeklyReportComponent implements OnDestroy, OnInit {
  private subscriptions = [];
  public subscribed = false;
  public showWarning = false;
  public timezoneGuess = null;
  public userTimezone = null;
  public runReportDate: Date = null;
  public reportLink = null;
  public zones: string[] = [];
  public weeks: {
    label: string,
    value: Date,
  }[] = [];

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private statsService: StatsService,
    public globalService: GlobalService,
    private ionicAlertService: IonicAlertService,
  ) {
    this.subscribed = this.userService.user.subscribed;
    // const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    //   if (msg.name === 'login') {
    //     $this.user = this.userService.user;
    //     this.initData();
    //   }
    // });
    // this.subscriptions.push(subscription);

    this.getData();
  }

  public ngOnInit() {
    this.zones = [];
    const zonesToIgnore = [
      'EET',
      'EST',
      'EST5EDT',
      'GMT+0',
      'GMT-0',
      'GMT0',
      'HST',
      'MET',
      'HST',
      'MST7MDT',
      'NZ-CHAT',
      'PRC',
      'PST8PDT',
      'UCT',
      'W-SU',
      'WET',
    ];
    moment.tz.names().forEach((zone) => {
      if (zone.indexOf('Etc') < 0) {
        if (zonesToIgnore.indexOf(zone) < 0) {
          this.zones.push(zone);
        }
      }
    });

    if (this.userService.user.isTempAccount) {
      this.showWarning = true;
    }
    this.userTimezone = this.userService.user.timezone;
    if (!this.userTimezone) {
      this.timezoneGuess = moment.tz.guess(true);
      this.userTimezone = this.timezoneGuess;
    }
  }

  public getData() {
    this.statsService.getStatsWeekly().subscribe((data) => {
      if (data) {
        data.forEach((item: {
          count: number,
          _id: {
            week: number,
            year: number,
          },
        }) => {
          const startOfWeek = this.getDateOfISOWeek(item._id.week, item._id.year);
          this.weeks.push({
            label: 'Week #' + item._id.week + ' of ' + item._id.year + ' - ' + startOfWeek.toLocaleDateString(),
            value: startOfWeek,
          });

          this.runReportDate = this.weeks[0].value;
        });
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public saveAndClose() {

    if (!this.userTimezone || this.userTimezone.length === 0) {
      this.ionicAlertService.presentAlert('Sorry', 'Please select a time zone');
      return;
    }

    this.userService.patch({
      action: 'update-subscription',
      subscribed: this.subscribed, // save the opposite as will toggle
      timezone: this.userTimezone,
    }).subscribe((res) => {
      if (res) {
        // setTimeout(() => {
        //   $this.initData();
        //   this.toastService.activate('User profile updated', 'success');
        //   // this.broadcastService.broadcast('reload-data');
        // }, 10);
      }
      this.modalController.dismiss();
    });
  }

  public viewReport() {
    window.open(this.reportLink);
  }

  public runReport() {
    const $this = this;
    $this.reportLink = null;
    if (!this.userTimezone || this.userTimezone.length === 0) {
      this.ionicAlertService.presentAlert('Sorry', 'Please select a time zone');
      return;
    }

    this.userService.patch({
      action: 'update-subscription',
      subscribed: this.subscribed, // save the opposite as will toggle
      timezone: this.userTimezone,
    }).subscribe((res) => {
      if (res) {
        // setTimeout(() => {
        //   $this.initData();
        //   this.toastService.activate('User profile updated', 'success');
        //   // this.broadcastService.broadcast('reload-data');
        // }, 10);
      }
      let link = $this.globalService.websiteUrl + '/api/v1/reports/weekly-report?';
      link += 'id=' + this.userService.user.publicId;
      const startDate = new Date(this.runReportDate);
      startDate.setDate(startDate.getDate() + 7);
      link += '&start-date=' + startDate.getTime();
      // http://localhost:4000/api/v1/users/5ec1e51a216dd50010cebe91/subscriptions?start-date=9/23/2020&send-email=false
      $this.reportLink = link;
      window.open($this.reportLink);
    });

  }

  async cancel() {
    await this.modalController.dismiss();
  }

  private getDateOfISOWeek(w: number, y: number) {
    const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
    const dow = simple.getDay();
    const isoWeekStart = simple;
    if (dow <= 4) {
      isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return isoWeekStart;
  }

  public updateSubcription(event: any) {
    if (this.userService && this.userService.user && this.userService.user.isTempAccount) {
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
}
