import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService } from '../../shared/services';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { IJobUserStats } from '../job-shared/interfaces/job.interface';
// import { JobApiService } from '../job-shared/services/job.api.service';

const jsFilename = 'job-applicant-quiz-review: ';

@Component({
  selector: 'job-applicants-quiz-review',
  templateUrl: './job-applicants-quiz-review.component.html',
  styleUrls: ['./job-applicants-quiz-review.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobApplicantsQuizReviewComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions = [];
  public isLoading = true;
  public job: IJobUserStats;
  private jobId = null;
  constructor(
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    // private jobApiService: JobApiService,
    private route: ActivatedRoute,
  ) {
    const $this = this;
    $this.jobId = $this.route.snapshot.paramMap.get('id');
    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {

    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams['id']) {
          // getdata
          console.log('id =============', queryParams['id']);
          
        }
      });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    $this.getData();
  }

  public getData() {
    const $this = this;
    $this.isLoading = true;
    // $this.jobApiService.getJob($this.jobId).subscribe((res) => {
    //   $this.isLoading = false;
    //   console.log('res = ', res);
    //   $this.job = res;
    // });
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
