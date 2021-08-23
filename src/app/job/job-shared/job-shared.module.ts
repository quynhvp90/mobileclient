import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { JobApplicantQuizReviewComponent } from './components/job-applicant-quiz-review/job-applicant-quiz-review.component';
import { IonicModule } from '@ionic/angular';
import { JobApplicantHomeworkReviewModalComponent } from './modals/job-applicant-homework-review-modal/job-applicant-homework-review-modal.component';
import { JobApplicantReviewModalComponent } from './modals/job-applicant-review-modal/job-applicant-review-modal.component';

const components: any[] = [
  JobApplicantQuizReviewComponent,
  JobApplicantHomeworkReviewModalComponent,
  JobApplicantReviewModalComponent,
];

@NgModule({
  imports: [
    IonicModule,
    RouterModule,
    SharedModule,
    CommonModule,
    FormsModule,
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
export class JobSharedModule {}
