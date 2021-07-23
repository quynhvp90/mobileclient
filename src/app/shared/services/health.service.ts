declare const Rollbar: any;

import { Component, Injectable, Optional, SkipSelf } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { IonicAlertService } from './ionic.alert.service';
import { UserService } from './user.service';
const { TrackingPlugin } = Plugins;
import { default as dataExercises } from '../../../assets/data/exercises';
import { IActivityDocument } from '../models/activity/activity.interface';
import { IActivityLogDocument } from '../models/activity-log/activity-log.interface';
import { ApiService, ISetting } from './api.service';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { ExceptionService } from './exception.service';

const exertionMapping = {
  easy: 2.6,
  medium: 3.3,
  hard: 3.7,
  very_hard: 4.5,
};

const jsFilename = 'healthService: ';

interface IStoreWorkout {
  startDate: Date;
  endDate: Date;
  duration: number; // in seconds
  activityType: string;
  calories: number;
  activityLogLabel: string;
  distance?: number; // GoogleFit
  repetitions?: number; // GoogleFit
  speed?: number; // GoogleFit
  measurement: string; // internal
}

@Injectable()
export class HealthService {
  public logs: string[] = [];

  constructor(
    @Optional() @SkipSelf() prior: HealthService,
    private ionicAlertService: IonicAlertService,
    private apiService: ApiService,
    private exceptionService: ExceptionService,
    private userService: UserService,
  ) {
    if (prior) {
      return prior;
    }
  }

  public defaultCaloriesPerMinutes = 8;

  public exertionMapping = {
    easy: 0.044,
    medium: 0.055,
    hard: 0.063,
    very_hard: 0.077,
  };

  public activateAppleHealthKit() {
    const $this = this;
    $this.logs.push(Date.now() + ': activating Apple Health Kit');
    return TrackingPlugin.authorize().then((res: any) => {
      $this.logs.push(Date.now() + ': activate success');
      $this.logs.push(Date.now() + ': res = ' + res.toString());
      // console.log('res = ', res);
    })
    .catch((errIntegrateAppleHealthKit: Error) => {
      $this.logs.push(Date.now() + ': activate failed');
      $this.logs.push(Date.now() + ': errIntegrateAppleHealthKit = ' + errIntegrateAppleHealthKit.toString());
      console.error('errIntegrateAppleHealthKit = ', errIntegrateAppleHealthKit);
      throw errIntegrateAppleHealthKit;
    });
  }

  public activateGoogleFit() {
    const $this = this;
    $this.logs = [];
    $this.logs.push(Date.now() + ': activate Google Fit');

    return TrackingPlugin.authorize({
      message: 'hello world',
    }).then((activateGoogleFitRes: any) => {
      $this.logs.push(Date.now() + ': activate success');
      // console.log('activateGoogleFitRes = ', JSON.stringify(activateGoogleFitRes, null, 4));
    })
    .catch((errActivateGoogleFit: Error) => {
      $this.logs.push(Date.now() + ': activate error');
      $this.logs.push(Date.now() + ': errActivateGoogleFit = ' + errActivateGoogleFit);
      console.error('errActivateGoogleFit = ', errActivateGoogleFit);
      throw errActivateGoogleFit;
    });
  }

  public postActivityLog(foundActivity: IActivityDocument, foundActivityLog: IActivityLogDocument, count: number, logDate: Date, durationMinutes: number, calories: number) {
    const msgHdr = jsFilename + 'postActivityLog: ';
    const $this = this;

    return new Promise((resolve, reject) => {

      $this.logs = [];
      $this.logs.push(Date.now() + ':' + msgHdr);

      if (!logDate) {
        logDate = new Date();
      }

      const endDate = new Date(logDate);
      const startDate = new Date(logDate.getTime() - durationMinutes * 60000);

      // console.log(msgHdr + 'calories = ', calories);
      // console.log(msgHdr + 'durationMinutes = ', durationMinutes);
      // console.log(msgHdr + 'endDate = ', endDate);
      // console.log(msgHdr + 'startDate = ', startDate);
      // console.log(msgHdr + 'activityLogLabel = ', foundActivityLog.activityLogLabel);

      let postToTrackingPlugin = false;

      if (this.userService && this.userService.user && this.userService.user.health) {
        if (this.userService.user.health.appleHealthKitEnabled) {
          postToTrackingPlugin = true;
        }
        if (this.userService.user.health.googleFitEnabled) {
          postToTrackingPlugin = true;
        }
      }

      if (!postToTrackingPlugin) {
        $this.logs.push(Date.now() + ':healthkit or google fit not configured');
        resolve('not-configured');
        return;
      }

      const workout: IStoreWorkout = {
        startDate: startDate,
        endDate: endDate,
        duration: durationMinutes * 60, // stores in seconds
        activityType: foundActivity.name,
        calories: calories,
        measurement: foundActivity.measurement,
        activityLogLabel: foundActivityLog.activityLogLabel,
      };

      if  (foundActivity.measurement === 'distance') {
        workout.distance = count;
      } else {
        workout.repetitions = count;
      }

      this.storeWorkout(workout).then((res: any) => {
        res.syncDate = new Date();
        $this.logs.push(Date.now() + ':res = ' + JSON.stringify(res));

        const link = 'activities/' + foundActivity._id + '/logs/' + foundActivityLog._id + '/health';
        const setting: ISetting = {
          resource: link,
          payload: {
            health: res,
          },
        };

        $this.logs.push(Date.now() + ':posting res to ' + link);
        this.apiService.post(setting).subscribe(() => {
          $this.logs.push(Date.now() + ':done posting res');
          this.storeActiveEnergy(startDate, endDate, calories);
          resolve('done');
        }, (errPosting) => {
          $this.logs.push(Date.now() + ':errPosting ' + JSON.stringify(errPosting, null, 4));
          reject('Error syncing - check logs');
        }, () => {
          $this.logs.push(Date.now() + ':complete');
        });
      });
    });
  }

