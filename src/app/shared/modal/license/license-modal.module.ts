import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LicenseModal } from './license-modal';
import { NgxStripeModule } from 'ngx-stripe';
@NgModule({
  declarations: [
    LicenseModal,
  ],
  imports: [
    
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CommonModule,
    NgxStripeModule.forRoot(),
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
  ],
  entryComponents: [
    LicenseModal,
  ],
  exports: [LicenseModal],
})
export class LicenseModalModule {}
