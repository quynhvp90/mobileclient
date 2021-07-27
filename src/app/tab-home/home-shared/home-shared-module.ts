import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobsServicesModule } from '../../job/job-shared/job-services.module';

@NgModule({
  imports: [
    IonicModule,
    SharedModule,
    CommonModule,
    FormsModule,
    JobsServicesModule,
  ],
  exports: [
  ],
  declarations: [
  ],
  entryComponents: [
  ],
})
export class ActivitySharedModule {}
