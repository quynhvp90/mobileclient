import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService, AnimationService, MessageService } from '../../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { ApplicationApiService } from '../../services/application.api.service';
import { JobApiService } from '../../services/job.api.service';
import IApplicationDocument from 'src/app/shared/models/application/application.interface';

const jsFilename = 'job-applicant-review: ';

@Component({
  selector: 'job-applicant-review-modal',
  templateUrl: './job-applicant-review-modal.component.html',
  styleUrls: ['./job-applicant-review-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantReviewModalComponent implements OnInit, OnDestroy {
  @Input() public question: any;
  @Input() public application: IApplicationDocument;
  @Input() public index = 0;
  @Input() public total = 0;
  @Input() public mode = '';
  private subscriptions = [];

  private answers = [];
  private currentAnswer = {};
  private currentAnswerIndex = -1;
  public saving = false;
  public messageText = '';

  constructor(
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private activityService: ActivityService,
    public applicationApiService: ApplicationApiService,
    public jobApiService: JobApiService,
    public messageService: MessageService,
    private modalController: ModalController,
    private animationService: AnimationService,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    console.log('application === ', $this.application);
    if ($this.application && $this.question && $this.application.results && $this.application.results[$this.mode]) {
      $this.application.results[$this.mode].forEach((answer) => {
        if (answer.questionId === $this.question._id) {
          $this.answers.push(answer);
        }
      });
      $this.currentAnswerIndex = 0;
      $this.getCurrentAnswer();
    }
    console.log('currentQuestion === ', $this.question);
    if ($this.application && $this.question && $this.application.results && $this.application.results.ratings
      && $this.application.results.ratings[$this.mode] && $this.application.results.ratings[$this.mode].questions) {
      $this.application.results.ratings[$this.mode].questions.forEach((question) => {
        if (question.questionId === $this.question._id) {
          $this.question.rating = question.rating;
        }
      });
      $this.currentAnswerIndex = $this.answers.length - 1;
      $this.getCurrentAnswer();
    }
    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);

      if (msg.name === 'update-rating') {
        if (msg.message && $this.application && msg.message.applicationId === $this.application._id) {
          if ($this.question && $this.application.results && $this.application.results.ratings
            && $this.application.results.ratings[$this.mode] && $this.application.results.ratings[$this.mode].questions) {
            $this.application.results.ratings[$this.mode].questions.forEach((question) => {
              if (question.questionId === msg.message.questionId) {
                question = msg.message.rate;
              }
            });
          }
        }
      }
    });
    this.subscriptions.push(subscription);
    this.getMessageComment();
  }

  public getMessageComment() {
    const $this = this;
    const query = {
      sortField: 'created',
      sortOrder: 'ASC',
      limit: 1000,
      where: {
        distributionType: 'employer',
        questionType: $this.mode,
        messageType: {
          $in: ['application-comment', 'application-rating'],
        },
        jobId: $this.application.jobId,
        applicationId: $this.application._id,
        questionId: $this.question._id,
        organizationId: $this.application.organizationId,
        // created: {
        //   $gt: lastViewedMessage[ENV.loginType]
        // }
      }
    };
    $this.messageService.getMessages(query).subscribe((res) => {
      console.log('data = ', res);
    });
  }

  public getCurrentAnswer() {
    const $this = this;
    if ($this.answers.length > 0) {
      $this.currentAnswer = $this.answers[$this.currentAnswerIndex];
    }
  }

  public previousAnswer() {
    const $this = this;
    $this.currentAnswerIndex -= 1;
    $this.getCurrentAnswer();
  }
  public nextAnswer() {
    const $this = this;
    $this.currentAnswerIndex += 1;
    $this.getCurrentAnswer();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
  public commentAdd(messageType) {
    const $this = this;
    const msgHdr = 'commentAdd: ';

    let distributionType = ['applicant', 'employer'];
    if (!messageType) {
      messageType = 'application-comment';
      distributionType = ['employer'];
    }
    var payload = {
      messageType: messageType, // ['notification', 'application-comment', 'application-rating', 'application-chat']
      applicationId: $this.application._id,
      applicantId: $this.application.applicantId,
      jobId: $this.application.jobId,
      questionId: $this.question._id,
      questionType: $this.mode,
      distributionType: distributionType,
      message: {
        data: {
          body: $this.messageText,
        },
      },
    };

    $this.messageService.createMessage(payload)
    .subscribe(function(resp) {
      console.log(msgHdr + 'resp = ', resp);
      // scrollToBottomMessage();
    });
  }
  public save () {
    const $this = this;
  }
}
