import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, OrganizationService } from '../../shared/services';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { IJobUserStats } from '../job-shared/interfaces/job.interface';
import { JobApiService } from 'src/app/job/job-shared/services/job.api.service';
import { ApplicationApiService } from '../job-shared/services/application.api.service';

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
  private jobId = null;
  public mode = 'stage2';
  public titleMode = '';

  constructor(
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    public jobApiService: JobApiService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const $this = this;
    $this.jobId = $this.route.snapshot.paramMap.get('id');
    console.log('$this.jobId = ', $this.jobId);
    if ($this.router.url.split('?')[0].endsWith('homework')) {
      $this.mode = 'stage2';
      $this.titleMode = 'Home work';
    } else if ($this.router.url.split('?')[0].endsWith('interview')) {
      console.log('end with interview');
      $this.mode = 'stage3';
      $this.titleMode = 'Interview';
    } else if ($this.router.url.split('?')[0].endsWith('qualified')) {
      $this.mode = 'qualified';
      $this.titleMode = 'Qualified';
    }
    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      // TBD
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        console.log('queryParams = ', queryParams);
        if (queryParams['id']) {
          this.jobId = queryParams['id'];
          this.getData();
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
    if (!$this.organizationService.organization) {
      $this.organizationService.getCurrentOrganization().subscribe(() => {
        $this.jobApiService.getJob($this.jobId).subscribe((res) => {
          $this.isLoading = false;
          console.log('res = ', res);
        });
      });
    } else {
      $this.jobApiService.getJob($this.jobId).subscribe((res) => {
        $this.isLoading = false;
        console.log('res = ', res);
      });
    }
    
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public backButton() {
    console.log('review applicant done.');
    const newUrl = '/tabs/home';
    this.navCtrl.navigateForward(newUrl);
    // this.navCtrl.back();
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
