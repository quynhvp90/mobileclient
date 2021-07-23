import { Injectable, Component, NgZone, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { IActivity, IActivityDocument } from '../models/activity/activity.interface';
import { map, take, catchError, finalize, share } from 'rxjs/operators';
import { default as dataExercises } from '../../../assets/data/exercises';
import { BroadcastService } from './broadcast.service';

const jsFilename = 'activityService: ';

export interface IUpdatePriority {
  activityId: string;
  priority: number;
}

@Injectable()
export class ActivityService {
  public activities: IActivityDocument[];
  public dateOffset = 0; // minus dates to log activities in the past
  public totalCaloriesBurned = 0;
  private subscriptions = [];

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private broadcastService: BroadcastService,
    private spinnerService: SpinnerService,
    private apiService: ApiService) {

    const msgHdr = jsFilename + 'constructor: ';
    const $this = this;

    this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        $this.updateProgress();
      }
    });
  }

  public getActivities(workoutIds: string[], fromDate: number, toDate: number, filter?: any, options?: {
    includeDupes: boolean,
  }): Observable<{
    count: number,
    items: IActivityDocument[],
  }> {
    const $this = this;

    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 100,
          where: {},
          sortField: 'priority',
          sortOrder: 'asc',
        },
      }],
    };

    if (workoutIds && workoutIds.length > 0) {
      if (workoutIds.length === 1) {
        requestOptions.queryParams[0].value.where = {
          workoutId: workoutIds[0],
        };
      } else {
        requestOptions.queryParams[0].value.where = {
          workoutId: {
            $in: workoutIds,
          },
        };
      }
    }

    if (filter) {
      requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
    }

    const timezoneoffset = (new Date()).getTimezoneOffset();
    // timezoneoffset = -360;
    let query = '&timezoneoffset=' + timezoneoffset;
    query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    if (requestOptions && requestOptions.queryParams) {
      requestOptions.queryParams.forEach((option) => {
        if (typeof option.value === 'string') {
          query += '&' + option.key + '=' + option.value;
        } else {
          query += '&' + option.key + '=' + encodeURIComponent(JSON.stringify(option.value));
        }
      });
    }

    if (options && options.includeDupes) {
      query += '&include-dupes=true';
    }

    const setting: ISetting = {
      resource: 'activities',
      queryString: query,
    };

    return this.apiService.get(setting)
      .pipe(
        map((activities: {
          items: IActivityDocument[],
          count: number,
        }) => {
          activities.items.forEach((item) => {
            if (!item.label) {
              item.label = $this.getLabel(item.name);
            }
          });
          if (fromDate > 0) {
            $this.activities = activities.items;
          }
          $this.updateProgress();
          return activities;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
    );
  }

  public getNextPriority() {
    let topPriority = 0;
    this.activities.forEach((activity) => {
      if (activity.priority > topPriority) {
        topPriority = activity.priority;
      }
    });
    return topPriority + 1;
  }

  public postActivity (payload: IActivityDocument): Observable<IActivityDocument> {
    const $this = this;

    const setting: ISetting = {
      resource: 'activities/',
      payload: payload,
    };

    return this.apiService.post(setting)
      .pipe(
        map((activity) => {
          return activity;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public getDefaultActivity () {
    if (!this.activities || this.activities.length === 0) {
      return null;
    }
    const listCurrentActivityName = [];
    this.activities.forEach((activity) => {
      listCurrentActivityName.push(activity.label);
    });
    const defaultItem = dataExercises.filter(item => listCurrentActivityName.indexOf(item.plural) === -1)[0];
    return defaultItem;
  }

  public getActivity(id: string, statsGroup?: {
    fromDate: number,
    toDate: number,
    groupBy: string,
  }): Observable<IActivityDocument> {
    const $this = this;
    let foundExistingActivity: IActivityDocument = null;

    if (this.activities) {
      this.activities.forEach((activity) => {
        if (activity._id === id) {
          foundExistingActivity = activity;
        }
      });
    }

    if (foundExistingActivity && !statsGroup) {
      return of(foundExistingActivity);
    }
     // we need update lastLogcount to show or not show modal PersonalRecord

    let query = null;
    if (statsGroup && statsGroup.fromDate) {
      query = 'group-by=' + statsGroup.groupBy + '&stats-from=' + statsGroup.fromDate + '&stats-to=' + statsGroup.toDate;
    }

    const timezoneoffset = (new Date()).getTimezoneOffset();
    // timezoneoffset = -360;
    query += '&timezoneoffset=' + timezoneoffset;

    const setting: ISetting = {
      resource: `activities/${id}`,
      queryString: query,
    };
    return this.apiService.get(setting)
      .pipe(
        map((activity: IActivityDocument) => {
          if (!activity.label) {
            activity.label = $this.getLabel(activity.name);
          }
          return activity;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public deleteActivity (id: string): Observable<IActivity> {
    const $this = this;
    const msgHdr = jsFilename + 'deleteActivity: ';
    const setting: ISetting = {
      resource: `activities/${id}`,
    };
    return this.apiService.delete(setting)
      .pipe(
        map((res) => {
          return true;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public getLabel(exercise: string) {
    let label = exercise;
    label = label.replace('up', '-up');
    label = label + 's';
    return label;
  }

  public updateOrder(payload: IUpdatePriority[]): Observable<boolean> {
    this.spinnerService.show();
    const $this = this;
    return this.apiService
      .patch({
        resource: 'activities/',
        payload: {
          data: payload,
        },
      })
      .pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public updateActivity(activity: IActivityDocument): Observable<boolean> {
    this.spinnerService.show();
    const $this = this;
    const activityId = activity._id;
    return this.apiService
      .patch({
        resource: `activities/${activityId}`,
        payload: activity,
      })
      .pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public updateProgress() {
    const msgHdr = jsFilename + 'updateProgress: ';
    const $this = this;
    $this.totalCaloriesBurned = 0;
    if (this.activities) {
      this.activities.forEach((activity) => {
        if (activity && activity.lookup) {
          $this.totalCaloriesBurned += activity.lookup.calories;
        }
      });
    }
    $this.totalCaloriesBurned = Math.round($this.totalCaloriesBurned * 100) / 100;
  }

}
