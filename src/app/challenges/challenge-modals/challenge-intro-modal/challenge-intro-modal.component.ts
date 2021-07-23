import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { IWorkoutDocument } from '../../../shared/models/workout/workout.interface';
import { BroadcastService, ChallengeService, UserService, WorkoutService, AnimationService } from '../../../shared/services';
import { ChallengeActivitiesModalComponent } from '../challenge-activities-modal/challenge-activities-modal.component';
const jsFilename = 'challenge-list: ';

@Component({
  selector: 'challenge-intro-modal',
  templateUrl: './challenge-intro-modal.component.html',
  styleUrls: ['./challenge-intro-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeIntroModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public workouts: IWorkoutDocument[] = [];
  public saving = false;
  public autoStart = false;
  private loader: HTMLIonLoadingElement;

  constructor(
    private modalController: ModalController,
    private workoutService: WorkoutService,
    private animationService: AnimationService,
    public userService: UserService,
    private loadingController: LoadingController,
  ) {
  }

  public ngOnInit(): void {
    const $this = this;

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      if ($this.autoStart) {
        $this.nextStep();
      }
    });

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public async dismiss() {
    await this.modalController.dismiss('close');
  }

  public async nextStep() {
    const $this = this;

    if ($this.loader) {
      $this.loader.present();
    }
    this.workoutService.postWorkout({
      name: 'challenge ' + (new Date()).getTime(),
      workoutType: 'challenge',
    }).subscribe((createdWorkout) => {
      $this.loader.dismiss();
      if (createdWorkout) {
        $this.editWorkoutModal(createdWorkout);
      }
    });
  }

  public async editWorkoutModal(foundWorkout: IWorkoutDocument) {
    const $this = this;
    const msgHdr = 'editWorkoutModal: ';
    console.info(msgHdr + 'foundWorkout._id = ', foundWorkout._id);

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeActivitiesModalComponent,
        componentProps: {
          foundWorkout: foundWorkout,
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
      console.log(msgHdr + 'detail = ', detail);
      if (detail && detail.data && detail.data.foundChallenge) {
        this.modalController.dismiss({
          foundChallenge: detail.data.foundChallenge,
        });
      } else {
        if ($this.autoStart) {
          $this.dismiss();
        }
      }
    });
    await modal.present();
  }
}
