import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { IOrganizationDocument } from '../models/organization/organization.interface';
const jsFilename = 'OrganizationDataService: ';

@Injectable({
  providedIn: 'root',
})
export class OrganizationDataService {
  public organization = null;
  public organizationUserId: string;
  public organizations: IOrganizationDocument[];
  public isLoading = false;

  constructor(
    // private http: HttpClient,
    // private exceptionService: ExceptionService,
    // private apiService: ApiService,
    // private globalService: GlobalService,
    // private spinnerService: SpinnerService,
    // private broadcastService: BroadcastService,
    // private userService: UserService,
    // private organizationService: OrganizationService,
  ) {
  }
  //////// Loading ////////////////////
  public loading(value: boolean) {
    this.isLoading = value;
  }

  //////// Organization /////////////////
  public setOrganization(objOrganization) {
    this.organization = objOrganization;
  }
  public getOrganization() {
    if (isNullOrUndefined(this.organization)) {
      return null;
    }
    return this.organization;
  }
  //////// List Organization /////////////////
  public setOrganizations(objOrganizations) {
    this.organizations = objOrganizations;
  }
  public getOrganizations() {
    if (isNullOrUndefined(this.organizations)) {
      return null;
    }
    return this.organizations;
  }
  //////// organizationUserId /////////////////
  public setOrganizationUserId(organizationUserId) {
    this.organizationUserId = organizationUserId;
  }
  public getOrganizationUserId() {
    if (isNullOrUndefined(this.organizationUserId)) {
      return null;
    }
    return this.organizationUserId;
  }

}
