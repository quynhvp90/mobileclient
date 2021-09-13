import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { ActivityService } from './activity.service';
import { IActivityLog, IActivityLogDocument } from '../models/activity-log/activity-log.interface';
import { IActivityDocument } from '../models/activity/activity.interface';
import { Platform } from '@ionic/angular';
import { HealthService } from './health.service';
import { IMessageSocial } from '../models/message.interface';
import { UserService } from './user.service';
export interface ILogCount {
  id: string;
  value: number;
  display: string;
}

const jsFilename = 'activityLogService: ';

@Injectable()
export class ActivityLogService {
  public foundActivityLogs: IActivityLogDocument[] = [];
  public total: 0;
  public loading = false;
  public filterSkip = 50;

  public activityId: string;
  constructor(
    private http: HttpClient,
    private platform: Platform,
    private exceptionService: ExceptionService,
    private activityService: ActivityService,
    private spinnerService: SpinnerService,
    private healthService: HealthService,
    private userService: UserService,
    private apiService: ApiService) { }

  public getSocialLogs(filter?: any): Observable<{
    items: IActivityLogDocument[],
    count: number,
  }> {
    const $this = this;
    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 10,
          sortOrder: 'desc',
          sortField: 'created',
        },
      }],
    };

    if (filter) {
      requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
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
      resource: 'activitylogs',
      queryString: query,
    };

    return this.apiService.get(setting)
      .pipe(
        map((results: {
          items: IActivityLogDocument[],
          count: number,
        }) => {
          return results;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public getActivityLogs(activityId: string, filter: {
    where?: {
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  }, options: {
    isReload?: boolean,
  }): Observable<{
    items: IActivityLogDocument[],
    count: number,
  }> {
    const $this = this;
    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 50,
          sortOrder: 'desc',
          sortField: 'created',
        },
      }],
    };

    if (filter) {
      requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
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

    let url = 'activitylogs';
    if (activityId) {
      url = 'activities/' + activityId + '/logs';
    }

    const setting: ISetting = {
      resource: url,
      queryString: query,
    };

    this.loading = true;

    if (options.isReload) {
      $this.foundActivityLogs = [];
    }

    return this.apiService.get(setting)
      .pipe(
        map((results: {
          items: IActivityLogDocument[],
          count: number,
        }) => {
          this.loading = false;
          $this.foundActivityLogs = $this.foundActivityLogs.concat(results.items);
          return results;
        }), catchError((err) => {
          this.loading = false;
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public estimateActivityTime(foundActivity: IActivityDocument, count: number) {
    const msgHdr = jsFilename + 'estimateActivityTime: ';
    let durationMinutes = 1;
    if (!foundActivity) {
      return;
    }
    if (foundActivity.measurement === 'repetitions') {
      durationMinutes = Math.round(count / 45 * 100) / 100;
    } else if (foundActivity.measurement === 'distance') {
      if (foundActivity.name === 'bicycle_outdoor') {
        durationMinutes = Math.round(count * 3 * 100) / 100;
      } else if (foundActivity.name === 'running_outdoor') {
        durationMinutes = Math.round(count * 10 * 100) / 100;
      } else {
        durationMinutes = Math.round(count * 10 * 100) / 100;
      }
      console.log(msgHdr + 'durationMinutes = ', durationMinutes);
    } else if (foundActivity.measurement === 'time') {
      if (foundActivity.unit === 'sec') {
        durationMinutes = count * 60;
      } else if (foundActivity.unit === 'min') {
        durationMinutes = count;
      } else if (foundActivity.unit === 'hr') {
        durationMinutes = count / 60;
      }
    }

    return durationMinutes;
  }

  public postActivityLog(foundActivity: IActivityDocument, count: number, logDate?: Date, durationMinutes?: number, caloriesPerMinute?: number): Observable<IActivityLog> {
    const $this = this;
    const msgHdr = jsFilename + 'postActivityLog: ';

    if (!durationMinutes) {
      durationMinutes = $this.estimateActivityTime(foundActivity, count);
    }
    if (!caloriesPerMinute) {
      caloriesPerMinute = this.healthService.defaultCaloriesPerMinutes;
      if (foundActivity.caloriesPerMinute) {
        caloriesPerMinute = foundActivity.caloriesPerMinute;
      }
    }
    console.log(msgHdr + 'caloriesPerMinute = ' + caloriesPerMinute);
    console.log(msgHdr + 'durationMinutes = ' + durationMinutes);
    const calories = Math.round(caloriesPerMinute * durationMinutes * 1000) / 1000;

    const setting: ISetting = {
      resource: 'activities/' + foundActivity._id + '/logs',
      payload: {
        dateOffset: this.activityService.dateOffset,
        logDate: logDate,
        count: count,
        duration: durationMinutes,
        calories: calories,
        caloriesPerMinute: caloriesPerMinute,
        platforms: this.platform.platforms(),
      },
    };

    return this.apiService.post(setting)
      .pipe(
        map((createdActivityLog) => {
          $this.healthService.postActivityLog(foundActivity, <IActivityLogDocument> createdActivityLog, count, logDate, durationMinutes, calories);

          if (this.userService.user) {
            if (!this.userService.user.stats) {
              this.userService.user.stats = {
                activitiesLogged: 0,
              };
            }
          }
          this.userService.user.stats.activitiesLogged += 1;

          return createdActivityLog;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public deleteActivityLog(activityId: string, activityLogId: string): Observable<boolean> {
    this.spinnerService.show();
    const setting: ISetting = {
      resource: 'activities/' + activityId + '/logs/' + activityLogId,
    };
    return this.apiService.delete(setting)
      .pipe(
        map((res) => {
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public archiveActivityLogs(activityId: string): Observable<boolean> {
    const $this = this;
    const msgHdr = jsFilename + 'archiveLogs: ';
    console.log(msgHdr);
    const setting: ISetting = {
      resource: 'activities/' + activityId + '/logs/archive',
    };
    return this.apiService.post(setting)
      .pipe(
        map((res) => {
          return true;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public postActivityLogSocial(foundActivityLog: IActivityLogDocument, socialData: {
    emote?: string,
    comment?: string,
  }): Observable<IMessageSocial>  {
    const $this = this;
    const msgHdr = jsFilename + 'postActivityLogSocial: ';

    const setting: ISetting = {
      resource: 'activities/' + foundActivityLog.activityId + '/logs/' + foundActivityLog._id + '/social',
      payload: {
        emote: socialData.emote,
        comment: socialData.comment,
      },
    };

    return this.apiService.post(setting)
      .pipe(
        map((res) => {
          return res;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public deleteActivityLogSocial(foundActivityLog: IActivityLogDocument, socialId: string): Observable<boolean> {
    const setting: ISetting = {
      resource: 'activities/' + foundActivityLog.activityId + '/logs/' + foundActivityLog._id + '/social/' + socialId,
    };
    return this.apiService.delete(setting)
      .pipe(
        map((res) => {
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }),
      );
  }
}
