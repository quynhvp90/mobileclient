import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IonItemSliding, LoadingController, NavController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IActivityLogDocument } from '../../shared/models/activity-log/activity-log.interface';
import { IActivityDocument } from '../../shared/models/activity/activity.interface';
import { ActivityLogService, ActivityService, BroadcastService, IonicAlertService, UserService } from '../../shared/services';
import { ActivityEditModalComponent } from '../activity-modals/activity-edit-modal/activity-edit-modal.component';
@Component({
  selector: 'activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityDetailComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];
  private filterSkip = 5;
  private itemLeft = 0;
  private filter: any = {
    where: {},
    limit: 10,
    skip: 0,
    sortField: 'created',
    sortOrder: 'desc',
  };

  public buttonMessage = 'Log An Activity';
  public primarycolor = '#FF6A01';
  public activity: IActivityDocument;
  public activityId = '';
  public secondarycolor = '#FF8E3D';
  public listActivityLogs: IActivityLogDocument[] = [];
  public showList = true;

  constructor(
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private router: Router,
    private ionicAlertService: IonicAlertService,
    private modalController: ModalController,
    private navCtrl: NavController,
    private zone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const $this = this;
    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });

    const subscription = $this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        if (msg.message.activityId) {
          $this.activityId = msg.message.activityId;
          if (!$this.activityId) {
            return;
          }
          $this.getActivity(false);
        }
      }
    });
    $this.subscriptions.push(subscription);
  }

  private getActivity(getActivityLogs: boolean) {
    const subscription = this.activityService.getActivity(this.activityId).subscribe((foundActivity) => {
      if (foundActivity) {
        this.activity = foundActivity;
        if (getActivityLogs) {
          this.getActivityLogs();
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit() {
    const $this = this;

    this.buttonMessage = 'Log An Activity';
    if (this.activityService.dateOffset < 0) {
      const dateString = moment().locale('en4').add(this.activityService.dateOffset, 'days').calendar();
      this.buttonMessage = 'Log An Activity for ' + dateString;
    }

    let subscription =  this.route.params.subscribe((params: Params) => {
      this.activityId  = params['id'];
      if (!this.activityId) {
        return;
      }
      this.getActivity(true);
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        if (msg.message.activityId === $this.activity._id && $this.activity.lookup) {
          const activityLog: IActivityLogDocument = msg.message.activityLog;
          if (msg.message.action === 'add') {
            this.zone.run(() => {
              $this.listActivityLogs.unshift(activityLog);
              $this.updateActivityLogs();
              $this.showList = false; // hack to refresh the list
              setTimeout(() => {
                $this.showList = true;
              }, 1);
            });
          }
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  private getActivityLogs() {
    const $this = this;
    const subscription = $this.activityLogService.getActivityLogs(this.activityId, this.filter, {
      isReload: true,
    }).subscribe((data) => {
      if (data && data.items && data.items.length > 0) {
        $this.listActivityLogs = $this.listActivityLogs.concat(data.items);
        $this.itemLeft = data.count - $this.listActivityLogs.length;
        $this.updateActivityLogs();
      }
    });
    $this.subscriptions.push(subscription);
  }

  private updateActivityLogs() {
    const $this = this;

    $this.listActivityLogs.forEach((activityLog) => {
      if (!activityLog.lookups) {
        activityLog.lookups = {};
      }
      activityLog.lookups.created = moment(activityLog.created).format('dddd, MMM Do, YYYY');
    });
  }

  async deleteActivityLog (activityLog: IActivityLogDocument, slidingLogs?: IonItemSliding) {
    const $this = this;
    if (slidingLogs) {
      await slidingLogs.close();
    }
    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to permanently delete this log?', () => {
      const subscription = this.activityLogService.deleteActivityLog(this.activityId, activityLog._id.toString())
      .subscribe((isDeleted) => {
        if (isDeleted) {
          this.zone.run(() => {
            const index = $this.listActivityLogs.indexOf(activityLog);
            $this.listActivityLogs.splice(index, 1);
            $this.showList = false; // hack to refresh the list
            setTimeout(() => {
              $this.showList = true;
            }, 10);
            $this.activity.lookup.count -= activityLog.count;
          });

          $this.broadcastService.broadcast('activity-log-update', {
            action: 'remove',
            activityLog: activityLog,
            name: 'activity-log-update',
            activityId: $this.activityId,
            count: activityLog.count * -1, //// temp
          });
        }
      });
      $this.subscriptions.push(subscription);
    });
  }

  public async editActivity () {
    const $this = this;

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityEditModalComponent,
      componentProps: {
        foundActivity: $this.activity,
      },
    });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        if (detail.data === 'delete') {
          $this.navCtrl.navigateBack('/tabs/activities');
        }
      }
    });
    await modal.present();
  }
  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public logActivity () {
    const $this = this;
    $this.navCtrl.navigateForward('/tabs/activities/log/' + $this.activityId.toString());
  }

  public activityLogged() {
    this.router.navigate(['/tabs/activities']);
  }

  public loadMore(infiniteScrollEvent) {
    this.filter.skip += this.filterSkip;
    infiniteScrollEvent.target.complete();
    this.getActivityLogs();
  }
}
