import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { IWorkoutDocument } from '../../../shared/models/workout/workout.interface';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService } from '../../../shared/services';
import { ListActivityIconsModal } from '../../../shared/modal/list-activity-icons/list-activity-icons-modal';
import { ModalController  } from '@ionic/angular';
import { ActivityEditModalComponent } from '../../../tab-activity/activity-modals/activity-edit-modal/activity-edit-modal.component';

const jsFilename = 'workout-edit: ';

@Component({
  selector: 'workout-edit-modal',
  templateUrl: './workout-edit-modal.component.html',
  styleUrls: ['./workout-edit-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WorkoutEditModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundActivities: IActivityDocument[] = [];
  public foundWorkout: IWorkoutDocument; // any so tslint will not complain on new workout

  public primarycolor = '#FF6A01';
  public secondarycolor = '#FF8E3D';

  constructor(
    private workoutService: WorkoutService,
    private userService: UserService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private activityService: ActivityService,
    private modalController: ModalController,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    if ($this.foundWorkout) {
      $this.getActivities($this.foundWorkout._id);
    } else {
      $this.foundWorkout = {
        name: null,
        _id: null,
        created: null,
        modified: null,
      };
    }

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      if (msg.name === 'activity-created') {
        $this.foundActivities.push(msg.message.activityObject);
      } else if (msg.name === 'activity-updated') {
        const updatedActivity: IActivityDocument = msg.message.activityObject;

        $this.foundActivities.forEach((foundActivity) => {
          if (foundActivity._id === updatedActivity._id) {
            foundActivity.goal = updatedActivity.goal;
            foundActivity.label = updatedActivity.label;
            foundActivity.logLabel = updatedActivity.logLabel;
            foundActivity.unit = updatedActivity.unit;
          }
        });
      }
    });
    this.subscriptions.push(subscription);
  }

  public ionViewWillEnter() {

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  public save () {
    const $this = this;

    if (!$this.foundWorkout || !$this.foundWorkout.name || $this.foundWorkout.name.length === 0) {
      $this.ionicAlertService.presentAlert('Workout name is required');
      return;
    }

    if (this.foundWorkout._id) {
      if (!this.foundActivities || this.foundActivities.length === 0) {
        $this.ionicAlertService.presentAlert('You must add at least one exercise');
        return;
      }
      $this.workoutService.updateWorkout(this.foundWorkout._id, {
        name: this.foundWorkout.name,
      }).subscribe((updateSuccess) => {
        if (updateSuccess) {
          $this.workoutService.setActiveWorkout($this.foundWorkout);
          $this.broadcastService.broadcast('workout-updated', {
            workout: this.foundWorkout,
          });
          this.modalController.dismiss({
            action: 'update',
            workout: this.foundWorkout,
          });
        }
      });
    } else {
      this.workoutService.postWorkout({
        name: this.foundWorkout.name,
        workoutType: 'personal',
      }).subscribe((createdWorkout) => {
        if (createdWorkout) {
          $this.foundWorkout = createdWorkout;

          $this.getActivities($this.foundWorkout._id);

          $this.workoutService.setActiveWorkout($this.foundWorkout);
          $this.broadcastService.broadcast('workout-updated', {
            workout: this.foundWorkout,
          });
        }
      });
    }
  }

  public delete() {
    const $this = this;

    if ($this.workoutService.workouts.length === 1) {
      $this.ionicAlertService.presentAlert('You cannot delete this workout, as at least one workout is required');
      return;
    }

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to permanently delete this workout?', () => {
      const subscription = $this.workoutService.deleteWorkout(this.foundWorkout._id).subscribe((isDeleted) => {
        if (isDeleted) {
          $this.userService.user.activeWorkoutId = null;
          const newWorkout = $this.workoutService.resetActiveWorkout();
          this.broadcastService.broadcast('workout-deleted', {
            workout: newWorkout,
          });
          this.modalController.dismiss();
          $this.broadcastService.broadcast('update-screen');
        }
      });
      $this.subscriptions.push(subscription);
    });
  }

  public reorder(event: any) {
    const $this = this;
    this.foundActivities = event.detail.complete(this.foundActivities);
    this.reorderActivities();
  }

  public reorderActivities() {
    // update priority
    const $this = this;
    const payload: IUpdatePriority[] = [];
    for (let index = 0; index < this.foundActivities.length; index += 1) {
      const activity = this.foundActivities[index];
      payload.push({ activityId: activity._id, priority: index });
    }
    const subscription = this.activityService.updateOrder(payload).subscribe((savedSuccess) => {
      if (savedSuccess) {
        // this.toastService.activate('Updated Priority', 'succeed');
        $this.broadcastService.broadcast('reload-data');
      }
    });
    this.subscriptions.push(subscription);
  }

  public async editActivity(activityId: string) {
    const $this = this;

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityEditModalComponent,
      componentProps: {
        mode: 'edit',
        activityId: activityId,
      },
    });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        // if (detail.data === 'delete') {
        //   this.modalController.dismiss('close');
        // }
      }
    });
    await modal.present();
  }

  public deleteActivity (activity: IActivityDocument, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    const $this = this;
    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to remove the "' + activity.label + '" exercise?', () => {
      const subscription = $this.activityService.deleteActivity(activity._id.toString()).subscribe((isDeleted) => {
        if (isDeleted) {
          // display process
          const index = $this.foundActivities.indexOf(activity);
          if (index > -1) {
            setTimeout(() => { $this.foundActivities.splice(index, 1); }, 100);
          // setTimeout(() => { $this.getActivities(); }, 50); // this.foundActivities.splice(index, 1); }, 500);
          }
          $this.broadcastService.broadcast('update-screen');
        }
      });
      $this.subscriptions.push(subscription);
    });
  }

  private getActivities(workoutId: string) {
    const $this = this;
    const fromDateDT = new Date();
    fromDateDT.setDate(fromDateDT.getDate() + this.activityService.dateOffset);
    const toDateDT = new Date();
    toDateDT.setDate(toDateDT.getDate() + this.activityService.dateOffset);

    const fromDate = (fromDateDT).setHours(0, 0, 0, 0);
    const toDate = (toDateDT).setHours(23, 59, 59, 0);

    const subscription = this.activityService.getActivities([workoutId], fromDate, toDate, {}).subscribe((data) => {
      $this.foundActivities = data.items;
    });
    this.subscriptions.push(subscription);
  }

  public async createActivity() {
    const $this = this;
    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityEditModalComponent,
      componentProps: {
        mode: 'new',
        // activityId: activityId,
      },
    });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null) {
        if (detail.data === 'delete') {

        }
        $this.reorderActivities();
      }
    });
    await modal.present();
  }

  public async changeIcon() {
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: ListActivityIconsModal,
      });

    modal.onDidDismiss().then((result) => {
      if (result !== null) {
        const exercise: {
          name: string,
          label: string,
          plural: string,
        } = result.data;
        this.foundWorkout.icon =  exercise.name;
        this.broadcastService.broadcast('activity-new-icon', {
          name: exercise.name,
        });
      }
    });
    await modal.present();
  }

}
