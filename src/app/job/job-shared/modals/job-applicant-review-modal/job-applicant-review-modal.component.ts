import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService, AnimationService } from '../../../../shared/services';
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
  private currentAnswerIndex = -1;
  public saving = false;

  constructor(
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private ionicAlertService: IonicAlertService,
    private activityService: ActivityService,
    public applicationApiService: ApplicationApiService,
    public jobApiService: JobApiService,
    private modalController: ModalController,
    private animationService: AnimationService,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;

    console.log('application === ', $this.application);
    if ($this.application && $this.question && $this.application.results && $this.application.results.homework) {
      $this.application.results.homework.forEach((answer) => {
        if (answer.questionId === $this.question._id) {
          $this.answers.push(answer);
        }
      });
      if ($this.answers.length > 0) {
        $this.currentAnswerIndex = 0;
      }
    }
    console.log('currentQuestion === ', $this.question);
    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      // console.info(msgHdr + '$this.foundActivities = ', $this.foundActivities);

      if (msg.name === 'activity-created') {
      }
    });
    this.subscriptions.push(subscription);
  }

  public ionViewWillEnter() {

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  public save () {
    const $this = this;
  }
}
