import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { OrganizationDataService } from '../data-services/organizationData.service';
import { IOrganizationDocument } from '../models/organization/organization.interface';
import { ApiService, ISetting } from './api.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
const jsFilename = 'organizationService: ';

export class OrganizationService {
  public list: {
    count?: number,
    items?: IOrganizationDocument[],
  } = {};

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private organizationDataService: OrganizationDataService,
  ) {
    const $this = this;
  }

  public checkOrganization() {
    if (this.userService.user && !this.organizationDataService.organization) {
      this.getOrganizations(null).subscribe((res) => {
        this.broadcastService.broadcast('org-reload');
        console.log('check organization');
      });
    }
  }

  public changeOrganization(organization, reload?) {
    const $this = this;
    const msgHdr = jsFilename + 'changeOrganization: ';
    const setting: ISetting = {
      resource: 'token',
      queryString: 'organizationId=' + organization._id,
    };
    $this.organizationDataService.setOrganization(organization);
    $this.spinnerService.show();
    return $this.apiService.get(setting)
      .pipe(
        map((res) => {
          console.log(msgHdr + 'res = ', res);
          const user = res;
          $this.userService.updateToken(user);
          if (reload) {
            this.broadcastService.broadcast('reload-data');
          }
          return user;
        }), catchError((err) => {
          console.log('err = ', err);
          return $this.exceptionService.catchBadResponse(err);
        }), finalize(() =>
          $this.spinnerService.hide(),
      ));
  }

  public getOrganizations(filter) {
    const $this = this;
    const msgHdr = jsFilename + 'getOrganizations: ';

    // query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    if (!filter) {
      filter = {};
    }
    if (!filter.where) {
      filter.where = {};
    }
    filter.where = {
      postingEnabled: true,
    };
    filter.limit = 100;
    const setting: ISetting = {
      resource: 'organizations',
    };
    if (filter) {
      setting.queryString = 'filter=' + encodeURIComponent(JSON.stringify(filter));
    }
    return $this.apiService
      .get(setting).pipe(
        map((res) => {
          console.log(msgHdr, res);
          if (res) {
            $this.list = res;
            if ($this.list.items) {
              let organizations = <IOrganizationDocument[]>$this.list.items;
              organizations = organizations.filter((org) => {
                let check = false;
                if (org.users && org.users.length > 0) {
                  org.users.forEach((user) => {
                    if (user.userId === $this.userService.user._id) {
                      check = true;
                    }
                  });
                }
                return check;
              });
              $this.organizationDataService.setOrganizations(organizations);
              // console.log('$this.userService.user = ', $this.userService.user);
              if (!$this.organizationDataService.organization) {
                $this.organizationDataService.organizations.forEach((org) => {
                  if ($this.userService.user && $this.userService.user.defaultOrganizationId === org._id) {
                    $this.organizationDataService.setOrganization(org);
                    if ($this.organizationDataService.organization && $this.userService.user) {
                      $this.organizationDataService.organization.users.forEach((user) => {
                        if (user.userId === $this.userService.user._id) {
                          $this.organizationDataService.setOrganizationUserId(user._id);
                        }
                      });
                    }
                  }
                });
              }
            }
          }
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }

  public getCurrentOrganization() {
    const $this = this;
    const msgHdr = jsFilename + 'getOrganizations: ';

    // query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    const setting: ISetting = {
      resource: 'organizations',
      id: $this.userService.user.defaultOrganizationId,
    };
    return $this.apiService
      .get(setting).pipe(
        map((res) => {
          console.log(msgHdr, res);
          if (res) {
            $this.organizationDataService.setOrganization(<IOrganizationDocument>res);
            if ($this.organizationDataService.organization && $this.userService.user) {
              $this.organizationDataService.organization.users.forEach((user) => {
                if (user.userId === $this.userService.user._id) {
                  $this.organizationDataService.setOrganizationUserId(user._id);
                }
              });
            }
          }
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }
}
