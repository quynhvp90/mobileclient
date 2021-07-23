import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { enterFromRight } from '../../../shared/animations/enter-from-right';
import { leaveToRight } from '../../../shared/animations/leave-to-right';
import { ListActivityIconsModal } from '../../../shared/modal/list-activity-icons/list-activity-icons-modal';
import { MuscleModal } from '../../../shared/modal/muscle/muscle-modal';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { ActivityService, BroadcastService, IonicAlertService, ToastService, WorkoutService } from '../../../shared/services';
import { default as dataExercises, IExercise } from '../../../../assets/data/exercises';
import { SelectWorkoutModal } from 'src/app/shared/modal/select-workout/select-workout-modal';
import { IWorkoutDocument } from 'src/app/shared/models/workout/workout.interface';

const jsFilename = 'activityEditModal: ';

@Component({
  selector: 'activity-edit-modal',
  templateUrl: './activity-edit-modal.component.html',
  styleUrls: ['./activity-edit-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityEditModalComponent implements OnInit, OnDestroy {
  public foundActivity: IActivityDocument = null;
  public activityId: null; // mapped in from modal open
  public workoutId: string = null;
  public primarycolor = '#000000';
  public secondarycolor = '#cccccc';
  public display = 'push-ups';
  public activities: IActivityDocument[] = [];
  public mode = 'edit';
  public submode = 'workout';

  public exercise: IExercise = null;
  public youtubeLink: SafeResourceUrl = null;
  public test = 'a';

  private defaultName = 'pushup';
  private defaultLabel = 'push-ups';
  private defaultMuscles = 'shoulders,forearms,chest,neck';
  private defaultLogLabel = 'reps';
  private defaultGoal = 50;
  private defaultLogCount = 10;
  private subscriptions = [];

  constructor(
    private activityService: ActivityService,
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private router: Router,
    private location: Location ,
    private modalController: ModalController,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    if (this.activityId) {
      this.activityService.getActivity(this.activityId).subscribe((foundActivity) => {
        this.foundActivity = foundActivity;

        this.broadcastService.broadcast('activity-row-updated', {
          name: foundActivity.name,
          activityId: foundActivity._id.toString(),
        });
        this.updateActivityLabel({
          resetYoutube: true,
        });
      });
    }

    if (!this.workoutId) {
      this.workoutId = this.workoutService.getActiveWorkout()._id;
    }

    if (this.mode === 'new') {
      $this.foundActivity = {
        _id: null,
        name: this.defaultName,
        label: this.defaultLabel,
        measurement: 'repetitions',
        muscles: this.defaultMuscles,
        goal: this.defaultGoal,
        workoutId: this.workoutId,
        lastLogCount: this.defaultLogCount,
        logLabel: this.defaultLogLabel,
        personalRecord: 10,
        priority: this.activityService.getNextPriority(),
        created: null,
        modified: null,
      };

      // this.foundActivity.icon = this.foundActivity.name;

      const defaultExcersice = this.activityService.getDefaultActivity();
      if (defaultExcersice) {
        this.foundActivity.name = defaultExcersice.name;
        this.foundActivity.label = defaultExcersice.plural;
        this.foundActivity.muscles = defaultExcersice.muscles.join(',');
      }
    }
    this.updateActivityLabel({
      resetYoutube: true,
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }

  public save () {
    if (this.mode === 'new') {
      delete this.foundActivity._id;
      delete this.foundActivity.modified;
      delete this.foundActivity.created;
      this.activityService.postActivity(this.foundActivity).subscribe((activity) => {
        console.log('activity - ', activity);
        if (activity) {
          this.broadcastService.broadcast('activity-created', {
            _id: activity._id,
            name: activity.name,
            label: this.foundActivity.label,
            activityId: activity._id.toString(),
            activityObject: activity, // for update on activity-row component
          });
          // this.location.back();
          this.broadcastService.broadcast('reload-data');
          this.modalController.dismiss('close');
        }
      });
    } else if (this.mode === 'edit') {
      this.activityService.updateActivity(this.foundActivity).subscribe((savedSuccess) => {
        console.log('savedSuccess = ', savedSuccess);
        if (savedSuccess) {
          this.broadcastService.broadcast('activity-updated', {
            name: this.foundActivity.name,
            label: this.foundActivity.label,
            goal: this.foundActivity.goal,
            activityId: this.foundActivity._id.toString(),
            activityObject: this.foundActivity, // for update on activity-row component
          });
          this.broadcastService.broadcast('reload-data');
          this.modalController.dismiss('close');
        }
      });
    }
  }

  public async moveActivity() {
    console.log('moving');
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: SelectWorkoutModal,
        componentProps: {
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        console.log('detail = ', detail);
        const foundWorkout: IWorkoutDocument = detail.data;
        this.foundActivity.workoutId = detail.data._id;
        $this.activityService.updateActivity($this.foundActivity).subscribe((activity) => {
          $this.toastService.activate('Successfully moved your exercise to ' +  foundWorkout.name, 'success');
          if (activity) {
            this.broadcastService.broadcast('activity-updated', {
              name: this.foundActivity.name,
              label: this.foundActivity.label,
              goal: this.foundActivity.goal,
              activityId: this.foundActivity._id.toString(),
              activityObject: this.foundActivity, // for update on activity-row component
            });
            this.broadcastService.broadcast('reload-data');
            this.modalController.dismiss('close');
          }
        });
      }
    });
    await modal.present();
  }

  public delete() {
    const $this = this;
    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to remove the "' + this.foundActivity.label + '" exercise?', () => {
      const subscription = $this.activityService.deleteActivity(this.foundActivity._id).subscribe((isDeleted) => {
        if (isDeleted) {
          this.modalController.dismiss('delete');
          this.broadcastService.broadcast('reload-data');
          this.broadcastService.broadcast('activity-removed', {
            activityId: this.foundActivity._id.toString(),
          });
        }
      });
      $this.subscriptions.push(subscription);
    });
  }

  public async selectMuscles () {
    const $this = this;
    let muscles = '';
    if (this.mode === 'update' || $this.foundActivity.muscles) {
      muscles = $this.foundActivity.muscles;
    }

    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: MuscleModal,
        componentProps: {
          muscles: muscles,
        },
        enterAnimation: enterFromRight,
        leaveAnimation: leaveToRight,
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        console.log('The result:', detail.data);
        $this.foundActivity.muscles = detail.data;
      }
    });
    await modal.present();
  }

  public async changeIcon() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: ListActivityIconsModal,
        enterAnimation: enterFromRight,
        leaveAnimation: leaveToRight,
      });

    modal.onDidDismiss().then((result) => {
      if (result !== null && result.data !== 'close') {
        console.log('result = ', result);
        console.log('this.foundActivity = ', this.foundActivity);
        const exercise: {
          name: string,
          label: string,
          plural: string,
        } = result.data;

        if (!exercise) {
          return;
        }
        this.foundActivity.name = exercise.name;
        this.foundActivity.label = exercise.plural;
        // if (!this.foundActivity._id) {
        //   this.foundActivity.label = exercise.plural;
        // }
        // this.foundActivity.label = $this.activityService.getLabel(this.foundActivity.name);

        if (result.data) {
          $this.foundActivity.measurement = 'repetitions';
          $this.foundActivity.unit = 'reps';
          $this.foundActivity.weight = null;

          if (result.data.exerciseType.indexOf('weights') >= 0) {
            $this.foundActivity.measurement = 'repetitions';
            $this.foundActivity.weight = '25 lbs';
          } else {
            $this.foundActivity.weight = null;
          }

          console.log('detail.data.exerciseType = ', result.data.exerciseType);

          if ((result.data.exerciseType.indexOf('cardio') >= 0) && (result.data.name !== 'other')) {
            if (result.data.exerciseType.indexOf('outdoor') >= 0) {
              $this.foundActivity.measurement = 'distance';
              $this.foundActivity.unit = 'miles';
            } else {
              $this.foundActivity.measurement = 'time';
              $this.foundActivity.unit = 'min';
            }
          } else {
            // $this.foundActivity.weight = null;
          }
        }

        $this.updateActivityLabel({
          resetYoutube: true,
        });

        if (this.foundActivity) {
          this.broadcastService.broadcast('activity-row-updated', {
            name: exercise.name,
            activityId: this.foundActivity._id,
          });
        } else {
          this.broadcastService.broadcast('activity-new-icon', {
            name: exercise.name,
            activityId: this.foundActivity._id,
          });
        }
      }
    });
    await modal.present();
  }

  public measurementChange() {
    this.foundActivity.unit = 'reps';
    this.foundActivity.weight = null;

    if (this.foundActivity.measurement === 'distance') {
      this.foundActivity.unit = 'miles';
    } else if (this.foundActivity.measurement === 'time') {
      this.foundActivity.unit = 'min';
    } else if (this.foundActivity.measurement === 'weight') {
      this.foundActivity.unit = 'lbs';
    }
    this.updateActivityLabel();
  }

  public unitChange() {
    this.updateActivityLabel();
  }

  public updateActivityLabel(options?: {
    resetYoutube: boolean,
  }) {
    const msgHdr = jsFilename + 'updateActivityLabel: ';
    const $this = this;

    if (!this.foundActivity) {
      return;
    }

    this.foundActivity.logLabel = this.foundActivity.label;
    if (this.foundActivity.measurement === 'repetitions') {
      if (this.foundActivity.weight) {
        this.foundActivity.logLabel += ' @ ' + this.foundActivity.weight;
      }
    } else {
      if (this.foundActivity.unit) {
        this.foundActivity.logLabel = this.foundActivity.unit + ' ' + this.foundActivity.label;
      }
    }

    if (options && options.resetYoutube) {
      $this.youtubeLink = null;
      dataExercises.forEach((exercise) => {
        if (exercise.name === this.foundActivity.name) {
          $this.exercise = exercise;
          if (this.exercise && this.exercise.youtube) {
            $this.youtubeLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.exercise.youtube + '?rel=0');
            $this.test = this.exercise.youtube + '?rel=0';
          }
        }
      });
    }
  }

  public updateVideo() {
    this.youtubeLink = null;
    if (this.foundActivity.youtube && this.foundActivity.youtube.length === 11) {
      this.youtubeLink = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + this.foundActivity.youtube);
    }
  }

}
