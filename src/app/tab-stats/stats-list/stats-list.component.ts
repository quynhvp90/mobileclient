import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';

import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  UserService } from '../../shared/services';
import { IActivityDocument } from '../../shared/models/activity/activity.interface';

const jsFilename = 'stats-list: ';

@Component({
  selector: 'stats-list',
  templateUrl: './stats-list.component.html',
  styleUrls: ['./stats-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatsListComponent {
  public activities: IActivityDocument[] = [];

  constructor(
    private activityService: ActivityService,
    private userService: UserService,
    private navCtrl: NavController,
    private broadcastService: BroadcastService,
  ) {
  }

  public ionViewWillEnter() {
    const msgHdr = jsFilename + 'ionViewWillEnter: ';

    this.getAllActivities();
    this.broadcastService.broadcast('ionViewWillEnter-stats-list');
  }

  public getAllActivities() {
    this.activities = [];
    this.getStatsActivities();

    // this.userService.user.lookups.workouts.forEach((workout) => {
    //   const workoutId = workout._id;
    //   console.log('workoutId = ', workoutId);
    //   this.getActivities(workoutId);
    // });
  }

  public getStatsActivities() {
    const $this = this;
    const fromDate = 0;
    const toDate = (new Date()).getTime();
    this.activityService.getActivities(null, fromDate, toDate, {}).subscribe((responseActivities) => {
      responseActivities.items.forEach((item) => {
        let addActivity = true;
        this.activities.forEach((activity) => {
          if (activity.label === item.label) {
            addActivity = false;
            activity.lookup.count += item.lookup.count;
            if (item.personalRecord > activity.personalRecord) {
              activity.personalRecord = item.personalRecord;
            }
            if (!activity.lookup.duplicateActivites) {
              activity.lookup.duplicateActivites = [];
            }
            activity.lookup.duplicateActivites.push(item);
          }
        });
        if (addActivity) {
          if (item.lookup && item.lookup.count > 0) {
            this.activities.push(item);
          }
        }
      });

      function compare(a: IActivityDocument, b: IActivityDocument) {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      }

      this.activities.sort(compare);
    });
  }

  async viewDetail(activity: IActivityDocument) {
    const $this = this;

    $this.navCtrl.navigateForward('/tabs/stats/detail/' + activity._id.toString());
  }

}
