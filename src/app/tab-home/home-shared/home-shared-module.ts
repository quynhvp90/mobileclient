import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
