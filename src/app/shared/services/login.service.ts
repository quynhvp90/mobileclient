import { Injectable } from '@angular/core';
import { Observable, ObservableInput } from 'rxjs';
import { map, filter, catchError, mergeMap, finalize  } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UserService } from './user.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';

// import { ApiService } from '../../shared/services/api.service';
// import { LoginModel } from './login.model';

// import { UserService } from '../../shared/services';
// import { CONFIG, ExceptionService, SpinnerService  } from '../../../app/core';
import { ApiService, ISetting } from './api.service';
import { IonicAlertService } from '.';
const jsFilename = 'LoginService: ';

@Injectable()
export class LoginService {
  private loginObservable: Observable<string>;
  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private apiService: ApiService,
    private userService: UserService,
    // private ionicAlertService: IonicAlertService,
  ) { }

  public login(loginModel: any) {
    const msgHdr = jsFilename + 'login: ';
    const body = JSON.stringify(loginModel);
    const $this = this;
    // $this.spinnerService.show();

    if (loginModel.email) {
      loginModel.email = loginModel.email.trim();
    }
    if (loginModel.password) {
      loginModel.password = loginModel.password.trim();
    }
    const setting: ISetting = {
      resource: 'token',
      payload: loginModel,
    };

    return $this.apiService.post(setting)
      .pipe(
        map((res) => {
          console.log(msgHdr + 'res = ', res);
          const user = res;
          $this.userService.login(user);
          return user;
        }), catchError((err) => {
          console.log('err = ', err);
          // if (err.status === 404) {
          //   this.ionicAlertService.presentAlert('Login Fail', null, 'Invalid email or password');
          //   return null;
          // }
          // this.ionicAlertService.presentAlert('Login Fail', null, err.message);
          // return null;
          return $this.exceptionService.catchBadResponse(err);
        }), finalize(() =>
          $this.spinnerService.hide(),
      ));
  }
}
