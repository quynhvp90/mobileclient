import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { Observable } from 'rxjs/Observable';
import { ApiService, ISetting, IFilter, OrganizationService, AlertService } from '../../../shared/services';
import { ExceptionService } from '../../../shared/services/exception.service';
import { SpinnerService } from '../../../shared/services/spinner.service';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { GlobalService } from '../../../shared/services/global.service';
import { UserService } from '../../../shared/services/user.service';
import { IJobUserStats } from '../interfaces/job.interface';
import { of } from 'rxjs';

const jsFilename = 'ChallengeService: ';

@Injectable()
export class ApplicationApiService {

  public foundApplication: any; // @Quynh - need to provide interface

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private globalService: GlobalService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private storage: Storage,
    private alertService: AlertService,
    private apiService: ApiService) {

    this.broadcastService.state.subscribe(() => {
      // console.log(jsFilename + ': getting challenge on state change');
      // this.getChallenges({});
    });
  }

  public getApplicationsToReview(jobId: string, stage: string,): Observable<{
    count: number,
    items: any[]
  }> {
    const $this = this;
    const msgHdr = jsFilename + 'getApplications: ';

    const status: string[] = []; 
    if (stage === 'stage2') {
      status.push('stage2-submitted');
      status.push('stage2-review');
    } else if (stage === 'stage3') {
      status.push('stage3-submitted');
      status.push('stage3-review');
    } else {
      console.error('showing alerting not yet configured');
      this.alertService.error('not yet configured');
      return of({
        count: 0,
        items: [],
      });
    }

    console.log('$this.organizationService.organization = ', $this.organizationService.organization);

    const queryObj = {
      sortField: "stageXsubmitted",
      sortFieldTable: "stageXsubmitted",
      sortOrder: "asc",
      limit: 20,
      page: 1,
      skip: 0,
      fields: {
        results: 0
      },
      where: {
        organizationId: $this.userService.user.defaultOrganizationId,
        jobId: jobId,
        status: status
      }
    }

    const setting: ISetting = {
      resource: 'applications',
      queryString: 'login-type=employer&summary=true&filter=' + encodeURIComponent(JSON.stringify(queryObj)),
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

  public getApplication(applicationId: string): Observable<{
    count: number,
    items: any[]
  }> {
    const $this = this;
    const msgHdr = jsFilename + 'getApplication: ';

    const setting: ISetting = {
      resource: 'applications/' + applicationId,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          $this.foundApplication = res;
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }
}
