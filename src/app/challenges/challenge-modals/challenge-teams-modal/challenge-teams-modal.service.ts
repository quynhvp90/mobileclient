import { Injectable } from '@angular/core';

import { IChallengeDocument, IChallengeTeam } from '../../../shared/models/challenge/challenge.interface';

import { ModalController } from '@ionic/angular';
import { ChallengeTeamsModalComponent } from './challenge-teams-modal.component';
import { ChallengeTeamApiService } from '../../challenge-services/challenge-team.api.service';

@Injectable()
export class ChallengeTeamsModalService {
  constructor(
    private modalController: ModalController,
    private challengeTeamApiService: ChallengeTeamApiService) {
  }

  public openTeams(foundChallenge: IChallengeDocument) {
    const $this = this;
    $this.modalController.create({
      component: ChallengeTeamsModalComponent,
      componentProps: {
        foundChallenge: foundChallenge,
      },
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data) {
        }
        $this.challengeTeamApiService.hydrateChallengeTeams(foundChallenge);
      });
      modal.present();
    });
  }
}
