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

  public jobsToReview: IJobUserStats[] = [];

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
    if (!$this.organizationService.organization) {
      $this.organizationService.getCurrentOrganization().subscribe(() => {});
    }
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
          // if (!$this.organizationService.organization) {
          //   $this.organizationService.getCurrentOrganization().subscribe(() => {});
          // }
          // $this.getData();
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
    console.log('ngOnDestroy home-list');
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewWillEnter() {
    console.log('ionViewWillEnter home-list');
    if (!this.organizationService.organization) {
      this.organizationService.getCurrentOrganization().subscribe(() => {
        this.getData();
      });
    }
  }

  public ionViewWillLeave() {
    console.log('ionViewWillLeave home-list');
  }

  private getData() {
    const $this = this;
    $this.isLoading = true;
    // console.log('res job stats: ===== ', (new Date()).toTimeString());
    $this.jobApiService.getStatsByOrganization($this.organizationId).subscribe((res) => {
      $this.isLoading = false;

      res.userStats.forEach((stats) => {
        stats.countQualifield = stats.applicationStats.applicantsInQualifiedRequiringAction;
        let jobStats = $this.jobsToReview.find((job) => { return job.jobId === stats.jobId; });
        if ((stats.jobCountHomework && stats.jobCountHomework > 0)
          || (stats.jobCountInterview && stats.jobCountInterview > 0)) {
            if (stats.employerStats)
            if (!jobStats) {
              $this.jobsToReview.push(stats);
            } else {
              jobStats = stats;
            }
          }
      });
      $this.jobsToReview = $this.jobsToReview.sort((a: IJobUserStats, b: IJobUserStats) => {
        if (a.employerStats && a.employerStats.modified
          && b.employerStats && b.employerStats.modified) {
          if (a.employerStats.modified > b.employerStats.modified) {
            return 1;
          } else if (a.employerStats.modified < b.employerStats.modified) {
            return -1;
          }
        }
        return 0;
      });
      // console.log('res job stats: ===== 1', (new Date()).toTimeString());
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
