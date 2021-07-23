import { AfterViewInit, Component, Input, Output, EventEmitter, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingController, ModalController, PickerController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PersonalRecordModal } from '../../../shared/modal/personal-record/personal-record-modal';
import { IActivityLog, IActivityLogDocument } from '../../../shared/models/activity-log/activity-log.interface';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { ActivityLogService, ActivityService, BroadcastService, ILogCount, UserService, GlobalService, HealthService, IonicAlertService } from '../../../shared/services';
import { UserHealthComponent } from 'src/app/shared/components/user-health/user-health.component';
import * as moment from 'moment';
import { default as dataExercises, IExercise } from '../../../../assets/data/exercises';
import { StopWatchModal } from 'src/app/shared/modal/stop-watch/stop-watch-modal';

const jsFilename = 'AcitivtyLogComponent: ';

@Component({
  selector: 'activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ActivityLogComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public activityId: string;
  @Input() public foundActivity: IActivityDocument;
  @Input() public isModal = false;
  @Input() public autoSetDate = true;

  @Output() logged = new EventEmitter<IActivityLog>();
  public logCount: number = 0;

  public logDate = (new Date()).toString();
  public originalLogDate = (new Date()).toString();

  public showTimer = false;

  public logTime = null;
  public logDuration = 1;
  public logCaloriesPerMinute = this.healthService.defaultCaloriesPerMinutes;
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];
  public activityLogDisplay = 'reps';
  public maxDate = (new Date()).toISOString().split('T')[0];
  public minDate = (new Date((new Date).getTime() - 365 * 24 * 3600 * 1000)).toISOString().split('T')[0];

  public exercise: IExercise = null;
  public youtubeLink: SafeResourceUrl = null;

  private healthKitsEnabled = false;

  public showAdvanced = false;

  public plusLogCount = [
    { id: 1, value: 1, display :  '+1' },
    { id: 2, value: 5, display :  '+5' },
    { id: 3, value: 10, display :  '+10' },
    { id: 4, value: 25, display :  '+25' },
  ];

  public minusLogCount = [
    { id: 1, value: -1, display :  '-1' },
    { id: 2, value: -5, display :  '-5' },
    { id: 3, value: -10, display :  '-10' },
    { id: 4, value: -25, display :  '-25' },
  ];

  constructor(
    private storage: Storage,
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private pickerController: PickerController,
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private healthService: HealthService,
    private userService: UserService,
    private ionicAlertService: IonicAlertService,
    private router: Router,
  ) {
    const $this = this;
    if (this.userService.user && this.userService.user.health) {
      if (this.userService.user.health.appleHealthKitEnabled ||
        this.userService.user.health.googleFitEnabled) {
        this.healthKitsEnabled = true;
      }
    }
    console.log('this.healthKitsEnabled = ', this.healthKitsEnabled);
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
    $this.maxDate = (new Date()).toISOString().split('T')[0];
  }

  private getActivity() {
    if (this.foundActivity) {
      this.initData();
      return;
    }

    const subscription = this.activityService.getActivity(this.activityId).subscribe((foundActivity) => {
      if (foundActivity) {
        this.foundActivity = foundActivity;
        this.initData();
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit() {
    const $this = this;

    let subscription =  this.route.params.subscribe((params: Params) => {
      const activityId  = params['id'];
      if (!activityId) {
        return;
      }
      this.activityId = activityId;
      this.getActivity();
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-updated') {
        if (msg.message.activityId === $this.foundActivity._id) {
          if (msg.message.activityObject) {
            $this.foundActivity.goal = msg.message.activityObject.goal;
            $this.foundActivity.name = msg.message.activityObject.name;
            $this.foundActivity.unit = msg.message.activityObject.unit;
            $this.foundActivity.weight = msg.message.activityObject.weight;
            $this.foundActivity.logLabel = msg.message.activityObject.logLabel;
          }
        }
      }
    });
    this.subscriptions.push(subscription);

    if (this.activityId || this.foundActivity) {
      $this.getActivity();
    }

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });

    if ($this.autoSetDate) {
      let activityDate = new Date();
      console.log('this.activityService.dateOffset = ', this.activityService.dateOffset);
      activityDate =  new Date(activityDate.setDate(activityDate.getDate() + this.activityService.dateOffset));
      console.log('activityDate = ', activityDate);
      $this.logDate = (activityDate).toString();
      $this.originalLogDate = (activityDate).toString();
      this.logCountChange();
    }
  }

  private setTimeFormat(logDate: number) {
    const tempDate = new Date(logDate);

    console.log('tempDate = ', tempDate);
    const logDateMoment = moment(tempDate);
    // console.log('logDateMoment = ', logDateMoment);
    this.logTime = logDateMoment.format('HH:mm');
    // console.log('logTime = ', this.logTime);
    this.logDate = tempDate.toISOString();
    console.log('this.logDate2 = ', this.logDate);
  }

  public logCountChange() {
    this.logDuration = this.activityLogService.estimateActivityTime(this.foundActivity, this.logCount);
    const startDateTime = new Date(this.originalLogDate);
    let duration = this.logDuration;
    if (duration < 1) {
      duration = 1;
    }

    if (!this.healthKitsEnabled) {
      duration = 0; // no healthkit enabled, so do not adjust
    }

    let startTime = startDateTime.setTime(startDateTime.getTime() - duration * 60 * 1000);
    startTime = this.resetIfPastMidnight(startTime);

    console.log('startTime = ', startTime);
    console.log('startTime = ', new Date(startTime));
    this.setTimeFormat(startTime);
  }

  private resetIfPastMidnight(startTime: number) {
    if (new Date(startTime).getDate() !== (new Date(this.originalLogDate)).getDate()) {
      // do not go past midnight of today
      startTime = new Date(this.originalLogDate).setHours(0, 0, 0);
    }

    return startTime;
  }

  public initData() {
    this.logCount = 0;
    if (this.userService.user && this.userService.user.stats) {
      if (this.userService.user.stats.activitiesLogged >= 3) {
        this.logCount = this.foundActivity.lastLogCount;
      }
    }
    this.logCountChange();
    this.logCaloriesPerMinute = this.healthService.getCaloriesPerMinute(this.foundActivity.name);
    if (this.foundActivity.caloriesPerMinute) {
      this.logCaloriesPerMinute = this.foundActivity.caloriesPerMinute;
    }
    this.youtubeLink = null;
    dataExercises.forEach((exercise) => {
      if (exercise.name === this.foundActivity.name) {
        this.exercise = exercise;
        if (this.exercise && this.exercise.youtube) {
          this.youtubeLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.exercise.youtube + '?rel=0');
        }
      }
    });
    if (this.foundActivity.youtube && this.foundActivity.youtube.length === 11) {
      this.youtubeLink = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.foundActivity.youtube);
    }
  }

  public selectCount(logCount: ILogCount) {
    this.logCount = parseInt(this.logCount.toString(), 10) + parseInt(logCount.value.toString(), 10);
    if (this.logCount < 0) {
      this.logCount = 0;
    }
  }

  public save() {
    const $this = this;
    if (this.foundActivity && this.foundActivity._id) {
      $this.activityId = this.foundActivity._id;
    }
    const previousPersonRecord = this.foundActivity.personalRecord;
    let logDate = new Date($this.logDate);
    if ($this.logTime) {
      const tokens = $this.logTime.toString().split(':');
      const hours = tokens[0];
      const minutes = tokens[1];
      logDate.setHours(hours);
      logDate.setMinutes(minutes);
      logDate.setSeconds(0);
    }
    const now = new Date();
    console.log('logDate = ', logDate);
    console.log('now = ', now);
    if (logDate.getTime() > now.getTime()) {
      $this.ionicAlertService.presentAlert('You cannot log an activity in the future', logDate.toLocaleDateString() + ' at ' + logDate.toLocaleTimeString() + ' is not a valid date/time');
      return;
    }

    if (this.healthKitsEnabled) {
      const validCheckLogDate = new Date(logDate.getTime() + $this.logDuration * 60 * 1000);
      if (validCheckLogDate.getTime() > now.getTime()) {
        console.log('overriding as logDate.getTime() > now');
        logDate = new Date(now.getTime() - $this.logDuration * 60 * 1000);
      }
      logDate = new Date(this.resetIfPastMidnight(logDate.getTime()));
    }
    console.log('logDate final = ', logDate);

    $this.loader.present();
    const subscription = $this.activityLogService.postActivityLog($this.foundActivity, $this.logCount, logDate, $this.logDuration, $this.logCaloriesPerMinute).subscribe((activityLog) => {
      $this.loader.dismiss();
      if (activityLog) {
        this.foundActivity.lookup.count += $this.logCount;
        this.foundActivity.lookup.calories += activityLog.calories;
        this.foundActivity.lastLogCount = $this.logCount;
        this.foundActivity.caloriesPerMinute = $this.logCaloriesPerMinute;

        if (previousPersonRecord < $this.logCount) {
          // show modal
          this.foundActivity.personalRecord = this.logCount;
          // $this.showPersonalRecordModal(activityLog, this.logCount);
        }

        $this.storage.set('activityCount', '1');
        setTimeout(() => {
          $this.broadcastService.broadcast('activity-log-update', {
            action: 'add',
            activityLog: activityLog,
            name: 'activity-log-update',
            activityId: $this.activityId,
            count: $this.logCount,
          });

          $this.logged.emit(activityLog);
          // this.router.navigate(['/tabs/activities']);
        }, 100);
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public test() {
    this.modalController.create({
      component: PersonalRecordModal,
      componentProps: {
        activityId: this.activityId,
        logCount: 12,
      },
    }).then((myModal) => {
      myModal.present();
    });
  }

  public async showPersonalRecordModal(activityLog: IActivityLog, logCount: number) {
    const $this = this;
    if ($this.isModal) {
      return;
    }

    const modal: HTMLIonModalElement =
       await this.modalController.create({
         component: PersonalRecordModal,
         componentProps: {
           activityId: $this.foundActivity._id,
           logCount: logCount,
         },
       });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        console.log('The result:', detail.data);
        // go back to detail page
        // this.router.navigate(['/tabs/activities/detail/' + $this.activityId]);
      }
    });
    await modal.present();
  }

  private addHours(min: number, max: number, label: string) {
    const columns = [];
    for (let i = min; i <= max; i += 1) {
      columns.push({
        text: i.toString() + ' ' + label,
        value: i,
      });
    }
    return columns;
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
      $this.logCaloriesPerMinute = $this.healthService.getCaloriesPerMinute(this.foundActivity.name);
    });

    await modal.present();
  }

  public saveCalories() {
    this.foundActivity.caloriesPerMinute = this.logCaloriesPerMinute;
    this.activityService.updateActivity(this.foundActivity).subscribe((savedSuccess) => {
      // console.log('savedSuccess = ', savedSuccess);
    });
  }

  public openTimer() {
    this.modalController.create({
      component: StopWatchModal,
      componentProps: {
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
      });
    });
  }
}
