import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { ActivityListAllComponent } from './activity-list-all/activity-list-all.component';
import { ActivityDetailComponent } from './activity-detail/activity-detail.component';
import { SharedModule } from '../shared/shared.module';
import { PersonalRecordModalModule } from '../shared/modal/personal-record/personal-record.module';
import { ActivityModalsModule } from './activity-modals/activity-modals-module';
import { WorkoutModalsModule } from '../workouts/workout-modals/workout-modals.module';
import { ActivitySharedModule } from './activity-shared/activity-shared-module';
import { ChallengeSharedModule } from '../challenges/challenge-shared/challenge-shared.module';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    PersonalRecordModalModule,
    ActivityModalsModule,
    WorkoutModalsModule,
    ActivitySharedModule,
    ChallengeSharedModule,
    RouterModule.forChild([
      { path: '', component: ActivityListComponent },
      { path: 'all', component: ActivityListAllComponent },
      { path: 'detail/:id', component: ActivityDetailComponent },
    ]),
  ],
  declarations: [
    ActivityListComponent,
    ActivityListAllComponent,
    ActivityDetailComponent,
  ],
  entryComponents: [
  ],
})
export class Tab1PageModule {}
