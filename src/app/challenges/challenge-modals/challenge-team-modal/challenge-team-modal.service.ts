import { Injectable } from '@angular/core';

import { IChallengeDocument, IChallengeTeam } from '../../../shared/models/challenge/challenge.interface';

import { ModalController } from '@ionic/angular';
import { ChallengeTeamModalComponent } from './challenge-team-modal.component';

@Injectable()
export class ChallengeTeamModalService {
  constructor(
    private modalController: ModalController) {
  }

  public viewTeam(foundChallenge: IChallengeDocument, foundChallengeTeam: IChallengeTeam) {
    const $this = this;

    console.log('foundChallengeTeam = ', foundChallengeTeam);

    $this.modalController.create({
      component: ChallengeTeamModalComponent,
      componentProps: {
        foundChallengeTeam: foundChallengeTeam,
        foundChallenge: foundChallenge,
      },
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
      });
      modal.present();
    });
  }
}
