declare var introJs: any;
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
  PostService,
  ShareService,
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
  Router, ActivatedRoute,
} from '@angular/router';
import { WorkoutListModalComponent } from '../../workouts/workout-modals/workout-list/workout-list-modal.component';
import { IChallengeDocument, IChallengeDocumentHydrated } from '../../shared/models/challenge/challenge.interface';
import { WorkoutEditModalComponent } from '../../workouts/workout-modals/workout-edit-modal/workout-edit-modal.component';
import { ActivityEditModalComponent } from '../activity-modals/activity-edit-modal/activity-edit-modal.component';
import { IUserDocument } from '../../shared/models/user/user.interface';
import { IWorkoutDocumentHydrated } from 'src/app/shared/models/workout/workout.interface';

import { UserHealthComponent } from 'src/app/shared/components/user-health/user-health.component';
import { ShareOptionsModal } from 'src/app/shared/modal/share-options/share-options-modal';

const jsFilename = 'activity-list: ';

@Component({
  selector: 'activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityListComponent implements OnInit, OnDestroy {
  private activityId = '';
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public foundUser: IUserDocument = null;
  public muscles = '';
  public muscleMode = 'view';
  public activities: IActivityDocument[] = [];
  public foundChallenges: IChallengeDocumentHydrated[] = [];
  public notHasLicense = false;
  public workoutName = 'LogReps.com';
  public workoutIcon = 'pushup';
  public dashboardSubHeader = 'Today';
  public showToggleWorkout = false;
  private lastDateCheck = new Date();
  public loading = true;

  private intervalCheckNewDay: any = null;

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
    private challengeService: ChallengeService,
  ) {
    this.foundUser = this.userService.user;
  }

  public ngOnInit() {
    const $this = this;

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
      } else if (msg.name === 'update-challenges') {
        $this.getChallenges();
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

    const firstTimeUsed = localStorage.getItem('firstTime');
    if (!firstTimeUsed || firstTimeUsed.length === 0) {
      localStorage.setItem('firstTime', moment().format('YYYYMMDD'));
    }

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      this.getActivities();
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    if (this.intervalCheckNewDay) {
      clearInterval(this.intervalCheckNewDay);
    }
  }

  public ionViewWillEnter() {
    const $this = this;
    $this.broadcastService.broadcast('update-invites');
    if ($this.checkNewDay()) {
      $this.getActivities(false);
    }

    if (this.intervalCheckNewDay) {
      clearInterval(this.intervalCheckNewDay);
    }

    $this.intervalCheckNewDay = setInterval(() => {
      $this.checkNewDay();
    }, 1000);

    $this.dashboardSubHeader = moment().locale('en3').add(this.activityService.dateOffset, 'days').calendar();
  }

  public ionViewWillLeave() {
    if (this.intervalCheckNewDay) {
      console.log('clearing interval');
      clearInterval(this.intervalCheckNewDay);
    }
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

  private loadMuscles(listMuscles: string) {
    const $this = this;
    let musclesArray = listMuscles.substring(0, listMuscles.length - 1).split(',');
    musclesArray = _.uniq(musclesArray);
    $this.muscles = musclesArray.join(',');
    $this.broadcastService.broadcast('updatedMuscles', {
      muscles: $this.muscles,
      mode: 'view', // only view muscles on list activities
    });
  }

  private getChallenges() {
    const $this = this;
    this.challengeService.getChallenges({}).subscribe((data) => {
      $this.foundChallenges = <IChallengeDocumentHydrated[]> data;
    });
  }

  private getActivities(isDateChange?: boolean) {
    const $this = this;
    if ($this.loader) {
      $this.loader.present();
    }

    $this.getChallenges();

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

    const workoutId = activeWorkout._id;
    const workoutIds = [workoutId];

    // workoutIds = [];
    // $this.workoutService.workouts.forEach((workout) => {
    //   workoutIds.push(workout._id);
    // });

    // console.log('from date before = ', fromDate);
    // fromDate = fromDate - 10 * 60 * 60 * 1000;
    // console.log('from date after = ', fromDate);
    // toDate = toDate - 10 * 60 * 60 * 1000;

    $this.loading = true;
    const subscription = this.activityService.getActivities(workoutIds, fromDate, toDate, {}, {
      includeDupes: true,
    }).subscribe((data) => {
      $this.loading = false;
      if (isDateChange) { // update existing data
        $this.activities.forEach((activity) => {
          data.items.forEach((item) => {
            if (item._id === activity._id) {
              activity.lookup = item.lookup;
            }
          });
        });

        $this.broadcastService.broadcast('all-activities-updated');
      } else { // full reload
        $this.activities = data.items;
      }
      let listMuscles = '';
      $this.activities.forEach((activity) => {
        $this.activityId = activity._id;
        if (activity.muscles && activity.muscles.length > 0) {
          listMuscles = listMuscles + activity.muscles + ',';
        }
      });
      $this.loadMuscles(listMuscles);

      if ($this.loader) {
        $this.loader.dismiss();
      }

      // setTimeout(() => {
      //   $this.introMethod();
      // }, 100);
    });
    this.subscriptions.push(subscription);
  }

  public async editWorkout() {
    const $this = this;

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: WorkoutEditModalComponent,
        componentProps: {
          foundWorkout: $this.workoutService.getActiveWorkout(),
        },
      });
    modal.onDidDismiss().then(() => {
      // workout updated on broadcast
    });
    await modal.present();
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

  async createActivityLog(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;

    await slidingActivities.close();
    if (activity && activity._id) {
      $this.activityId = activity._id;
    }

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
        activityId: $this.activityId,
        count: activity.lastLogCount,
      });
    });
    this.subscriptions.push(subscription);
  }

  public viewChallenge(foundChallenge: IChallengeDocument) {
    const $this = this;
    $this.navCtrl.navigateForward('/tabs/challenges/detail/' + foundChallenge._id.toString());
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

  public changeHeaderDate(delta: number) {
    if ((this.activityService.dateOffset + delta) <= 0) {
      this.activityService.dateOffset += delta;
    }
    this.setActivityDate();
  }

  private setActivityDate() {
    this.dashboardSubHeader = moment().locale('en3').add(this.activityService.dateOffset, 'days').calendar();
    this.getActivities(true);
    this.broadcastService.broadcast('change-date');
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

  private checkNewDay() {
    const lastDate = this.lastDateCheck.getDate();
    const currDate = (new Date()).getDate();
    // if (Math.random() > 0.8) {
    //   currDate += 1;
    // }
    // console.log(currDate + ' ? ' + lastDate);

    const isSameDay = (currDate === lastDate);
    if (!isSameDay) {
      this.activityService.dateOffset = 0;
      this.setActivityDate();
    }

    this.lastDateCheck = new Date();
    return isSameDay;
  }

  public handlerPurchase(isPurchased) {
    this.notHasLicense = !isPurchased;
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
