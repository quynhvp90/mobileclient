import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, ViewEncapsulation, NgZone } from '@angular/core';
import {
  BroadcastService,
  OrganizationService,
  UserService,
  GlobalService,
} from '../../shared/services';

import { LoadingController, NavController } from '@ionic/angular';

import {
  ActivatedRoute,
} from '@angular/router';
import { JobApiService } from 'src/app/job/job-shared/services/job.api.service';
import { IJobUserStats } from 'src/app/job/job-shared/interfaces/job.interface';
import { IOrganizationDocument } from 'src/app/shared/models/organization/organization.interface';
import { OrganizationDataService } from 'src/app/shared/data-services/organizationData.service';

@Component({
  selector: 'organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationListComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public organizations: IOrganizationDocument[] = [];
  public userOrg: IOrganizationDocument = null;
  public isLoading = false;
  public eventFresh = null;

  constructor(
    private broadcastService: BroadcastService,
    public organizationService: OrganizationService,
    public organizationDataService: OrganizationDataService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private jobApiService: JobApiService,
    public userService: UserService,
    private navCtrl: NavController,
    private zone: NgZone,
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
  }
  doRefresh(event) {
    console.log('Begin async operation organization list');
    this.eventFresh = event;
    this.getData();
    // setTimeout(() => {
    //   console.log('Async operation has ended');
    //   // event.target.complete();
    // }, 2000);
  }
  public ngOnDestroy() {
    console.log('ngOnDestroy home-list');
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
  public ionViewWillEnter() {
    console.log('ionViewWillEnter Will-list');
    this.getData();
  }
  public ionViewWillLeave() {
    console.log('ionViewWillLeave home-list');
  }

  public selectOrg(organization) {
    const msgHdr = 'selectOrg: ';
    console.log(msgHdr, organization);
    const $this = this;
    $this.organizationService.changeOrganization(organization).subscribe(() => {
      const newUrl = '/tabs/home';
      $this.navCtrl.navigateForward(newUrl);
    });

  }

  private getData() {
    this.zone.run(() => {
      this.isLoading = true;
      this.organizationService.getOrganizations(null).subscribe((res) => {
        if (this.eventFresh) {
          this.eventFresh.target.complete();
          this.eventFresh = null;
        }
        this.isLoading = false;
      });
    });
  }
}
