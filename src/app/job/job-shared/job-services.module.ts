import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { JobApiService } from './services/job.api.service';

const services = [
  JobApiService,
];
@NgModule({
  imports: [
    RouterModule,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  providers: [
    ...services,
  ],
})
export class JobsServicesModule {}
