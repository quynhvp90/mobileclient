import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, HealthService, ToastService, IonicAlertService, GlobalService, ActivityLogService, ActivityService } from '../../../shared/services';
import { IUserDocument } from '../../models/user/user.interface';
import { IActivityLogDocument } from '../../models/activity-log/activity-log.interface';
const jsFilename = 'user-health: ';

@Component({
  selector: 'user-health',
  templateUrl: './user-health.component.html',
  styleUrls: ['./user-health.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UserHealthComponent implements OnDestroy, OnInit {
  private subscriptions = [];
  public user: IUserDocument;
  public appleHealthKitEnabled = false;
  public googleFitEnabled = false;
  public showLogs = false;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    public healthService: HealthService,
    public activityService: ActivityService,
    public globalService: GlobalService,
    public activityLogService: ActivityLogService,
    private ionicAlertService: IonicAlertService,
  ) {
    // const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    //   if (msg.name === 'login') {
    //     $this.user = this.userService.user;
    //     this.initData();
    //   }
    // });
    // this.subscriptions.push(subscription);
  }

  public ngOnInit() {
    this.initData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private initData() {
    this.user = this.userService.user;
    if (!this.user.health) {
      this.user.health = {
        appleHealthKitEnabled: false,
        googleFitEnabled: false,
        weight: 150,
        weightUnit: 'lbs', // lbs, kg
        calorieOverrides: [],
      };
    }

    if (!this.user.health.weight) {
      this.user.health.weight = 150;
    }
    if (!this.user.health.weightUnit) {
      this.user.health.weightUnit = 'lbs';
    }

    this.appleHealthKitEnabled = this.userService.user.health.appleHealthKitEnabled;
    this.googleFitEnabled = this.userService.user.health.googleFitEnabled;

    this.activityLogService.getActivityLogs(null, null, {
      isReload: true,
    }).subscribe(() => {
      console.log('done');
    });
  }

  public loadMore() {
    this.activityLogService.getActivityLogs(null, null, {
      isReload: false,
    }).subscribe(() => {
      console.log('done');
    });
  }

  public syncActivityLog(foundActivityLog: IActivityLogDocument) {
    foundActivityLog.lookups.syncing = true;

    this.activityService.getActivity(foundActivityLog.activityId).subscribe((foundActivity) => {
      this.healthService.postActivityLog(
        foundActivity,
        foundActivityLog,
        foundActivityLog.count,
        new Date(foundActivityLog.created),
        foundActivityLog.duration,
        foundActivityLog.calories,
      ).then((res) => {
        if (res && res === 'done') {
          foundActivityLog.lookups.syncing = false;
          if (!foundActivityLog.health) {
            foundActivityLog.health = {};
          }
          foundActivityLog.health.status = 'success';
          foundActivityLog.health.syncDate = new Date();
        }
      }, (err) => {
        foundActivityLog.lookups.syncing = false;
        if (!foundActivityLog.health) {
          foundActivityLog.health = {};
        }
        foundActivityLog.health.status = err;
      });

    });
  }

  public saveAndClose() {
    const $this = this;
    console.log('$this.user.health.appleHealthKitEnabled = ', $this.user.health.appleHealthKitEnabled);
    let weight = this.user.health.weight.toString();
    weight = weight.replace(/\,/, '.');
    const regex = /^[0-9]+(\.)*[0-9]*$/; // 40, 40.5

    const testResults = regex.test(weight);
    this.user.health.weight = parseFloat(weight);

    if (!testResults) {
      this.ionicAlertService.presentAlert('Sorry', 'That does not appear to be a valid number');
      return;
    }

    const subscription = this.userService.updateUser({
      _id: this.user._id,
      health: this.user.health,
    }).subscribe((result) => {
      if (result) {
        // setTimeout(() => {
        //   $this.initData();
        //   this.toastService.activate('User profile updated', 'success');
        //   // this.broadcastService.broadcast('reload-data');
        // }, 10);
      }
      this.modalController.dismiss();
    });
    this.subscriptions.push(subscription);
  }

  public toggleHealthKit() {
    const $this = this;
    console.log('$this.user.health.appleHealthKitEnabled = ', $this.user.health.appleHealthKitEnabled);
    if (!$this.appleHealthKitEnabled) {
      $this.user.health.appleHealthKitEnabled = false;
      return;
    }

    if (!$this.globalService.isIOS) {
      $this.ionicAlertService.presentAlert('Sorry - You need to be on an Apple device that supports HealthKit');
      setTimeout(() => {
        $this.user.health.appleHealthKitEnabled = false;
        $this.appleHealthKitEnabled = false;
      }, 100);
      return;
    }

    $this.activateAppleHealthKit();
  }

  public activateAppleHealthKit() {
    const $this = this;
    $this.user.health.appleHealthKitEnabled = true;
    this.healthService.activateAppleHealthKit()
    .then(() => {
      $this.user.health.appleHealthKitEnabled = true;
    })
    .catch(() => {
      $this.ionicAlertService.presentAlert('Sorry - there was an error trying to connect to Apple HealthKit', 'Please check the AppStore for an update to LogReps.');
      setTimeout(() => {
        $this.user.health.appleHealthKitEnabled = false;
        $this.appleHealthKitEnabled = false;
      }, 100);
    });
  }

  public toggleGoogleFit() {
    const $this = this;
    console.log('$this.user.health.googleFitEnabled = ', $this.user.health.googleFitEnabled);
    if (!$this.googleFitEnabled) {
      $this.user.health.googleFitEnabled = false;
      return;
    }

    if (!$this.globalService.isAndroid) {
      $this.ionicAlertService.presentAlert('Sorry - You need to be on an Android device that supports GoogleFit');
      setTimeout(() => {
        $this.user.health.googleFitEnabled = false;
        $this.googleFitEnabled = false;
      }, 100);
      return;
    }

    $this.activateGoogleFit();
  }

  public activateGoogleFit() {
    const $this = this;
    $this.user.health.googleFitEnabled  = true;
    this.healthService.activateGoogleFit()
    .then(() => {
      $this.user.health.googleFitEnabled = true;
    })
    .catch(() => {
      $this.ionicAlertService.presentAlert('Sorry - there was an error trying to connect to GoogleFit', 'Please check the Play Store for an update to LogReps.');
      setTimeout(() => {
        $this.user.health.appleHealthKitEnabled = false;
        $this.appleHealthKitEnabled = false;
      }, 100);
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
