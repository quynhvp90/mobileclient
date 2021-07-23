import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { IUserDocument } from '../models/user/user.interface';
import { ApiService } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';

// import { LoaderService } from '../../core/loader/loader.service';
const jsFilename = 'userService: ';

@Injectable()
export class OrdersService {
  private updateUserObservable: Observable<boolean>;
  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private apiService: ApiService,
    private spinnerService: SpinnerService,
      
  ) {
    const $this = this;
  }
  // create order for input user
  public create(user: IUserDocument) {
    this.spinnerService.show();
    const $this = this;
    this.updateUserObservable = this.apiService
      .post({
        resource: `orders`,
        payload: user,
      })
      .pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
    return this.updateUserObservable;
  }
}

