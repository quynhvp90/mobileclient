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
const jsFilename = 'LoginService: ';

@Injectable()
export class LoginService {
  private loginObservable: Observable<string>;
  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private apiService: ApiService,
    private userService: UserService
  ) { }

  public login(loginModel: any) {
    const msgHdr = jsFilename + 'login: ';
    const body = JSON.stringify(loginModel);
    const $this = this;
    // $this.spinnerService.show();

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
          return $this.exceptionService.catchBadResponse(err);
        }), finalize(() =>
          $this.spinnerService.hide(),
      ));
  }
}
