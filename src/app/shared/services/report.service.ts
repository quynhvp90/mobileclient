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
// import { LoaderService } from '../../core/loader/loader.service';
const jsFilename = 'reportService: ';

@Injectable()
export class ReportService {
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

  public dowloadReport(format: string) {
    const $this = this;
    const msgHdr = jsFilename + 'getCurrentUser: ';
    const userId = this.userService.user._id.toString();
    console.log(msgHdr);
    const query = 'format=' + format + '&userId=' + userId;
    
    const setting: ISetting = {
      resource: `reports/export`,
      queryString: query,
    };
    $this.downloadReport = $this.apiService
      .get(setting).pipe(
        map((res) => {
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
    return $this.downloadReport;
  }

}

