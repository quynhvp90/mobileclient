import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService } from '../../shared/services';
import { NavController } from '@ionic/angular';

const jsFilename = 'job-applicant-quiz-review: ';

@Component({
  selector: 'job-applicants-quiz-review',
  templateUrl: './job-applicants-quiz-review.component.html',
  styleUrls: ['./job-applicants-quiz-review.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantsQuizReviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
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

  public backButton() {
    this.navCtrl.back();
  }
  private updateData() {
    const $this = this;

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
