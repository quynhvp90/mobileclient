import { Injectable } from '@angular/core';

import { IChallengeDocument, IChallengeTeam } from '../../../shared/models/challenge/challenge.interface';

import { ModalController } from '@ionic/angular';
import { ChallengeTeamEditModalComponent } from './challenge-team-edit-modal.component';
import { ChallengeTeamApiService } from '../../challenge-services/challenge-team.api.service';

@Injectable()
export class ChallengeTeamEditModalService {
  constructor(
    private modalController: ModalController,
    private challengeTeamApiService: ChallengeTeamApiService) {
  }

  public createTeam(foundChallenge: IChallengeDocument) {
    const $this = this;
    const teamNumber = foundChallenge.teams.roster.length + 1;
    const teamIcon = (teamNumber % 40).toString().padStart(3, '0');
    const challengeTeam: IChallengeTeam = {
      name: 'Team #' + teamNumber,
      icon: teamIcon,
      ownerUserId: '',
      percentComplete: 0,
      totalCount: 0,
      users: [],
      activities: [],
    };

    $this.modalController.create({
      component: ChallengeTeamEditModalComponent,
      componentProps: {
        foundChallengeTeam: challengeTeam,
        foundChallenge: foundChallenge,
      },
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data) {
          foundChallenge.teams.roster.push(detail.data);
          $this.challengeTeamApiService.hydrateChallengeTeams(foundChallenge);
        }
      });
      modal.present();
    });
  }

  public editTeam(foundChallenge: IChallengeDocument, foundChallengeTeam: IChallengeTeam) {
    const $this = this;

    $this.modalController.create({
      component: ChallengeTeamEditModalComponent,
      componentProps: {
        foundChallengeTeam: JSON.parse(JSON.stringify(foundChallengeTeam)),
        foundChallenge: foundChallenge,
      },
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data) {
          foundChallengeTeam.icon = detail.data.icon;
          foundChallengeTeam.name = detail.data.name;
        }
      });
      modal.present();
    });
  }
}
