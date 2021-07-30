import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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
  public isLoading = true;

  constructor(
    private broadcastService: BroadcastService,
    public organizationService: OrganizationService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private jobApiService: JobApiService,
    public userService: UserService,
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
    $this.getData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public selectOrg(organization) {
    const msgHdr = 'selectOrg: ';
    console.log(msgHdr, organization);
    const $this = this;
    $this.organizationService.organization = <IOrganizationDocument>organization;
    const newUrl = '/tabs/home';
    $this.navCtrl.navigateForward(newUrl);
  }

  private getData() {
    const $this = this;
    $this.isLoading = true;
    if ($this.organizationService.organizations && $this.organizationService.organizations.length > 0) {
      $this.organizationService.organizations.forEach((org) => {
        if (org.users && org.users.length > 0) {
          org.users.forEach((user) => {
            if (user.userId === $this.userService.user._id) {
              $this.organizations.push(org);
            }
          });
        }
      });
    }

  }
}
