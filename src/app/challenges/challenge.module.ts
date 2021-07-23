import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { IonicModule } from '@ionic/angular';

import { ChallengeListComponent } from './challenge-list/challenge-list.component';
import { ChallengeDetailComponent } from './challenge-detail/challenge-detail.component';
import { WorkoutModalsModule } from '../workouts/workout-modals/workout-modals.module';
import { ActivitySharedModule } from '../tab-activity/activity-shared/activity-shared-module';
import { ChallengeModalsModule } from './challenge-modals/challenge-modals.module';
import { ChallengeSharedModule } from './challenge-shared/challenge-shared.module';
import { SocialSharedModule } from '../tab-social/social-shared/social-shared.module';
import { ChallengeJoinService } from './challenge-services/challenge-join.service';
import { ChallengeTeamApiService } from './challenge-services/challenge-team.api.service';
import { ChallengeTeamEditModalService } from './challenge-modals/challenge-team-edit-modal/challenge-team-edit-modal.service';
import { ChallengeTeamSelectModalService } from './challenge-modals/challenge-team-select-modal/challenge-team-select-modal.service';
import { ChallengeTeamsModalService } from './challenge-modals/challenge-teams-modal/challenge-teams-modal.service';
import { ChallengeTeamModalService } from './challenge-modals/challenge-team-modal/challenge-team-modal.service';

const routes: Routes = [
  {
    path: '',
    component: ChallengeListComponent,
  },
  { path: 'detail/:id', component: ChallengeDetailComponent },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    ActivitySharedModule,
    RouterModule.forChild(routes),
    WorkoutModalsModule,
    ChallengeModalsModule,
    ChallengeSharedModule,
    SocialSharedModule,
  ],
  providers: [
    ChallengeJoinService,
    ChallengeTeamApiService,
    ChallengeTeamEditModalService,
    ChallengeTeamSelectModalService,
    ChallengeTeamsModalService,
    ChallengeTeamModalService,
  ],
  exports: [
  ],
  declarations: [
    ChallengeListComponent,
    ChallengeDetailComponent,
  ],
  entryComponents: [
  ],
})
export class ChallengePageModule {}
