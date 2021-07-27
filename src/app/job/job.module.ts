import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { JobApplicantsQuizReviewComponent } from './job-applicants-quiz-review/job-applicants-quiz-review.component';
import { JobSharedModule } from './job-shared/job-shared.module';
import { IonicModule } from '@ionic/angular';

const components: any[] = [
  JobApplicantsQuizReviewComponent
];

const routes: Routes = [
  { path: ':id/homework', component: JobApplicantsQuizReviewComponent },
  { path: ':id/interview', component: JobApplicantsQuizReviewComponent },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    JobSharedModule,
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
