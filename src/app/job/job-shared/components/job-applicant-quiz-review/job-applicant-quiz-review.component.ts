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
        if ($this.foundApplications && $this.foundApplications.length > 0 && msg.message && msg.message.applicationId) {
          $this.foundApplications.forEach((app) => {
            if (app.results && app.results.ratings && app.results.ratings[$this.quizType]) {
              if ($this.quizType === 'homework' || $this.quizType === 'interview') {
                if (app.results.ratings[$this.quizType].questions) {
                  app.results.ratings[$this.quizType].questions.forEach((question) => {
                    if (question.questionId === msg.message.questionId) {
                      question.rating = msg.message.rate;
                      if (!$this.questions[app._id + '-' + question.questionId]) {
                        $this.questions[app._id + '-' + question.questionId] = {};
                      }
                      $this.questions[app._id + '-' + question.questionId].rate = msg.message.rate;
                    }
                  });
                }
              } else if (app.results.ratings.applicant.ratings && msg.message.applicationId === app._id) {
                app.results.ratings.applicant.ratings.forEach((rating) => {
                  if (rating._id === msg.message.questionId) {
                    rating.rating = msg.message.rate;
                    if (!$this.questions[app._id + '-' + rating._id]) {
                      $this.questions[app._id + '-' + rating._id] = {};
                    }
                    $this.questions[app._id + '-' + rating._id].rate = msg.message.rate;
                  }
                });
                $this.jobQuestions = app.results.ratings.applicant.ratings;
              }

            }
            if ($this.currentApplication._id === app._id) {
              $this.currentApplication = app;
            }
          });
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
    } else if ($this.mode === 'qualified') {
      $this.quizType = 'applicant';
      $this.jobQuestions = [];
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
        if ($this.mode === 'qualified' && foundApplication.results && foundApplication.results.ratings && foundApplication.results.ratings.applicant) {
          $this.jobQuestions = foundApplication.results.ratings.applicant.ratings;
        }
        if (foundApplication && foundApplication.results) {
          // home work
          if (foundApplication.results.homework && foundApplication.results.homework.length > 0) {
            foundApplication.results.homework.forEach((hw) => {
              if (!$this.questions[foundApplication._id + '-' + hw.questionId]) {
                $this.questions[foundApplication._id + '-' + hw.questionId] = {}
              }
              $this.questions[foundApplication._id + '-' + hw.questionId].response = hw.response;
              $this.questions[foundApplication._id + '-' + hw.questionId].dateSubmitted = hw.dateSubmitted;
            });
            if (foundApplication.results.ratings && foundApplication.results.ratings.homework
              && foundApplication.results.ratings.homework.questions) {
              foundApplication.results.ratings.homework.questions.forEach((question) => {
                if (!$this.questions[foundApplication._id + '-' + question.questionId]) {
                  $this.questions[foundApplication._id + '-' + question.questionId] = {}
                }
                $this.questions[foundApplication._id + '-' + question.questionId].rate = question.rating;
              });
            }
          }

          // interview
          if (foundApplication.results.interview && foundApplication.results.interview.length > 0) {
            foundApplication.results.interview.forEach((int) => {
              if (!$this.questions[foundApplication._id + '-' + int.questionId]) {
                $this.questions[foundApplication._id + '-' + int.questionId] = {}
              }
              $this.questions[foundApplication._id + '-' + int.questionId].response = int.response;
              $this.questions[foundApplication._id + '-' + int.questionId].dateSubmitted = int.dateSubmitted;
            });
            if (foundApplication.results.ratings && foundApplication.results.ratings.interview
              && foundApplication.results.ratings.interview.questions) {
              foundApplication.results.ratings.interview.questions.forEach((question) => {
                if (!$this.questions[foundApplication._id + '-' + question.questionId]) {
                  $this.questions[foundApplication._id + '-' + question.questionId] = {}
                }
                $this.questions[foundApplication._id + '-' + question.questionId].rate = question.rating;
              });
            }
          }
          // applicant
          if (foundApplication.results.ratings && foundApplication.results.ratings.applicant
            && foundApplication.results.ratings.applicant.ratings && foundApplication.results.ratings.applicant.ratings.length > 0) {
            foundApplication.results.ratings.applicant.ratings.forEach((rating) => {
              if (!$this.questions[foundApplication._id + '-' + rating._id]) {
                $this.questions[foundApplication._id + '-' + rating._id] = {};
              }
              $this.questions[foundApplication._id + '-' + rating._id].rate = rating.rating;
            });
          }
        }
        console.log('$this.questions = ', $this.questions);
        console.log('$this.questions1 = ', $this.currentApplication._id);
        // reload star rating
        if ($this.jobQuestions && $this.jobQuestions.length > 0 && $this.questions && $this.currentApplication) {
          $this.jobQuestions.forEach((jobQ) => {
            this.broadcastService.broadcast('update-rating', {
              questionId: jobQ._id,
              rate: $this.questions[$this.currentApplication._id + '-' + jobQ._id] ? $this.questions[$this.currentApplication._id + '-' + jobQ._id].rate : 0,
            });
          });
        }
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
