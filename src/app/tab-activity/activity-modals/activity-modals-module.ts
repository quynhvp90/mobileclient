import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivityEditModalComponent } from './activity-edit-modal/activity-edit-modal.component';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    ActivityEditModalComponent,
  ],
  entryComponents: [
    ActivityEditModalComponent,
  ],
})
export class ActivityModalsModule {}
