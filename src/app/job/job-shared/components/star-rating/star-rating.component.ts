import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService } from '../../../../shared/services';
import { ApplicationApiService } from '../../services/application.api.service';
import { JobApiService } from '../../services/job.api.service';

const jsFilename = 'star-rating: ';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarRatingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() 
  public rate = 0;
  public isApplicable = true;
  public displayWords = false;
  public hasResults = true;
  private subscriptions = [];
  private positives = [];
  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    public jobApiService: JobApiService,
    private applicationApiService: ApplicationApiService,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {

    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    console.log('$this.rate ==== ', $this.rate);
    if ($this.rate && $this.rate.toString() === '-1') {
      $this.isApplicable = false;
      return;
    }
    if (!$this.rate || $this.rate === 0) {
      $this.hasResults = false;
      return;
    }
    $this.positives = $this.computeStars($this.rate, 5);
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public computeStars(rate, max?) {
    let maxRate = 5;
    if (max) {
      maxRate = max;
    }
    const positives = [];
    for (let index = 1; index <= maxRate; index++) {
      if ((rate -index ) > 0 && (rate - index) < 1) {
        positives.push({
          display: 'star-half',
        });
      } else if (rate - index >= 0) {
        positives.push({
          display: 'star',
        });
      } else if (rate -index < 0) {
        positives.push({
          display: 'star-outline',
        });
      }
    }
    return positives;
  }
}
