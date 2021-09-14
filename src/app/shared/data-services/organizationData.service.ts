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

  constructor(
  ) {
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
    if (this.organizations && this.organizations.length > 0) {
      this.organizations.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
    }
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
