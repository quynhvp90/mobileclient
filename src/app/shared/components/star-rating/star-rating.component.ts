import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, MessageService } from '../../services';

const jsFilename = 'star-rating: ';

@Component({
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarRatingComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public rate = 0;
  @Input() public displayWords = false;
  @Input() public questionId = null;
  @Input() public applicationId = null;
  @Input() public type = null;
  public isApplicable = true;
  // public hasResults = true;
  private subscriptions = [];
  private positives = [];
  constructor(
    private broadcastService: BroadcastService,
    private messageService: MessageService,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'update-rating') {
        if (msg.message && msg.message.questionId === $this.questionId) {
          $this.positives = $this.computeStars(msg.message.rate, 5);
        }
      }
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
    // if (!$this.rate || $this.rate === 0) {
    //   $this.hasResults = false;
    //   return;
    // }
    $this.positives = $this.computeStars($this.rate, 5);
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public rating(star) {
    const $this = this;
    if ($this.questionId && $this.applicationId && $this.type) {
      $this.messageService.rateQuestion({
        applicationId: $this.applicationId,
        questionId: $this.questionId,
        questionType: $this.type,
        rating: star,
      });
    }
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public computeStars(rate, max?) {
    let maxRate = 5;
    if (!rate) {
      rate = 0;
    }
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
