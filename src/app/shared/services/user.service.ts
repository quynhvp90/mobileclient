import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Platform } from '@ionic/angular';
import { catchError, finalize, map, share } from 'rxjs/operators';
import { IUserDocument, IUserLastActivityDetail, IUserPublic, IUserPublicDetail } from '../models/user/user.interface';
import { ApiService, IRequestOptionsArgs, ISetting } from './api.service';
// import { IntercomService } from './intercom.service';
// import * as moment from 'moment';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { Storage } from '@ionic/storage';
import { IWorkoutDocument } from '../models/workout/workout.interface';
import * as moment from 'moment';
import { IonicAlertService } from './ionic.alert.service';
import { IntercomService } from './intercom.service';

// import { LoaderService } from '../../core/loader/loader.service';
const jsFilename = 'userService: ';

@Injectable()
export class UserService {
  public isLoggedIn = false;

  public user: IUserPublic;
  private intercomBooted = false;

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private intercomService: IntercomService,
    private storage: Storage,
    // private intercomService: IntercomService,
    // private loaderService: LoaderService
  ) {
    const $this = this;
  }

  public auth(): Observable<IUserDocument> {
    const msgHdr = jsFilename + 'auth: ';

    const $this = this;

    if ($this.user) {
      return of($this.user);
    }

    return $this.getCurrentUser();
  }

  public confirm(userId: string, activity: string, token: string) {
    const $this = this;
    $this.spinnerService.show();
    const url = 'users/' + userId + '/confirm';
    return $this.apiService
      .post({
        resource: url,
        payload: {
          activity,
          token,
        },
      }).pipe(
        map(res => <String> res)
        , catchError($this.exceptionService.catchBadResponse)
        , finalize(() => $this.spinnerService.hide()),
      );
  }

  public hasStoredToken(): boolean {
    const msgHdr = jsFilename + 'hasStoredToken: ';

    try {
      if (this.globalService.token) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(msgHdr + 'error trying to get token, I may be in incognito mode');
      return false;
    }
  }

  public logout(): void {
    const msgHdr = jsFilename + 'logout: ';

    this.isLoggedIn = false;
    this.globalService.isLoggedIn = false;
    this.user = null;
    try {
      localStorage.removeItem('token');
      this.storage.remove('token');
      this.storage.clear();
      this.globalService.token = null;
    } catch (e) {
      console.error(msgHdr + 'error trying to remove token, I may be in incognito mode');
    }
    this.globalService.token = null;
    this.broadcastService.broadcast('logout');
  }

  public login(user: any): void {
    const msgHdr = jsFilename + 'login: ';

    this.isLoggedIn = true;
    this.globalService.isLoggedIn = true;
    this.user = user;
    // this.user.email = this.getEmail();

    this.globalService.token = user.token;

    try {
      console.log('setting token = ', user.token);
      this.storage.set('token', user.token);
    } catch (e) {
      console.error(msgHdr + 'error trying to set token, I may be in incognito mode');
    }
    this.initAfterLogin();
  }

  public updateToken(user: any): void {
    const msgHdr = jsFilename + 'updateToken: ';
    this.user = user;
    this.globalService.token = user.token;
    try {
      console.log('setting token = ', user.token);
      this.storage.set('token', user.token);
    } catch (e) {
      console.error(msgHdr + 'error trying to set token, I may be in incognito mode');
    }
  }

  public passwordReset(email: string) {
    const $this = this;
    const payload = {
      email,
    };

    return this.apiService
      .post({
        resource: 'users/reset',
        payload: payload,
      }).pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public updateUser(user: any): Observable<boolean> {
    this.spinnerService.show();
    const $this = this;
    // console.log('user = ', user);
    const userId = user._id || this.user._id;
    // this.updateIntercom();

    return this.apiService
      .put({
        resource: `users/${userId}`,
        payload: user,
      })
      .pipe(
        map((res) => {
          if (user.firstName) {
            $this.user.firstName = user.firstName;
          }
          if (user.lastName) {
            $this.user.lastName = user.lastName;
          }
          if (user.publicName) {
            $this.user.publicName = user.publicName;
          }
          if (user.avatar) {
            $this.user.avatar = user.avatar;
          }
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public patch(payload: {
    _id?: string,
    action?: string, // ['password-reset', ...]
    tips?: any
    token?: string, // for password reset
    password?: string, // for password reset
    subscribed?: boolean,
    activeWorkoutId?: string,
    pushToken?: string,
    publicName?: string,
    timezone?: string,
    showActivityInPublicFeed?: boolean,
  }): Observable<boolean> {
    const $this = this;

    const userId = payload._id || $this.user._id;
    // $this.updateIntercom();

    return $this.apiService
      .patch({
        resource: `users/${ userId }`,
        payload: payload,
      }).pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public addProvider(provider: string, code: string) {
    const $this = this;
    const userId = $this.user._id;

    return this.apiService
      .post({
        resource: `users/${ userId }/providers`,
        payload: {
          provider: provider,
          code: code,
        },
      }).pipe(
        map((res: Response) => {
          let validResponse = false;
          if (res && res.status === 204) {
            validResponse = true;
          }
          return validResponse;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public removeProvider(provider: string) {
    const $this = this;
    const userId = $this.user._id;

    this.apiService
      .delete({
        resource: `users/${ userId }/providers/${ provider }`,
      }).pipe(
        map((res) => {
          return true;
        })
      , catchError(this.exceptionService.catchBadResponse)
      , finalize(() => this.spinnerService.hide()),
    );
  }

  // public updateIntercom() {
  //   if (!this.user) {
  //     return;
  //   }
  //   const epoch = moment(this.user.created);

  //   const intercomId =  (location.hostname === 'app.logreps.com') ? 'sf80zos7' : 'ovskvmc7';
  //   console.log('app.module: intercomId = ', intercomId);
  //   if (intercomId === 'sf80zos7') {
  //     console.log('running production');
  //   }

  //   const isMobile = this.deviceService.isMobile();

  //   const intercomSettings = {
  //     'user_hash': this.user.intercomSignature,
  //     'app_id': intercomId,
  //     'user_id': this.user._id,
  //     'email': this.user.email,
  //     'version': CONFIG.version,
  //     'created_at': epoch.unix(),
  //     'hide_default_launcher': isMobile,
  //     'stat contacts': this.user.stats.contacts,
  //     'stat reks sent': this.user.stats['reks-sent'],
  //     'last_request_at': (new Date()).getTime() / 1000,
  //   };

  //   let fullName = '';
  //   if (this.user.firstName) {
  //     intercomSettings['First name'] = this.user.firstName;
  //     fullName = this.user.firstName;
  //   }
  //   if (this.user.lastName) {
  //     intercomSettings['Last name'] = this.user.lastName;
  //     fullName += ' ' + this.user.lastName;
  //   }
  //   intercomSettings['name'] = fullName.trim();

  //   // alert('intercomSettings.hide_default_launcher = ' + intercomSettings.hide_default_launcher);

  //   if (this.intercomBooted) {
  //     // console.log('updateIntercom = ', intercomSettings);
  //     this.intercomService.update(intercomSettings);
  //   } else {
  //     this.intercomBooted = true;
  //     // console.log('bootIntercom = ', intercomSettings);
  //     this.intercomService.boot(intercomSettings);
  //   }
  // }

  public getCurrentUser() {
    const $this = this;
    const msgHdr = jsFilename + 'getCurrentUser: ';
    const timezoneOffset = (new Date()).getTimezoneOffset();

    console.log(msgHdr);

    return $this.apiService
      .get({
        resource: 'users/me?timezoneoffset=' + timezoneOffset,
      }).pipe(
        map((res) => {
          $this.user = <IUserPublic> res;
          this.broadcastService.broadcast('current-user-retrieved');
          this.intercomService.trackEvent('current-user-retrieved', {});
          return $this.user;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }

  private initAfterLogin() {
    const $this = this;
    const msgHdr = jsFilename + 'initAfterLogin: ';

    this.getCurrentUser().subscribe(() => {
      // this.updateIntercom();
      this.broadcastService.broadcast('login');
    });
  }

  public getUsers(where?: any): Observable<IUserDocument[]> {
    const $this = this;
    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 1000,
          where: {},
        },
      }],
    };

    if (where) {
      requestOptions.queryParams[0].value.where = where;
    }

    let query = '';
    if (requestOptions && requestOptions.queryParams) {
      requestOptions.queryParams.forEach((option) => {
        if (typeof option.value === 'string') {
          query += '&' + option.key + '=' + option.value;
        } else {
          query += '&' + option.key + '=' + encodeURIComponent(JSON.stringify(option.value));
        }
      });
    }

    const setting: ISetting = {
      resource: 'users',
      queryString: query,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          return <IUserDocument[]> result;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }
}
