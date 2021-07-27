import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService } from '../../../../shared/services';
import { JobApplicantHomeworkReviewModalComponent } from '../../modals/job-applicant-homework-review-modal/job-applicant-homework-review-modal.component';

const jsFilename = 'job-applicant-quiz-review: ';

@Component({
  selector: 'app-job-applicant-quiz-review',
  templateUrl: './job-applicant-quiz-review.component.html',
  styleUrls: ['./job-applicant-quiz-review.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantQuizReviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {

    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  private updateData() {
    const $this = this;

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public async viewHomework() {
    const msgHdr = jsFilename + 'viewHomework: ';
    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: JobApplicantHomeworkReviewModalComponent,
        componentProps: {
          autoStart: false,
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
