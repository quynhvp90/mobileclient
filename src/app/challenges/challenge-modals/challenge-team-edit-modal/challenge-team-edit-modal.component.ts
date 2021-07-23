import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivityService, BroadcastService, IonicAlertService, WorkoutService, AnimationService, ChallengeService } from '../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { ListAvatarModal } from 'src/app/shared/modal/list-avatar/list-avatar-modal';
import { IChallengeDocument, IChallengeTeam } from 'src/app/shared/models/challenge/challenge.interface';
import { ChallengeTeamApiService } from '../../challenge-services/challenge-team.api.service';

const jsFilename = 'challenge-team-edit: ';

@Component({
  selector: 'challenge-team-edit-modal',
  templateUrl: './challenge-team-edit-modal.component.html',
  styleUrls: ['./challenge-team-edit-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeTeamEditModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocument;
  public foundChallengeTeam: IChallengeTeam;

  public saving = false;

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private challengeTeamApiService: ChallengeTeamApiService,
    private ionicAlertService: IonicAlertService,
  ) {
    //
  }

  public ngOnInit() {

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      console.info(msgHdr + 'msg = ', msg);
      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);
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

  public changeAvatar() {
    const $this = this;
    this.modalController.create({
      component: ListAvatarModal,
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
        if (detail !== null && detail.data !== 'close') {
         // console.log('avatar result:', detail.data);
          // this.user.avatar = detail.data;
          // $this.save(true);
          $this.foundChallengeTeam.icon = detail.data;
        }
      });
      modal.present();
    });
  }

  public save() {
    const $this = this;

    if (!$this.foundChallengeTeam.name || $this.foundChallengeTeam.name.length === 0) {
      $this.ionicAlertService.presentAlert('A team name is required');
      return;
    }

    $this.saving = true;

    if (this.foundChallengeTeam._id) {
      $this.challengeTeamApiService.editChallengeTeam($this.foundChallenge._id, this.foundChallengeTeam).subscribe((res) => {
        $this.saving = false;
        this.modalController.dismiss(res);
      });
    } else {
      $this.challengeTeamApiService.addChallengeTeam($this.foundChallenge._id, this.foundChallengeTeam).subscribe((res) => {
        $this.saving = false;
        this.modalController.dismiss(res);
      });
    }
  }

}
