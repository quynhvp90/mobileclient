/// <reference path="../../../../node_modules/@types/intro.js/index.d.ts" />
import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, NgZone, ViewEncapsulation } from '@angular/core';
import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  IonicAlertService,
  UserService,
  WorkoutService,
  TipsService,
  ChallengeService,
  GlobalService,
} from '../../shared/services';

import * as moment from 'moment';
moment.locale('en3', {
  calendar: {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: 'dddd, MMM Do, YYYY',
    nextWeek: 'dddd, MMM Do, YYYY',
    sameElse: 'dddd, MMM Do, YYYY',
  },
});

moment.locale('en4', {
  calendar: {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: 'MMM Do, YYYY',
    nextWeek: 'MMM Do, YYYY',
    sameElse: 'MMM Do, YYYY',
  },
});

import { IonItemSliding, MenuController, LoadingController, NavController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { IActivityDocument } from '../../shared/models/activity/activity.interface';

import {
  ActivatedRoute,
} from '@angular/router';
import { WorkoutListModalComponent } from '../../workouts/workout-modals/workout-list/workout-list-modal.component';
import { ActivityEditModalComponent } from '../activity-modals/activity-edit-modal/activity-edit-modal.component';
import { IUserDocument } from '../../shared/models/user/user.interface';

import { UserHealthComponent } from 'src/app/shared/components/user-health/user-health.component';
import { ShareOptionsModal } from 'src/app/shared/modal/share-options/share-options-modal';

@Component({
  selector: 'activity-list-all',
  templateUrl: './activity-list-all.component.html',
  styleUrls: ['./activity-list-all.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityListAllComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];
  private intervalCheckNewDay = null;

  public foundUser: IUserDocument = null;
  public activities: IActivityDocument[] = [];
  public subheaderDate = moment().format('YYYYMMDD');
  public workoutName = 'LogReps.com';
  public workoutIcon = 'pushup';
  public dashboardSubHeader = 'Today';
  public showNaggingBanner = false;
  public showToggleWorkout = false;
  private lastDateCheck = new Date();
  public loading = true;

  public caloriesBurned = 0;

  constructor(
    private storage: Storage,
    public activityService: ActivityService,
    private activityLogService: ActivityLogService,
    public workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    public tipsService: TipsService,
    public userService: UserService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private route: ActivatedRoute,
    private zone: NgZone,
    private navCtrl: NavController,
    private ionicAlertService: IonicAlertService,
    private modalController: ModalController,
    private menu: MenuController,
  ) {
    this.foundUser = this.userService.user;
  }

  public ngOnInit() {
    const $this = this;

    this.init();

    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        this.getActivities();
      } else if (msg.name === 'update-screen') {
        this.zone.run(() => {
          $this.getActivities();
        });
      } else if (msg.name === 'workout-deleted') {
        if (msg.message.workout._id === $this.workoutService.getActiveWorkout()._id) {
          $this.updateTitle();
          $this.getActivities();
          $this.showToggleWorkout = true;
        }
      } else if (msg.name === 'workout-selected') {
        $this.showToggleWorkout = false;
      } else if (msg.name === 'login') {
        $this.foundUser = this.userService.user;
      } else if (msg.name === 'updated-workouts') {
      } else if (msg.name === 'created-workout') {
        $this.showToggleWorkout = true;
      } else if (msg.name === 'activity-log-update') {
        $this.updateProgress();
      } else if (msg.name === 'change-date') {
        this.dashboardSubHeader = moment().locale('en3').add(this.activityService.dateOffset, 'days').calendar();
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams['mode'] && queryParams['mode'] === 'reload') {
          // reload data
          this.getActivities();
        }
      });
    this.subscriptions.push(subscription);
    $this.checkNewDay();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    clearInterval(this.intervalCheckNewDay);
  }

  public ionViewWillEnter() {
    const $this = this;
    $this.broadcastService.broadcast('update-invites');
    $this.getActivities();
    $this.dashboardSubHeader = moment().locale('en3').add(this.activityService.dateOffset, 'days').calendar();
  }

  public ionViewDidEnter() {
  }

  private init() {
    const $this = this;

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      this.getActivities();
    });
  }

  private updateProgress() {
    const $this = this;
    $this.caloriesBurned += 1;
  }

  private updateTitle() {
    const $this = this;
    const activeWorkout = $this.workoutService.getActiveWorkout();
    if (!activeWorkout || !activeWorkout.workoutType || activeWorkout.workoutType === 'personal') {
      if (!activeWorkout || activeWorkout.name === 'default') {
        $this.workoutName = 'LogReps.com';
        $this.workoutIcon = 'pushup';
      } else {
        $this.workoutName = activeWorkout.name;
        $this.workoutIcon = activeWorkout.icon;
      }
    } else {
      $this.workoutName = activeWorkout.name;
      $this.workoutIcon = activeWorkout.icon;
    }
  }

  private getActivities() {
    const $this = this;
    if ($this.loader) {
      $this.loader.present();
    }
    $this.updateTitle();

    const fromDateDT = new Date();
    fromDateDT.setDate(fromDateDT.getDate() + this.activityService.dateOffset);

    const toDateDT = new Date();
    toDateDT.setDate(toDateDT.getDate() + this.activityService.dateOffset);

    const fromDate = (fromDateDT).setHours(0, 0, 0, 0);
    const toDate = (toDateDT).setHours(23, 59, 59, 0);
    const activeWorkout = this.workoutService.getActiveWorkout();
    if (!activeWorkout || !activeWorkout._id) {
      console.error('no activeWorkout = ', activeWorkout);
      return; // todo - create workouts for user
    }

    const workoutIds = [];

    $this.workoutService.workouts.forEach((workout) => {
      workoutIds.push(workout._id);
    });

    $this.loading = true;
    const subscription = this.activityService.getActivities(workoutIds, fromDate, toDate, {}, {
      includeDupes: true,
    }).subscribe((data) => {
      $this.loading = false;
      $this.activities = [];
      data.items.forEach((item) => {
        let isDupe = false;
        $this.activities.forEach((foundActivity) => {
          if (foundActivity.label === item.label) {
            isDupe = true;
            if (item.goal > foundActivity.goal) {
              foundActivity.goal = item.goal;
            }
            if (item.lookup.count > foundActivity.lookup.count) {
              foundActivity.lookup.count = item.lookup.count;
            }
            if (item.lookup.calories > foundActivity.lookup.calories) {
              foundActivity.lookup.calories = item.lookup.calories;
            }
          }
        });
        if (!isDupe) {
          $this.activities.push(item);
        }
      });

      if ($this.activities.length > 0) {
        console.log('sorting');
        $this.activities.sort((a, b) => {
          if (a.lookup.count > b.lookup.count) {
            return -1;
          }
          if (a.lookup.count < b.lookup.count) {
            return 1;
          }
          return 0;
        });
      }

      if ($this.loader) {
        $this.loader.dismiss();
      }

      // setTimeout(() => {
      //   $this.introMethod();
      // }, 100);
    });
    this.subscriptions.push(subscription);
  }

  async createActivityLog(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;

    await slidingActivities.close();

    $this.loader.present();
    const subscription = $this.activityLogService.postActivityLog(activity, activity.lastLogCount).subscribe((activityLog) => {
      $this.loader.dismiss();
      activity.lookup.count += activity.lastLogCount;
      activity.lookup.calories += activityLog.calories;

      $this.storage.set('quickAdd', 'true');

      $this.broadcastService.broadcast('activity-log-update', {
        action: 'add',
        activityLog: activityLog,
        name: 'activity-log-update',
        activityId: activity._id,
        count: activity.lastLogCount,
      });
    });
    this.subscriptions.push(subscription);
  }

  public shareProgress() {
    const $this = this;

    let label = $this.userService.user.publicName;
    if (label === 'Someone') {
      label = 'My';
    } else {
      label += '\'s';
    }

    const fromDateDT = new Date();
    fromDateDT.setDate(fromDateDT.getDate() + this.activityService.dateOffset);
    const title = label + ' workout for ' + moment(fromDateDT).format('DDMMM');

    this.modalController.create({
      component: ShareOptionsModal,
      componentProps: {
        foundActivities: $this.activities,
        title: title,
      },
    }).then((modal) => {
      modal.present();
    });

  }

  public async createActivity() {
    const $this = this;

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ActivityEditModalComponent,
        componentProps: {
          mode: 'new',
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
      }
    });
    await modal.present();
  }

  async viewDetail(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;
    await slidingActivities.close();
    $this.navCtrl.navigateForward('/tabs/activities/detail/' + activity._id.toString());
  }

  async editActivity(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;
    await slidingActivities.close();

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ActivityEditModalComponent,
        componentProps: {
          mode: 'edit',
          foundActivity: activity,
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
      }
    });
    await modal.present();
  }

  async deleteActivity(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;
    await slidingActivities.close();
    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to remove the "' + activity.label + '" exercise?', () => {
      const subscription = $this.activityService.deleteActivity(activity._id.toString()).subscribe((isDeleted) => {
        if (isDeleted) {
          // display process
          const index = $this.activities.indexOf(activity);
          if (index > -1) {
            setTimeout(() => { $this.activities.splice(index, 1); }, 100);
          }
        }
      });
      $this.subscriptions.push(subscription);
    });
  }

  public updateHeaderWorkoutDisplay() {
    // const workoutDisplay = workoutService.getWorkoutByDateDisplay(logDate),
    // const workout = workoutService.getWorkoutByDate(logDate);
    // $scope.dashboardHeader = workoutDisplay;
    // activityService.updateActiveActivities(workout);
  }

  public changeHeaderDate(delta: number) {
    let logDate = '';

    if ((this.activityService.dateOffset + delta) <= 0) {
      this.activityService.dateOffset += delta;

      logDate = moment().add(this.activityService.dateOffset, 'days').format('YYYYMMDD');
      this.subheaderDate = logDate;

      this.dashboardSubHeader = moment().locale('en3').add(this.activityService.dateOffset, 'days').calendar();
      this.updateHeaderWorkoutDisplay();
      this.getActivities();
      this.broadcastService.broadcast('change-date');
    }
  }

  public async openUserHealth() {
    const $this = this;

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: UserHealthComponent,
        componentProps: {
        },
      });

    modal.onDidDismiss().then(() => {
      $this.activityService.updateProgress();
    });

    await modal.present();
  }

  private isValidEmail(email: string): boolean {
    // tslint:disable
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // tslint:enable

    return re.test(email);
  }
  private checkTimeUsed() {
    // check user has right email
    const currentUser = this.userService.user;
    const isHasEmail = this.isValidEmail(currentUser.email);

    // check user used more than 7 days
    let usedDays = 0;
    const now = moment().format('YYYYMMDD');
    const firstTimeUsed = moment(localStorage.getItem('firstTime'));
    usedDays = moment(now).diff(firstTimeUsed, 'days');

    if (!isHasEmail && usedDays > 7) {
      return true;
    }
    return false;
  }

  private async checkShowListWorkout() {
    const todayWorkout = localStorage.getItem('todayWorkout');
    const listWorkout = this.workoutService.workouts;
    if (!todayWorkout && listWorkout.length > 1) {
      // show popup choose workout
      const modal: HTMLIonModalElement =
        await this.modalController.create({
          component: WorkoutListModalComponent,
        });

      modal.onDidDismiss().then((result) => {
        if (result !== null) {
          if (result.data) {
            // updated activate workout -> reload data
            this.updateHeaderWorkoutDisplay();
            this.getActivities();
          }

        }
      });
      await modal.present();
    }
  }

  private checkNewDay() {
    const d = new Date();
    const lastDate = this.lastDateCheck.getDate();
    const currDate = d.getDate();
    // test
    // const testBanner = moment().add(8, 'days').date();
    if (currDate !== lastDate) {
      this.getActivities();
      // new day - reset selected workout
      localStorage.setItem('todayWorkout', '');
      // check show list workout
      this.checkShowListWorkout();

      // save first time used app
      const firstTimeUsed = localStorage.getItem('firstTime');
      if (!firstTimeUsed || firstTimeUsed.length === 0) {
        localStorage.setItem('firstTime', moment().format('YYYYMMDD'));
      }
      this.showNaggingBanner = this.checkTimeUsed();
    }
    this.lastDateCheck = d;
  }

  public gotoSetting() {
    this.navCtrl.navigateForward('/tabs/settings');
  }

  public toggleWorkout() {
    this.menu.toggle();
  }

  public closeChangeWorkoutTip() {
    this.showToggleWorkout = false;
  }
}
