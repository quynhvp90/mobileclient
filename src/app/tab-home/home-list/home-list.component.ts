import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  BroadcastService,
  UserService,
  GlobalService,
  OrganizationService,
} from '../../shared/services';

import { LoadingController, NavController } from '@ionic/angular';

import {
  ActivatedRoute, Router,
} from '@angular/router';
import { JobApiService } from 'src/app/job/job-shared/services/job.api.service';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';
import IOrganizationDocument from 'src/app/shared/models/organization/organization.interface';

interface IJobToReview {
  jobId: string;
  title: string;
  countHomework?: number;
  countInterview?: number;
  countQualifield?: number;
  // reviewType: string;
};

@Component({
  selector: 'home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeListComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public jobsToReview: IJobToReview[] = [];

  public organizationId = null;

  public isLoading = true;

  constructor(
    private broadcastService: BroadcastService,
    public userService: UserService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private jobApiService: JobApiService,
    public organizationService: OrganizationService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
  ) {

    // if (!this.organizationService.organization) {
    //   this.router.navigate(['list-org-screen']);
    // }
  }

  public ngOnInit() {
    const $this = this;
    $this.organizationId = this.userService.user.defaultOrganizationId;
    if ($this.organizationService.organization) {
      $this.organizationId = $this.organizationService.organization._id;
    }

    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data' && $this.organizationId) {
        // respond to broadcast here
        if ($this.organizationService.organization) {
          $this.organizationId = $this.organizationService.organization._id;
        }
        $this.getData();
      }
      // if (msg.name === 'reload-org') {
      //   // respond to broadcast here
      //   console.log('set organiztion 1');
      //   $this.organizationId = $this.organizationService.organization._id;
      //   $this.getData();
      // }
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
    $this.jobApiService.getStatsByOrganization($this.organizationId).subscribe((res) => {
      $this.isLoading = false;
      this.jobsToReview = [];
      res.userStats.forEach((stats) => {
        this.jobsToReview.push({
          jobId: stats.jobId,
          title: stats.title,
          countHomework: stats.applicationStats.applicantsInHomeworkRequiringAction,
          countInterview: stats.applicationStats.applicantsInInterviewRequiringAction,
          countQualifield: stats.applicationStats.applicantsInQualifiedRequiringAction,
          // reviewType: 'homework'
        });
      });
    });
  }

  public reviewJobApplicants(jobToReview: IJobToReview, type) {
    const $this = this;
    const newUrl = '/tabs/jobs/' + jobToReview.jobId + '/' + type;
    $this.navCtrl.navigateForward(newUrl);
    // this.router.navigate([newUrl], { queryParams: { job: job } });
  }

}
