import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  BroadcastService,
  UserService,
  GlobalService,
} from '../../shared/services';

import { LoadingController, NavController } from '@ionic/angular';

import {
  ActivatedRoute,
} from '@angular/router';
import { JobApiService } from 'src/app/job/job-shared/services/job.api.service';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';


@Component({
  selector: 'home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeListComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public userStats: IJobUserStats[] = [];

  public isLoading = true;

  constructor(
    private broadcastService: BroadcastService,
    public userService: UserService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private jobApiService: JobApiService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    const $this = this;

    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        // respond to broadcast here
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams['mode'] && queryParams['mode'] === 'reload') {
          // reload data
          // this.getActivities();
        }
      });
    this.subscriptions.push(subscription);

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      // this.getActivities();
    });

    $this.getData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewWillEnter() {
  }

  public ionViewWillLeave() {
  }

  private getData() {
    const $this = this;
    $this.isLoading = true;
    $this.jobApiService.getStatsByOrganization($this.userService.user.defaultOrganizationId).subscribe((res) => {
      $this.isLoading = false;
      console.log('res = ', res);
      $this.userStats = res.userStats;
    });
  }

  public reviewJobApplicants(jobId) {
    const $this = this;
    const newUrl = '/tabs/jobs/' + jobId + '/homework';
    $this.navCtrl.navigateForward(newUrl);
  }

}
