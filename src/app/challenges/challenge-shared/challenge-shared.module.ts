import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChallengeInvitationsComponent } from './challenge-invitations/challenge-invitations.component';
import { ChallengeActivityRowComponent } from './challenge-activity-row/challenge-activity-row.component';
import { ChallengeRowComponent } from './challenge-row/challenge-row.component';
import { ChallengeTimerComponent } from './challenge-timer/challenge-timer.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  exports: [
    ChallengeRowComponent,
    ChallengeInvitationsComponent,
    ChallengeActivityRowComponent,
    ChallengeTimerComponent,
  ],
  declarations: [
    ChallengeRowComponent,
    ChallengeInvitationsComponent,
    ChallengeActivityRowComponent,
    ChallengeTimerComponent,
  ],
  entryComponents: [
    ChallengeRowComponent,
    ChallengeInvitationsComponent,
    ChallengeActivityRowComponent,
    ChallengeTimerComponent,
  ],
})
export class ChallengeSharedModule {}
