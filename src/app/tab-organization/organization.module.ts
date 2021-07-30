import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { JobsServicesModule } from '../job/job-shared/job-services.module';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SharedModule,
    JobsServicesModule,
    RouterModule.forChild([
      { path: '', component: OrganizationListComponent },
    ]),
  ],
  declarations: [
    OrganizationListComponent,
  ],
  entryComponents: [
  ],
})
export class OrganizationModule {}
