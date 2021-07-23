import { Injectable } from '@angular/core';

import { IChallengeDocument, IChallengeTeam } from '../../../shared/models/challenge/challenge.interface';

import { ModalController } from '@ionic/angular';
import { ChallengeTeamSelectModalComponent } from './challenge-team-select-modal.component';

@Injectable()
export class ChallengeTeamSelectModalService {
  constructor(
    private modalController: ModalController) {
  }

  public showSelectTeam(foundChallenge: IChallengeDocument) {
    const $this = this;

    $this.modalController.create({
      component: ChallengeTeamSelectModalComponent,
      componentProps: {
        foundChallenge: foundChallenge,
      },
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
      });
      modal.present();
    });
  }
}
