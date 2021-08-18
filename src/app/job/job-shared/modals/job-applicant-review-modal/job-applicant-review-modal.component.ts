// declare const ziggeoplayer: any;
import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService, AnimationService, MessageService } from '../../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { ApplicationApiService } from '../../services/application.api.service';
import { JobApiService } from '../../services/job.api.service';
import IApplicationDocument from 'src/app/shared/models/application/application.interface';
import { IMessage, IMessageDocument } from 'src/app/shared/models/message.interface';
// import { ZiggeoPlayerDirective } from 'angular-ziggeo';

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
  player: any;
  @ViewChild('ziggeoplayer', null) ziggeoplayer: any;
  private subscriptions = [];

  private answers = [];
  private currentAnswer = {};
  private currentAnswerIndex = -1;
  public saving = false;
  public comments = [];
  public currentMessage: {
    _id?: string,
    questionId?: string,
    user?: any,
    messageText?: string,
  } = {
    messageText: '',
  };
  public star = null;

  constructor(
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private activityService: ActivityService,
    public applicationApiService: ApplicationApiService,
    public jobApiService: JobApiService,
    public userService: UserService,
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
      if (msg.name === 'rating-star-result-' + $this.question._id) {
        $this.star = msg.message.rate;
      }
    });
    this.subscriptions.push(subscription);
    this.getMessageComment();
  }

  // ngAfterViewInit () {
  //   this.player = this.ziggeoplayer.playerInstance;

  //   this.player.on('attached', () => {
  //     console.log('Attached');
  //   });

  //   this.player.on('playing', () => {
  //     console.log('Playing your action here');
  //   });

  //   this.player.on('paused', () => {
  //     console.log('Paused, your action here');
  //   });
  // }

  public getMessageComment() {
    const $this = this;
    const query = {
      sortField: 'created',
      sortOrder: 'desc',
      limit: 1,
      where: {
        distributionType: 'employer',
        questionType: $this.mode,
        messageType: {
          $in: ['application-comment'],
        },
        jobId: $this.application.jobId,
        applicationId: $this.application._id,
        questionId: $this.question._id,
        organizationId: $this.application.organizationId,
        // created: {
        //   $gt: lastViewedMessage[ENV.loginType]
        // }
      },
    };
    $this.messageService.getMessages(query).subscribe((res) => {
      console.log('data = ', res);
      if (res && res.items && res.items.length > 0) {
        $this.comments = [];
        $this.currentMessage = {
          _id: res.items[0]._id,
          questionId: res.items[0].questionId,
          user: res.items[0].lookups.users[0],
          messageText: res.items[0].message.data.body,
        };
        // res.items.forEach((item) => {
        //   if (item.questionId === $this.question._id && item.message.data.body) {
        //     $this.comments.push({
        //       questionId: item.questionId,
        //       user: item.lookups.users[0],
        //       message: item.message.data,
        //       created: item.created,
        //     });
        //   }
        // });
      }
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
  public saveComment(messageType?: string) {
    const $this = this;
    const msgHdr = 'commentAdd: ';

    if ($this.currentMessage && $this.currentMessage._id) {
      this.updateComment();
      return;
    }
    if (!$this.currentMessage.messageText || ($this.currentMessage.messageText && $this.currentMessage.messageText.length === 0)) {
      return;
    }
    let distributionType = ['applicant', 'employer'];
    if (!messageType) {
      messageType = 'application-comment';
      distributionType = ['employer'];
    }
    const payload = {
      messageType: messageType, // ['notification', 'application-comment', 'application-rating', 'application-chat']
      applicationId: $this.application._id,
      applicantId: $this.application.applicantId,
      jobId: $this.application.jobId,
      questionId: $this.question._id,
      questionType: $this.mode,
      distributionType: distributionType,
      message: {
        data: {
          body: $this.currentMessage.messageText,
        },
      },
    };

    $this.messageService.createMessage(payload)
    .subscribe((resp) => {
      console.log(msgHdr + 'resp = ', resp);
      $this.currentMessage.messageText = null;
      $this.getMessageComment();
    });
  }

  public updateComment() {
    const $this = this;
    const msgHdr = 'commentAdd: ';

    if (!this.currentMessage || ($this.currentMessage && !$this.currentMessage._id)) {
      return;
    }
    $this.messageService.updateMessage($this.currentMessage._id, $this.currentMessage.messageText)
    .subscribe((resp) => {
      console.log(msgHdr + 'resp = ', resp);
      $this.currentMessage.messageText = null;
      $this.getMessageComment();
    });
  }
  async save () {
    const $this = this;
    // save comment
    $this.saveComment();
    // save rating
    const subject = 'Rated this question: ';
    if (!$this.star) {
      await this.modalController.dismiss();
      return;
    }
    const payloadRating: IMessage = {
      messageType: 'application-rating', // ['notification', 'application-comment', 'application-rating']
      applicationId: $this.application._id,
      questionId: $this.question._id,
      jobId: $this.application.jobId,
      distributionType: ['employer'],
      questionType: $this.mode,
      message: {
        data: {
          subject: subject,
          body: $this.star ? $this.star.toString() : 0,
        },
      },
    };

    $this.messageService.createMessage(payloadRating).subscribe(async (result) => {
      console.log('result = ', result);
      this.broadcastService.broadcast('update-rating', {
        questionId: $this.question._id,
        applicationId: $this.application._id,
        questionType: $this.mode,
        rate: $this.star,
      });
      await this.modalController.dismiss();
    });
  }
}
