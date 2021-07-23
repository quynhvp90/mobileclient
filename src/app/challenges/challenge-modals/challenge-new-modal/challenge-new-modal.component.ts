import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IWorkoutDocument } from '../../../shared/models/workout/workout.interface';
import {
  BroadcastService,
  WorkoutService,
  ChallengeService,
  UserService,
  IonicAlertService,
} from '../../../shared/services';
import { IChallengeDocument, IChallenge, IChallengeUser } from '../../../shared/models/challenge/challenge.interface';
import { SelectImageModal } from 'src/app/shared/modal/select-image/select-image-modal';
import { ChallengeTeamsModalService } from '../challenge-teams-modal/challenge-teams-modal.service';

@Component({
  selector: 'challenge-new-modal',
  templateUrl: './challenge-new-modal.component.html',
  styleUrls: ['./challenge-new-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeNewModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundWorkout: IWorkoutDocument = null;
  public foundChallenge: IChallengeDocument = null;
  public workouts: IWorkoutDocument[] = [];

  public challengeName = null;
  public challengeStart = 'today';
  public challengeDescription = null;
  public challengeEnd = 1;
  public durationDesc = '';

  public showAdvanced = false;

  public challengeStartDate = null;
  public challengeEndDate = null;

  public saving = false;
  public mode = 'new';

  public notifications = {
    broadcastStatus: true,
    broadcastJoins: true,
  };

  public advanced: {
    donateUrl?: string;
    showTotalsInsteadOfPercent?: boolean;
    bannerImage?: string;
  } = {
    donateUrl: null,
    showTotalsInsteadOfPercent: false,
    bannerImage: null,
  };

  public resetCounters = false;

  constructor(
    private userService: UserService,
    private broadcastService: BroadcastService,
    private workoutService: WorkoutService,
    private modalController: ModalController,
    private ionicAlertService: IonicAlertService,
    private challengeService: ChallengeService,
    private challengeTeamsModalService: ChallengeTeamsModalService,
  ) {
  }

  public ngOnInit(): void {
    const $this = this;
    // $this.getData();
    $this.getDuration();

    if ($this.foundChallenge) {
      $this.advanced = $this.foundChallenge.advanced;
      $this.notifications = $this.foundChallenge.notifications;
      $this.challengeDescription = $this.foundChallenge.description;
      $this.challengeName = $this.foundChallenge.name;
      $this.challengeStartDate = $this.foundChallenge.startDate.toString();
      $this.challengeEndDate = $this.foundChallenge.endDate.toString();
      $this.resetCounters = false;
      if ($this.foundChallenge.resetDate) {
        $this.resetCounters = true;
      }
    }

    if (!$this.challengeStartDate) {
      $this.challengeStartDate = (new Date()).toString();
      $this.challengeEndDate = (new Date()).toString();
    }
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public setupTeams() {
    const $this = this;
    $this.challengeTeamsModalService.openTeams($this.foundChallenge);
  }

  public getDuration() {
    const $this = this;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    if ($this.challengeStart === 'tomorrow') {
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
    }

    const midnightOfStartDate = new Date(start);
    midnightOfStartDate.setHours(0, 0, 0, 0);
    const end = new Date(midnightOfStartDate.getTime() + $this.challengeEnd * 24 * 60 * 60 * 1000 - 60 * 1000);

    $this.durationDesc = start.toLocaleDateString() + ' ' + start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' to ' + end.toLocaleDateString() +
      ' ' + end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  public ionViewWillEnter() {

  }

  public async dismiss() {
    await this.modalController.dismiss();
  }

  public nextStep() {
    const $this = this;

    if (!$this.challengeName || $this.challengeName.length === 0) {
      $this.ionicAlertService.presentAlert('You must enter a challenge name');
      return;
    }

    const challengeUsers: IChallengeUser[] = [];

    challengeUsers.push({
      userId: this.userService.user._id,
      organizationId: this.userService.user.organizationId,
      role: 'owner',
      invitationStatus: 'accepted',
      workoutId: $this.foundWorkout._id,
    });

    $this.createChallenge(challengeUsers);
  }

  public createChallenge(challengeUsers?: IChallengeUser[]) {
    const $this = this;

    const newChallenge: IChallenge = this.getNewChallengeObject();

    newChallenge.workoutId = $this.foundWorkout._id;
    newChallenge.users = challengeUsers;

    const subscription = $this.challengeService.createChallenge(newChallenge).subscribe((foundChallenge) => {
      this.broadcastService.broadcast('update-challenges');

      $this.workoutService.updateWorkout($this.foundWorkout._id, {
        name: $this.challengeName,
      }).subscribe((updateWorkout) => {
        this.modalController.dismiss({
          foundChallenge: foundChallenge,
        });
        $this.workoutService.resetWorkoutList().subscribe(() => { });
      });

    });
    $this.subscriptions.push(subscription);
  }

  private getNewChallengeObject() {
    const $this = this;
    $this.challengeStartDate = new Date($this.challengeStartDate);
    $this.challengeEndDate = new Date($this.challengeEndDate);

    $this.challengeStartDate.setHours(0, 0, 0, 0);

    const midnightOfEndDate = new Date($this.challengeEndDate);
    midnightOfEndDate.setHours(0);
    midnightOfEndDate.setMinutes(0);
    midnightOfEndDate.setSeconds(0);

    $this.challengeEndDate = new Date(midnightOfEndDate.getTime() + 24 * 60 * 60 * 1000 - 60 * 1000);

    const midnightOfStartDate = new Date($this.challengeStartDate);
    midnightOfStartDate.setHours(0);
    midnightOfStartDate.setMinutes(0);
    midnightOfStartDate.setSeconds(0);
    let resetDate = null;
    const reset: any = {};
    let statStartDate = null;
    let statEndDate = null;

    if ($this.resetCounters) {
      resetDate = new Date(midnightOfStartDate.getTime() + 24 * 60 * 60 * 1000);
      statStartDate = midnightOfStartDate;
      statEndDate = resetDate;
      reset.enabled = true;
    }

    const newChallenge: IChallenge = {
      name: $this.challengeName,
      startDate: $this.challengeStartDate,
      endDate: $this.challengeEndDate,
      resetDate: resetDate,
      reset: reset,
      statStartDate: statStartDate,
      statEndDate: statEndDate,
      description: this.challengeDescription,
      advanced: this.advanced,
      notifications: this.notifications,
    };

    return newChallenge;
  }

  public save() {
    const $this = this;

    if (!$this.challengeName || $this.challengeName.length === 0) {
      $this.ionicAlertService.presentAlert('You must enter a challenge name');
      return;
    }

    const updateChallenge: IChallenge = this.getNewChallengeObject();

    $this.saving = true;

    $this.challengeService.updateChallenge($this.foundChallenge._id, updateChallenge).subscribe(() => {
      this.broadcastService.broadcast('update-challenges');
      $this.saving = false;

      $this.foundChallenge.name = updateChallenge.name;
      $this.foundChallenge.startDate = updateChallenge.startDate;
      $this.foundChallenge.endDate = updateChallenge.endDate;
      $this.foundChallenge.resetDate = updateChallenge.resetDate;
      $this.foundChallenge.statStartDate = updateChallenge.statStartDate;
      $this.foundChallenge.statEndDate = updateChallenge.statEndDate;
      $this.foundChallenge.description = updateChallenge.description;
      $this.foundChallenge.advanced = updateChallenge.advanced;
      $this.foundChallenge.notifications = updateChallenge.notifications;

      $this.challengeService.setChallengeTimes([$this.foundChallenge]);

      $this.modalController.dismiss({
        foundChallenge: $this.foundChallenge,
      });
    });
  }

  public async changeBanner() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: SelectImageModal,
        componentProps: {
          images: [
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-01.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-02.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-03.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-04.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-05.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-06.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-07.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-08.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-09.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-10.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-11.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-12.png',
            'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-13.png',
          ],
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        $this.advanced.bannerImage = detail.data;
      }
    });
    await modal.present();
  }
}
