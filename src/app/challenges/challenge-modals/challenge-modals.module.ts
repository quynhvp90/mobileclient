import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';

import { ChallengeAddFriendsModalComponent } from './challenge-add-friends-modal/challenge-add-friends-modal';
import { ChallengeIntroModalComponent } from './challenge-intro-modal/challenge-intro-modal.component';
import { ChallengeListActivityModalComponent } from './challenge-list-activity-modal/challenge-list-activity-modal.component';
import { ChallengeNewModalComponent } from './challenge-new-modal/challenge-new-modal.component';
import { ChallengeActivitiesModalComponent } from './challenge-activities-modal/challenge-activities-modal.component';
import { ChallengeSharedModule } from '../challenge-shared/challenge-shared.module';
import { ChallengeFriendsModalComponent } from './challenge-friends-modal/challenge-friends-modal.component';
import { ChallengeTeamsModalComponent } from './challenge-teams-modal/challenge-teams-modal.component';
import { ChallengeTeamEditModalComponent } from './challenge-team-edit-modal/challenge-team-edit-modal.component';
import { ChallengeTeamModalComponent } from './challenge-team-modal/challenge-team-modal.component';
import { ChallengeTeamSelectModalComponent } from './challenge-team-select-modal/challenge-team-select-modal.component';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
    ChallengeSharedModule,
  ],
  declarations: [
    ChallengeAddFriendsModalComponent,
    ChallengeIntroModalComponent,
    ChallengeListActivityModalComponent,
    ChallengeNewModalComponent,
    ChallengeFriendsModalComponent,
    ChallengeTeamsModalComponent,
    ChallengeTeamEditModalComponent,
    ChallengeTeamModalComponent,
    ChallengeActivitiesModalComponent,
    ChallengeTeamSelectModalComponent,
  ],
  entryComponents: [
    ChallengeAddFriendsModalComponent,
    ChallengeIntroModalComponent,
    ChallengeListActivityModalComponent,
    ChallengeNewModalComponent,
    ChallengeFriendsModalComponent,
    ChallengeTeamsModalComponent,
    ChallengeTeamEditModalComponent,
    ChallengeTeamModalComponent,
    ChallengeActivitiesModalComponent,
    ChallengeTeamSelectModalComponent,
  ],
})
export class ChallengeModalsModule {}
