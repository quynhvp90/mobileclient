import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { IWorkoutDocument } from '../../../shared/models/workout/workout.interface';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService, AnimationService } from '../../../shared/services';
import { ListActivityIconsModal } from '../../../shared/modal/list-activity-icons/list-activity-icons-modal';
import { ModalController  } from '@ionic/angular';
import { ActivityEditModalComponent } from '../../../tab-activity/activity-modals/activity-edit-modal/activity-edit-modal.component';
import { ChallengeNewModalComponent } from 'src/app/challenges/challenge-modals/challenge-new-modal/challenge-new-modal.component';

const jsFilename = 'challenge-activities: ';

@Component({
  selector: 'challenge-activities-modal',
  templateUrl: './challenge-activities-modal.component.html',
  styleUrls: ['./challenge-activities-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeActivitiesModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundActivities: IActivityDocument[] = [];
  public foundWorkout: IWorkoutDocument; // any so tslint will not complain on new workout

  public primarycolor = '#FF6A01';
  public secondarycolor = '#FF8E3D';
  public saving = false;

  constructor(
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private activityService: ActivityService,
    private modalController: ModalController,
    private animationService: AnimationService,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    $this.getActivities($this.foundWorkout._id);

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);

      if (msg.name === 'activity-created') {
        $this.foundActivities.push(msg.message.activityObject);
      } else if (msg.name === 'activity-updated') {
        $this.foundActivities.forEach((foundActivity) => {
          if (msg.message.activityId === foundActivity._id) {
            foundActivity.goal = msg.message.activityObject.goal;
            foundActivity.name = msg.message.activityObject.name;
            foundActivity.label = msg.message.activityObject.label;
            foundActivity.measurement = msg.message.activityObject.measurement;
            foundActivity.unit = msg.message.activityObject.unit;
          }
        });
      } else if (msg.name === 'activity-removed') {
        let currIndex = -1;
        let foundIndex = -1;
        $this.foundActivities.forEach((foundActivity) => {
          currIndex += 1;
          if (msg.message.activityId === foundActivity._id) {
            foundIndex = currIndex;
          }
        });
        if (foundIndex >= 0) {
          $this.foundActivities.splice(foundIndex, 1);
        }
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

    if ($this.foundWorkout.name.length === 0) {
      $this.ionicAlertService.presentAlert('Workout name is required');
      return;
    }

    if (!this.foundActivities || this.foundActivities.length === 0) {
      $this.ionicAlertService.presentAlert('You must add at least one exercise');
      return;
    }

    $this.workoutService.updateWorkout(this.foundWorkout._id, {
      name: this.foundWorkout.name,
    }).subscribe((updateSuccess) => {
      if (updateSuccess) {
        $this.editChallengeModal(this.foundWorkout);
      }
    });
  }

  public async editChallengeModal(foundWorkout: IWorkoutDocument) {
    const $this = this;
    const msgHdr = jsFilename + 'editChallengeModal: ';
    console.info(msgHdr + 'foundWorkout._id = ', foundWorkout._id);

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeNewModalComponent,
        componentProps: {
          foundWorkout: foundWorkout,
          mode: 'new',
        },
        enterAnimation: $this.animationService.enterFromRight,
        leaveAnimation: $this.animationService.leaveToRight,
      });

    modal.onWillDismiss().then((detail) => {
      if (detail && detail.data && detail.data.foundChallenge) {
        $this.animationService.animateOff();
        $this.saving = true;
      }
    });

    modal.onDidDismiss().then((detail) => {
      if (detail && detail.data && detail.data.foundChallenge) {
        this.modalController.dismiss({
          foundChallenge: detail.data.foundChallenge,
        });
      }
    });
    await modal.present();
  }

  public reorder(event: any) {
    this.foundActivities = event.detail.complete(this.foundActivities);
    // update priority
    const payload: IUpdatePriority[] = [];
    for (let index = 0; index < this.foundActivities.length; index += 1) {
      const activity = this.foundActivities[index];
      payload.push({ activityId: activity._id, priority: index });
    }
    const subscription = this.activityService.updateOrder(payload).subscribe((isUpdated) => {
      if (isUpdated) {
        // this.toastService.activate('Updated Priority', 'succeed');
      }
    });
    this.subscriptions.push(subscription);
  }

  public async editActivity(activityId: string) {
    const $this = this;
    const msgHdr = jsFilename + 'editActivity: ';
    console.info(msgHdr + 'activityId = ', activityId);
    console.info(msgHdr + '$this.foundWorkout._id = ', $this.foundWorkout._id);

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityEditModalComponent,
      componentProps: {
        mode: 'edit',
        submode: 'challenge',
        activityId: activityId,
      },
    });
    modal.onDidDismiss().then((detail) => {
      console.log(msgHdr + 'detail = ', detail);
      if (detail !== null) {
        // if (detail.data === 'delete') {
        //   this.modalController.dismiss('close');
        // }
      }
    });
    await modal.present();
  }

  public deleteActivity (activity: IActivityDocument, $event) {
    const $this = this;
    $event.preventDefault();
    $event.stopPropagation();

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
        workoutId: $this.foundWorkout._id,
        // activityId: activityId,
      },
    });
    modal.onDidDismiss().then((detail) => {
      console.log('detail = ', detail);
      if (detail !== null) {
        if (detail.data === 'delete') {

        }
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
