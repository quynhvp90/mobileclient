import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
import { BroadcastService } from './broadcast.service';
import { IWorkout, IWorkoutDocument } from '../models/workout/workout.interface';
import { map, take, catchError, finalize, share } from 'rxjs/operators';

const jsFilename = 'workoutService: ';
@Injectable()
export class WorkoutService {
  public workouts: IWorkoutDocument[];
  public activeWorkout: IWorkoutDocument;

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private userService: UserService,
    private broadcastService: BroadcastService,
    private apiService: ApiService) {

    const msgHdr = jsFilename + 'constructor: ';
    const $this = this;

    this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        // $this.getWorkouts();
        // $this.resetActiveWorkout();
      }
    });
  }

  public setActiveWorkout(activeWorkout: IWorkoutDocument) {
    const $this = this;
    const msgHdr = jsFilename + 'setActiveWorkout: ';
    // $this.userService.setActiveWorkout(activeWorkout);
    $this.activeWorkout = activeWorkout;
  }

  public resetActiveWorkout() {
    const $this = this;
    const msgHdr = jsFilename + 'resetActiveWorkout: ';

    this.activeWorkout = null;

    if (this.userService && this.userService.user &&
      this.userService.user.lookups && this.userService.user.lookups.workouts && this.userService.user.lookups.workouts.length > 0) {

      this.userService.user.lookups.workouts.forEach((workout) => {
        if (this.activeWorkout) {
          return;
        }

        if (!this.userService.user.activeWorkoutId) {
          this.activeWorkout = workout;
        } else if (this.userService.user.activeWorkoutId === workout._id) {
          this.activeWorkout = workout;
        }
      });
      if (!$this.activeWorkout) {
        $this.activeWorkout = this.userService.user.lookups.workouts[0];
        $this.userService.user.activeWorkoutId = $this.activeWorkout._id;
      }
      return $this.activeWorkout;
    }
    console.error(msgHdr + 'unexpect missing workouts in user lookups');
  }

  public getActiveWorkout() {
    const $this = this;
    const msgHdr = jsFilename + 'getActiveWorkout: ';

    if ($this.activeWorkout) {
      return $this.activeWorkout;
    }

    return $this.resetActiveWorkout();
  }

  public resetWorkoutList(): Observable<{
    count: number,
    items: IWorkoutDocument[],
  }> {
    const msgHdr = 'resetWorkoutList: ';

    const filter = {
      where: {
        $or: [{
          workoutType: 'personal',
        }, {
          workoutType: 'challenge',
          archived: false,
        }],
      },
    };

    return this.getWorkouts(filter);
  }

  public getWorkouts(filter?: any): Observable<{
    count: number,
    items: IWorkoutDocument[],
  }> {
    const $this = this;
    const msgHdr = 'getWorkouts: ';

    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          // where: {
          //   workoutId: workoutId,
          // },
          limit: 200,
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
      resource: 'workouts',
      queryString: query,
    };

    return this.apiService.get(setting)
      .pipe(
        map((data: {
          items: IWorkoutDocument[],
          count: number,
        }) => {
          $this.workouts = data.items;
          $this.broadcastService.broadcast('updated-workouts');
          return data;
        }), catchError((err) => {
          console.trace();
          return $this.exceptionService.catchBadResponse(err);
        }),
    );
  }

  public postWorkout(payload: {
    name: string;
    workoutType: string;
  }): Observable<IWorkoutDocument> {
    const $this = this;

    const setting: ISetting = {
      resource: 'workouts/',
      payload: payload,
    };

    return this.apiService.post(setting)
      .pipe(
        map((workout) => {
          $this.broadcastService.broadcast('created-workout');
          return workout;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public getWorkout(id: string): Observable<IWorkoutDocument> {
    const $this = this;
    let foundExistingWorkout: IWorkoutDocument = null;

    if (this.workouts) {
      this.workouts.forEach((workout) => {
        if (workout._id === id) {
          foundExistingWorkout = workout;
        }
      });
    }

    if (foundExistingWorkout) {
      return of(foundExistingWorkout);
    }
     // we need update lastLogcount to show or not show modal PersonalRecord

    const query = null;

    const setting: ISetting = {
      resource: `workouts/${id}`,
      queryString: query,
    };
    return this.apiService.get(setting)
      .pipe(
        map((workout: IWorkoutDocument) => {
          return workout;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public deleteWorkout (id: string): Observable<IWorkout> {
    const $this = this;
    const msgHdr = jsFilename + 'deleteWorkout: ';
    const setting: ISetting = {
      resource: `workouts/${id}`,
    };

    this.spinnerService.show();
    return this.apiService.delete(setting)
      .pipe(
        map((res) => {
          return true;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public updateWorkout(workoutId: string, payload: any): Observable<boolean> {
    this.spinnerService.show();
    const $this = this;
    return this.apiService
      .patch({
        resource: `workouts/${workoutId}`,
        payload: payload,
      })
      .pipe(
        map((res) => {
          return true;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , finalize(() => this.spinnerService.hide()),
      );
  }

  public getNextWorkout() {
    const $this = this;
    const currentWorkout = $this.getActiveWorkout();

    let currentIndex = -1;
    let nextIndex = 1;

    let i = -1;

    if (!$this.workouts || $this.workouts.length === 0) {
      return;
    }

    $this.workouts.forEach((foundWorkout) => {
      i += 1;
      if (currentWorkout._id === foundWorkout._id) {
        currentIndex = i;
      }
    });
    if (currentIndex < 0) {
      return;
    }
    nextIndex = currentIndex + nextIndex;
    if (nextIndex < 0) {
      nextIndex = $this.workouts.length - 1;
    } else if (nextIndex >= $this.workouts.length) {
      nextIndex = 0;
    }
    return $this.workouts[nextIndex];
  }

}
