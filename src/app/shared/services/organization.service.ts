import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { IOrganizationDocument } from '../models/organization/organization.interface';
import { ApiService, ISetting } from './api.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
const jsFilename = 'organizationService: ';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  public organization: IOrganizationDocument;
  public organizationUserId: string;
  public organizations: IOrganizationDocument[];
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
  ) {
    const $this = this;
  }

  public changeOrganization(organization, reload?) {
    const $this = this;
    const msgHdr = jsFilename + 'changeOrganization: ';
    $this.organization = organization;
    const setting: ISetting = {
      resource: 'token',
      queryString: 'organizationId=' + organization._id,
    };
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
              $this.organizations = <IOrganizationDocument[]>$this.list.items;
              $this.organizations.filter((org) => {
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
              // console.log('$this.userService.user = ', $this.userService.user);
              if (!$this.organization) {
                $this.organizations.forEach((org) => {
                  if ($this.userService.user && $this.userService.user.defaultOrganizationId === org._id) {
                    $this.organization = org;
                    if ($this.organization && $this.userService.user) {
                      $this.organization.users.forEach((user) => {
                        if (user.userId === $this.userService.user._id) {
                          $this.organizationUserId = user._id;
                        }
                      })
                    }
                    $this.broadcastService.broadcast('reload-data');
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
            $this.organization = <IOrganizationDocument>res;
            if ($this.organization && $this.userService.user) {
              $this.organization.users.forEach((user) => {
                if (user.userId === $this.userService.user._id) {
                  $this.organizationUserId = user._id;
                }
              })
            }
          }
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }
}
