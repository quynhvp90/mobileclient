import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  BroadcastService,
  UserService,
  GlobalService,
} from '../../shared/services';

import { LoadingController, NavController } from '@ionic/angular';

import {
  ActivatedRoute, Router,
} from '@angular/router';
import { JobApiService } from 'src/app/job/job-shared/services/job.api.service';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';
import organizationInterface from 'src/app/shared/models/organization/organization.interface';
import { OrganizationDataService } from 'src/app/shared/data-services/organizationData.service';
import { JobDataService } from 'src/app/shared/data-services/jobData.service';

// interface IJobToReview {
//   jobId: string;
//   title: string;
//   countHomework?: number;
//   countInterview?: number;
//   countQualifield?: number;
//   // reviewType: string;
// };

@Component({
  selector: 'home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeListComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  // public jobsToReview: IJobUserStats[] = [];

  // public organizationId = null;

  public isLoading = false;
  public isInit = false;

  constructor(
    private broadcastService: BroadcastService,
    public userService: UserService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private jobApiService: JobApiService,
    public organizationDataService: OrganizationDataService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private jobDataService: JobDataService,
    private router: Router,
  ) {
  }

  public ngOnInit() {
    const $this = this;
    console.log('ngOnInit init-list');
    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'org-reload') {
        // this.jobsToReview = [];
        this.getData();
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams['mode'] && queryParams['mode'] === 'reload') {
          // reload data
        }
      });
    this.subscriptions.push(subscription);

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      // this.getActivities();
    });
  }

  public ngOnDestroy() {
    console.log('ngOnDestroy home-list');
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewDidEnter() {
    console.log('ionViewWillEnter Will-list');
    // this.jobsToReview = [];
    this.getData();
  }

  public ionViewWillLeave() {
    console.log('ionViewWillLeave home-list');
    this.ngOnDestroy();
  }

  private getData() {
    const $this = this;
    this.isLoading = true;
    console.log('res job stats: ===== ', (new Date()).toTimeString());
    $this.jobApiService.getStatsByOrganization().subscribe((res) => {
      this.isLoading = false;
      console.log('res job stats: ===== 1', (new Date()).toTimeString());
      console.log('res job stats: ===== 1', (new Date()).toTimeString());
    });
  }

  public reviewJobApplicants(jobToReview: IJobUserStats, type) {
    const $this = this;
    const newUrl = '/tabs/jobs/' + jobToReview.jobId + '/' + type;
    $this.navCtrl.navigateForward(newUrl, {
      queryParams: {
        id: jobToReview.jobId,
      },
    });
    // $this.navCtrl.navigateForward(newUrl);
    // this.router.navigate([newUrl], { queryParams: { job: job } });
  }

}
