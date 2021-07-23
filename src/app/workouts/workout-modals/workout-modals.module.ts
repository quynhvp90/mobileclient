import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WorkoutListModalComponent } from './workout-list/workout-list-modal.component';
import { WorkoutEditModalComponent } from './workout-edit-modal/workout-edit-modal.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
  ],
  entryComponents: [
    WorkoutListModalComponent,
    WorkoutEditModalComponent,
  ],
  declarations: [
    WorkoutListModalComponent,
    WorkoutEditModalComponent,
  ],
  exports: [
    WorkoutListModalComponent,
    WorkoutEditModalComponent,
  ],
})
export class WorkoutModalsModule {}
