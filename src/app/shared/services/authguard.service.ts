import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { UserService } from './user.service';
import { OrganizationDataService } from '../data-services/organizationData.service';
import { OrganizationService } from './organization.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private organizationDataService: OrganizationDataService,
    private router: Router) { }

  public canLoad(route: Route) {
    return true;

  }

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean>|boolean {
    if (this.userService.isLoggedIn) {
      return true;
    }

    if (!this.userService.hasStoredToken()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
      return false;
    }

    return new Observable((observer) => {
      this.userService.auth().subscribe((foundUser) => {
        let isLoggedIn = false;
        if (foundUser) {
          isLoggedIn = true;
        }

        if (!isLoggedIn) {
          observer.next(isLoggedIn);
          observer.complete();

          this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
          return false;
        }

        if (this.organizationDataService.organization) {
          observer.next(isLoggedIn);
          observer.complete();
          return true;
        }

        this.organizationService.getOrganizations({}).subscribe((res) => {
          observer.next(isLoggedIn);
          observer.complete();
          return true;
        });
      });
    });
  }

  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) {
    return this.canActivate(route, state);
  }
}
