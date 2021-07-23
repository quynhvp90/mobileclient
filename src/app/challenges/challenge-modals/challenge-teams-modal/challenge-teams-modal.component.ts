import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, ChallengeService } from '../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { IChallengeDocument, IChallengeTeams, IChallengeTeam } from 'src/app/shared/models/challenge/challenge.interface';
import { ChallengeTeamEditModalService } from '../challenge-team-edit-modal/challenge-team-edit-modal.service';

const jsFilename = 'challenge-teams: ';

@Component({
  selector: 'challenge-teams-modal',
  templateUrl: './challenge-teams-modal.component.html',
  styleUrls: ['./challenge-teams-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeTeamsModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocument;
  public challengeTeams: IChallengeTeams;

  public saving = false;

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private challengeService: ChallengeService,
    private challengeTeamEditModalService: ChallengeTeamEditModalService,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      console.info(msgHdr + 'msg = ', msg);
      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);
    });
    this.subscriptions.push(subscription);

    if (!$this.foundChallenge.teams) {
      $this.foundChallenge.teams = {
        enabled: false,
        allowTeamCreation: true,
        roster: [],
      };
    }
    $this.challengeTeams = $this.foundChallenge.teams;
    if (typeof $this.challengeTeams.allowTeamCreation === 'undefined') {
      $this.challengeTeams.allowTeamCreation = true;
    }
  }

  public ionViewWillEnter() {

  }

  public createTeam() {
    const $this = this;

    // $this.joinChallengeNow();
    $this.challengeTeamEditModalService.createTeam($this.foundChallenge);
  }

  public editTeam(foundChallengeTeam: IChallengeTeam) {
    const $this = this;
    $this.challengeTeamEditModalService.editTeam($this.foundChallenge, foundChallengeTeam);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public save() {
    const $this = this;
    $this.saving = true;

    $this.challengeService.updateChallenge($this.foundChallenge._id, {
      teams: {
        enabled: $this.foundChallenge.teams.enabled,
        allowTeamCreation: $this.foundChallenge.teams.allowTeamCreation,
      },
    }).subscribe((res) => {
      $this.saving = false;
      console.log('res = ', res);
      this.modalController.dismiss();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
