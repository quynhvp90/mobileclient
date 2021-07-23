import { Component, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IonItemSliding, ModalController, NavParams } from '@ionic/angular';
import { IActivityLogDocument } from 'src/app/shared/models/activity-log/activity-log.interface';
import { default as IActivityDocument } from 'src/app/shared/models/activity/activity.interface';
import { ActivityLogService, BroadcastService, IonicAlertService } from 'src/app/shared/services';
import * as moment from 'moment';
@Component({
  templateUrl: './activity-log.modal.html',
  encapsulation: ViewEncapsulation.None,
})

export class ActivityLogModal implements OnInit, OnDestroy {
  private subscriptions = [];
  public activityId: string;
  public foundActivity: IActivityDocument;

  public listActivityLogs: IActivityLogDocument[] = [];
  public showList = false;
  private itemLeft = 0;
  private filter: any = {
    where: {},
    limit: 10,
    skip: 0,
    sortField: 'created',
    sortOrder: 'desc',
  };
  private filterSkip = 5;

  constructor(
    private modalController: ModalController,
    private activityLogService: ActivityLogService,
    private navParams: NavParams,
    private ionicAlertService: IonicAlertService,
    private broadcastService: BroadcastService,
    private zone: NgZone,
  ) {
    if (this.navParams.data) {
      this.foundActivity = this.navParams.data.foundActivity;
      // this.getActivityLogs();
    }
  }

  public ngOnInit() {
    const $this = this;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public activityLogged() {
    this.modalController.dismiss('close');
  }

  public cancel() {
    this.modalController.dismiss('close');
  }

  private getActivityLogs() {
    const $this = this;
    $this.showList = true;
    console.log('this.foundActivity._id = ', this.foundActivity._id);
    const subscription = $this.activityLogService.getActivityLogs(this.foundActivity._id, this.filter, {
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

  // may not work on modals
  public loadMore(infiniteScrollEvent) {
    this.filter.skip += this.filterSkip;
    infiniteScrollEvent.target.complete();
    this.getActivityLogs();
  }

  async deleteActivityLog (activityLog: IActivityLogDocument, slidingLogs?: IonItemSliding) {
    const $this = this;
    if (slidingLogs) {
      await slidingLogs.close();
    }
    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to permanently delete this log?', () => {
      const subscription = this.activityLogService.deleteActivityLog(this.foundActivity._id, activityLog._id.toString())
      .subscribe((isDeleted) => {
        if (isDeleted) {
          this.zone.run(() => {
            const index = $this.listActivityLogs.indexOf(activityLog);
            $this.listActivityLogs.splice(index, 1);
            $this.showList = false; // hack to refresh the list
            setTimeout(() => {
              $this.showList = true;
            }, 10);
            $this.foundActivity.lookup.count -= activityLog.count;
          });

          $this.broadcastService.broadcast('activity-log-update', {
            action: 'remove',
            activityLog: activityLog,
            name: 'activity-log-update',
            activityId: $this.foundActivity._id,
            count: activityLog.count * -1, //// temp
          });
        }
      });
      $this.subscriptions.push(subscription);
    });
  }
}
