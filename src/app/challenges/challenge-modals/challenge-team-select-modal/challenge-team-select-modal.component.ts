import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, ChallengeService } from '../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { IChallengeDocument, IChallengeTeam } from 'src/app/shared/models/challenge/challenge.interface';
import { ChallengeTeamEditModalService } from '../challenge-team-edit-modal/challenge-team-edit-modal.service';
import { ChallengeTeamApiService } from '../../challenge-services/challenge-team.api.service';

const jsFilename = 'challenge-team-select-modal: ';

@Component({
  selector: 'challenge-team-select-modal',
  templateUrl: './challenge-team-select-modal.component.html',
  styleUrls: ['./challenge-team-select-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeTeamSelectModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocument;

  public saving = false;

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private challengeTeamApiService: ChallengeTeamApiService,
  ) {
    //
  }

  public ngOnInit() {

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);
    });
    this.subscriptions.push(subscription);
  }

  public ionViewWillEnter() {

  }

  public selectTeam(foundChallengeTeam: IChallengeTeam) {
    this.challengeTeamApiService.joinTeam(this.foundChallenge, foundChallengeTeam).subscribe((res) => {
      this.modalController.dismiss(foundChallengeTeam);
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
