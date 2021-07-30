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
import { OrganizationService } from './organization.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad {
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
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
      this.router.navigate(['/intro'], { queryParams: { redirectTo: state.url } });
      return false;
    }

    return new Observable((observer) => {
      this.userService.auth().subscribe((foundUser) => {
        let isLoggedIn = false;
        if (foundUser) {
          isLoggedIn = true;
        }
        this.organizationService.getOrganizations(null).subscribe((res) => {
          observer.next(isLoggedIn);
          observer.complete();
          if (!isLoggedIn) {
            this.router.navigate(['/intro'], { queryParams: { redirectTo: state.url } });
          }
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
