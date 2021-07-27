// function getStatsByOrganization(organizationId) {
//   var msgHdr = jsFilename + 'getStatsByOrganization: ';
//   var deferred = $q.defer();
//   ApiService.getItem({
//     resource: 'jobs',
//     method: 'job-stats',
//     queryString: 'organization-id=' + organizationId,
//   }).then(function(resp) {
//     deferred.resolve(resp.data);
//   }, function(errGettingStats) {
//     $log.error(msgHdr + 'errGettingStats = ', errGettingStats);
//     deferred.reject(errGettingStats);
//   });
//   return deferred.promise;
// }

import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { Observable } from 'rxjs/Observable';
import { ApiService, ISetting, IFilter } from '../../../shared/services';
import { ExceptionService } from '../../../shared/services/exception.service';
import { SpinnerService } from '../../../shared/services/spinner.service';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { GlobalService } from '../../../shared/services/global.service';
import { UserService } from '../../../shared/services/user.service';
import { IJobUserStats } from '../interfaces/job.interface';

const jsFilename = 'ChallengeService: ';

@Injectable()
export class JobApiService {

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private globalService: GlobalService,
    private userService: UserService,
    private storage: Storage,
    private apiService: ApiService) {

    this.broadcastService.state.subscribe(() => {
      // console.log(jsFilename + ': getting challenge on state change');
      // this.getChallenges({});
    });
  }

  public getStatsByOrganization(organizationId: string): Observable<{
    allJobs: any[], // TO DO
    userStats: IJobUserStats[]; // TO DO
  }> {
    const $this = this;
    const msgHdr = jsFilename + 'getStatsByOrganization: ';

    const requestOptions = {
      queryParams: [],
    };

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
      resource: 'jobs/job-stats',
      queryString: 'organization-id=' + organizationId,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }

}
