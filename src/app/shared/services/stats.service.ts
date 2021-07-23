import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';
import { ApiService, ISetting } from './api.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
const jsFilename = 'statsService: ';

@Injectable()
export class StatsService {
  private downloadReport: Observable<boolean>;

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

  public getStats() {
    const $this = this;
    const msgHdr = jsFilename + 'getStats: ';

    const timezoneoffset = (new Date()).getTimezoneOffset();
    // timezoneoffset = -360;
    const query = '&timezoneoffset=' + timezoneoffset;

    // query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    const setting: ISetting = {
      resource: 'stats',
      queryString: query,
    };

    return $this.apiService
      .get(setting).pipe(
        map((res) => {
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }

  public getStatsWeekly() {
    const $this = this;
    const msgHdr = jsFilename + 'getStatsWeekly: ';

    const timezoneoffset = (new Date()).getTimezoneOffset();
    const query = 'timezoneoffset=' + timezoneoffset;

    const setting: ISetting = {
      resource: 'stats/weekly',
      queryString: query,
    };

    return $this.apiService
      .get(setting).pipe(
        map((res) => {
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }
}
