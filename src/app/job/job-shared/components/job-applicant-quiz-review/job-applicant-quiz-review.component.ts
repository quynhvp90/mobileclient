import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import IApplicationDocument from 'src/app/shared/models/application/application.interface';
import { BroadcastService, MessageService } from '../../../../shared/services';
import { JobApplicantHomeworkReviewModalComponent } from '../../modals/job-applicant-homework-review-modal/job-applicant-homework-review-modal.component';
import { JobApplicantReviewModalComponent } from '../../modals/job-applicant-review-modal/job-applicant-review-modal.component';
import { ApplicationApiService } from '../../services/application.api.service';
import { JobApiService } from '../../services/job.api.service';

const jsFilename = 'job-applicant-quiz-review: ';

@Component({
  selector: 'app-job-applicant-quiz-review',
  templateUrl: './job-applicant-quiz-review.component.html',
  styleUrls: ['./job-applicant-quiz-review.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantQuizReviewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public mode = 'stage2';

  private subscriptions = [];

  public isLoading = true;
  public jobQuestions: any[] = [];

  public currentApplicationNumber: number = 1;
  public totalApplicationNumber: number;
  public currentApplication: IApplicationDocument;
  public foundApplications: IApplicationDocument[];
  public questions: any = {};
  public quizType = 'homework';

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    public jobApiService: JobApiService,
    private applicationApiService: ApplicationApiService,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'update-rating') {
        if (msg.message && $this.currentApplication && msg.message.applicationId === $this.currentApplication._id) {
          if ($this.currentApplication.results && $this.currentApplication.results.ratings
            && $this.currentApplication.results.ratings[$this.quizType] && $this.currentApplication.results.ratings[$this.quizType].questions) {
            $this.currentApplication.results.ratings[$this.quizType].questions.forEach((question) => {
              if (question.questionId === msg.message.questionId) {
                question.rating = msg.message.rate;
              }
            });
          }
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    if ($this.mode === 'stage2') {
      $this.quizType = 'homework';
      $this.jobQuestions = $this.jobApiService.foundJob.tests.homework.questions;
    } else if ($this.mode === 'stage3') {
      $this.quizType = 'interview';
      $this.jobQuestions = $this.jobApiService.foundJob.tests.interview.questions;
      $this.quizType = 'applicant';
    } else if ($this.mode === 'qualified') {
      $this.jobQuestions = $this.jobApiService.foundJob.tests.applicant.questions;
    }
    $this.getData();
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  private getData() {
    const $this = this;
    $this.currentApplicationNumber = 1;
    $this.isLoading = true;
    $this.applicationApiService.getApplicationsToReview($this.jobApiService.foundJob._id, this.mode).subscribe((result) => {
      console.log('result = ', result);
      $this.isLoading = false;
      $this.totalApplicationNumber = result.count;
      $this.foundApplications = result.items;
      $this.getCurrentApplication();
    });
    // get comments 
  }

  private getCurrentApplication() {
    const $this = this;
    if ($this.foundApplications[$this.currentApplicationNumber - 1]) {
      $this.applicationApiService.getApplication($this.foundApplications[$this.currentApplicationNumber - 1]._id).subscribe((foundApplication) => {
        console.log('foundApplication = ', foundApplication);
        $this.currentApplication = foundApplication;
        if (foundApplication && foundApplication.results) {
          // home work
          if (foundApplication.results.homework && foundApplication.results.homework.length > 0) {
            foundApplication.results.homework.forEach((hw) => {
              if (!$this.questions[hw.questionId]) {
                $this.questions[hw.questionId] = {}
              }
              $this.questions[hw.questionId].response = hw.response;
              $this.questions[hw.questionId].dateSubmitted = hw.dateSubmitted;
            });
            if (foundApplication.results.ratings && foundApplication.results.ratings.homework
              && foundApplication.results.ratings.homework.questions) {
              foundApplication.results.ratings.homework.questions.forEach((question) => {
                if (!$this.questions[question.questionId]) {
                  $this.questions[question.questionId] = {}
                }
                $this.questions[question.questionId].rate = question.rating;
              });
            }
          }

          // interview
          if (foundApplication.results.interview && foundApplication.results.interview.length > 0) {
            foundApplication.results.interview.forEach((int) => {
              if (!$this.questions[int.questionId]) {
                $this.questions[int.questionId] = {}
              }
              $this.questions[int.questionId].response = int.response;
              $this.questions[int.questionId].dateSubmitted = int.dateSubmitted;
            });
            if (foundApplication.results.ratings && foundApplication.results.ratings.interview
              && foundApplication.results.ratings.interview.questions) {
              foundApplication.results.ratings.interview.questions.forEach((question) => {
                if (!$this.questions[question.questionId]) {
                  $this.questions[question.questionId] = {}
                }
                $this.questions[question.questionId].rate = question.rating;
              });
            }
          }
          
        }
        console.log('$this.questions = ', $this.questions);
      });
    }
  }

  private updateData() {
    const $this = this;

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public nextApplicant() {
    if ((this.currentApplicationNumber + 1) <= this.foundApplications.length) {
      this.currentApplicationNumber += 1;
      this.getCurrentApplication();
    }
  }


  public previousApplicant() {
    if (this.currentApplicationNumber > 1) {
      this.currentApplicationNumber -= 1;
      this.getCurrentApplication();
    }

  }

  public async viewHomework(question, questionIndex) {
    const msgHdr = jsFilename + 'viewHomework: ';
    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: JobApplicantReviewModalComponent,
        componentProps: {
          application: $this.currentApplication,
          question: question,
          index: questionIndex,
          total: $this.jobQuestions.length,
          mode: $this.quizType,
        },
      });

    modal.onDidDismiss().then((detail) => {
      const result: any = detail;
      if (detail !== null && detail.data !== 'close') {
        setTimeout(() => {
          // $this.animationService.animateOn();
          // this.navCtrl.navigateForward(['/tabs/challenges/detail/' + foundChallenge._id]);
        }, 100);
      }

      // if (detail && detail.data && detail.data.foundChallenge) {
      //   let challengeFound = false;
      //   $this.foundChallenges.forEach((foundChallenge) => {
      //     if (foundChallenge._id === detail.data.foundChallenge._id) {
      //       challengeFound = true;
      //     }
      //   });
      //   if (!challengeFound) {
      //     $this.foundChallenges.push(detail.data.foundChallenge);
      //   }
      // }

      // do nothing just view
    });
    await modal.present();
  }
}
