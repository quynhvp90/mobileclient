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
      if (msg.name === 'reload-data') {
        // respond to broadcast here
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

  public backButton() {
    this.navCtrl.back();
  }
  public changeOrg() {
    this.router.navigate(['list-org-screen']);
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
      console.log('res = ', res);
      const jobStats = [];
      $this.userStats = res.userStats;
      $this.userStats.forEach((stats) => {
        let checked = false;
        stats.applicationStats.homework = false;
        stats.applicationStats.interview = false;
        if (stats.applicationStats.applicantsInHomework > 0) {
          stats.applicationStats.homework = true;
          jobStats.push(stats);
          checked = true;
        }
        if (stats.applicationStats.applicantsInInterview > 0) {
          checked = true;
          if (!stats.applicationStats.homework) {
            jobStats.push(stats);
          } else {
            const copyStats: IJobUserStats = JSON.parse(JSON.stringify(stats)); // deep clone object
            copyStats.applicationStats.homework = false;
            copyStats.applicationStats.interview = true;
            jobStats.push(copyStats);
          }
        }
        if (!checked) {
          jobStats.push(stats);
        }
      });
      $this.userStats = jobStats;
    });
  }

  public reviewJobApplicants(job) {
    const $this = this;
    const newUrl = '/tabs/jobs/' + job.jobId + '/homework';
    $this.navCtrl.navigateForward(newUrl);
    // this.router.navigate([newUrl], { queryParams: { job: job } });
  }

}
