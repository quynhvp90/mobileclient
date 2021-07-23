import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivityLogComponent } from './activity-log/activity-log.component';
import { ActivityLogModal } from './activity-log/activity-log.modal';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  exports: [
    ActivityLogComponent,
    ActivityLogModal,
  ],
  declarations: [
    ActivityLogComponent,
    ActivityLogModal,
  ],
  entryComponents: [
    ActivityLogComponent,
    ActivityLogModal,
  ],
})
export class ActivitySharedModule {}
