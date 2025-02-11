import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { Observable } from 'rxjs/Observable';
import { ApiService, ISetting, IFilter, AlertService } from '../../../shared/services';
import { ExceptionService } from '../../../shared/services/exception.service';
import { SpinnerService } from '../../../shared/services/spinner.service';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { GlobalService } from '../../../shared/services/global.service';
import { UserService } from '../../../shared/services/user.service';
import { IJobUserStats } from '../interfaces/job.interface';
import { of } from 'rxjs';
import IApplicationDocument from 'src/app/shared/models/application/application.interface';
import { OrganizationDataService } from 'src/app/shared/data-services/organizationData.service';

const jsFilename = 'ChallengeService: ';

@Injectable()
export class ApplicationApiService {

  public foundApplication: IApplicationDocument;

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private globalService: GlobalService,
    private userService: UserService,
    private organizationDataService: OrganizationDataService,
    private storage: Storage,
    private alertService: AlertService,
    private apiService: ApiService) {

    this.broadcastService.state.subscribe(() => {
      // console.log(jsFilename + ': getting challenge on state change');
      // this.getChallenges({});
    });
  }

  public getApplicationsToReview(jobId: string, stage: string, queryObj: any): Observable<{
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
    } else if (stage === 'qualified') {
      status.push('revealed');
    } else {
      console.error('showing alerting not yet configured');
      this.alertService.error('not yet configured');
      return of({
        count: 0,
        items: [],
      });
    }

    if (!queryObj.where) {
      queryObj.where = {};
    }
    const organizationUserId = this.organizationDataService.organizationUserId;
    queryObj.where.organizationId = $this.userService.user.defaultOrganizationId;
    queryObj.where.jobId = jobId;
    queryObj.where.status = status;
    if (organizationUserId) {
      queryObj.where['actionRequired.' + organizationUserId] = 'review';
    }

    console.log('$this.organizationDataService.organization = ', $this.organizationDataService.organization);

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

  public getApplication(applicationId: string): Observable<IApplicationDocument> {
    const $this = this;
    const msgHdr = jsFilename + 'getApplication: ';

    const setting: ISetting = {
      resource: 'applications/' + applicationId,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          $this.foundApplication = <IApplicationDocument> res;
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }
}