  public getCaloriesPerMinute(activityName: string) {
    let caloriesPerMinutePerPount = exertionMapping.medium;

    dataExercises.forEach((exercise) => {
      if (exercise.name === activityName) {
        const exertionLevel = exercise.exertionLevel;
        caloriesPerMinutePerPount =  this.exertionMapping[exertionLevel];
      }
    });
    if (!caloriesPerMinutePerPount) {
      caloriesPerMinutePerPount = exertionMapping.medium;
    }

    let weight = 150;
    let weightUnit = 'lbs';
    if (this.userService && this.userService.user && this.userService.user.health) {
      if (this.userService.user.health.weight) {
        weight = this.userService.user.health.weight;
      }
      if (this.userService.user.health.weightUnit) {
        weightUnit = this.userService.user.health.weightUnit;
        if (weightUnit === 'kg') {
          weight = weight / 2.205;
        }
      }
    }
    return Math.round(caloriesPerMinutePerPount * weight * 10) / 10;
  }

  public getDistance() {
    console.log('calling getDistance from angular');
    TrackingPlugin.getDistance({ startDate: '2019/07/01' })
    .then((res) => {
      console.log('res = ', res);
    })
    .catch((err) => {
      console.log('err = ', err);
    });
  }

  public storeActiveEnergy(startDate: Date, endDate: Date, calories: number) {
    const msgHdr = 'storeActiveEnergy: ';

    const storeActiveEnergyPayload = {
      startDate: startDate,
      endDate: endDate,
      calories: calories,
    };
    // console.log(msgHdr + 'storeActiveEnergyPayload = ', storeActiveEnergyPayload);

    TrackingPlugin.storeActiveEnergy(storeActiveEnergyPayload)
    .then((res: any) => {
      // console.log(msgHdr + 'res = ', res);
    })
    .catch((errStoreActivityEnergy: Error) => {
      console.log(msgHdr + 'errStoreActivityEnergy = ', errStoreActivityEnergy);
      if (Rollbar) Rollbar.error(errStoreActivityEnergy);
    });
  }

  private storeWorkout(options: IStoreWorkout) {
    const msgHdr = 'storeWorkout: ';
    const $this = this;

    const storeWorkoutPayload = options;
    // console.log(msgHdr + 'storeWorkoutPayload = ', storeWorkoutPayload);

    return new Promise((resolve, reject) => {
      TrackingPlugin.storeWorkout(storeWorkoutPayload)
      .then((res: any) => {
        console.log(msgHdr + 'res = ', res);
        const resJSON = JSON.stringify(res);
        resolve({
          status: 'success',
          res: resJSON,
        });
      })
      .catch((err: Error) => {
        console.error(msgHdr + 'err = ', err);
        if (err && err.toString().indexOf('user has not granted access to GoogleFit') >= 0) {
          console.error(msgHdr + 'denying GoogleFit access');
          $this.userService.user.health.googleFitEnabled = false;
          $this.userService.user.health.googleFitErrorMessage = 'user access denied';
          this.userService.updateUser({
            _id:  $this.userService.user._id,
            health:  $this.userService.user.health,
          }).subscribe((result) => {
          });
        }

        let errMsg = 'no nessage';
        try {
          if (err) {
            errMsg = err.toString();
          }
        } catch (e) {
          errMsg = 'error trying to parse message';
          console.error('error trying to sending to health systsem, e = ', e);
        }
        if (Rollbar) Rollbar.error(errMsg);

        resolve({
          status: 'failure',
          res: errMsg,
        });
      });
    });
  }

}
