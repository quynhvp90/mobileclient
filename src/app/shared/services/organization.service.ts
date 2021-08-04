import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';
import { IOrganizationDocument } from '../models/organization/organization.interface';
import { ApiService, ISetting } from './api.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
const jsFilename = 'organizationService: ';

@Injectable()
export class OrganizationService {
  public organization: IOrganizationDocument;
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

  public changeOrganization(organization) {
    if (organization) {
      this.organization = organization;
      this.broadcastService.broadcast('reload-org');
    }
  }

  public getOrganizations(filter) {
    const $this = this;
    const msgHdr = jsFilename + 'getOrganizations: ';

    // query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    const setting: ISetting = {
      resource: 'organizations',
    };
    if (filter) {
      setting.queryString = 'filter=' + encodeURIComponent(filter);
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
                    this.broadcastService.broadcast('reload-data');
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


}
