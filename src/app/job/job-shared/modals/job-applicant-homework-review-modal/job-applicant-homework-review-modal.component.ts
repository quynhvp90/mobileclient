import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, WorkoutService, AnimationService } from '../../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { ApplicationApiService } from '../../services/application.api.service';
import { JobApiService } from '../../services/job.api.service';

const jsFilename = 'job-applicant-homework-review: ';

@Component({
  selector: 'job-applicant-homework-review-modal',
  templateUrl: './job-applicant-homework-review-modal.component.html',
  styleUrls: ['./job-applicant-homework-review-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantHomeworkReviewModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];

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

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      // console.log(msgHdr + '$this.foundActivities = ', $this.foundActivities);

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
