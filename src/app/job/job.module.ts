import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { JobApplicantsQuizReviewComponent } from './job-applicants-quiz-review/job-applicants-quiz-review.component';
import { JobSharedModule } from './job-shared/job-shared.module';
import { IonicModule } from '@ionic/angular';
// import { StarRatingModule } from 'ionic4-star-rating';
import { JobsServicesModule } from './job-shared/job-services.module';

const components: any[] = [
  JobApplicantsQuizReviewComponent
];

const routes: Routes = [
  { path: ':id/homework', component: JobApplicantsQuizReviewComponent },
  { path: ':id/interview', component: JobApplicantsQuizReviewComponent },
  { path: ':id/qualified', component: JobApplicantsQuizReviewComponent },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    JobSharedModule,
    JobsServicesModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    ...components,
  ],
  declarations: [
    ...components,
  ],
  entryComponents: [
    ...components,
  ],
  providers: [
  ],
})
export class JobModule {}
