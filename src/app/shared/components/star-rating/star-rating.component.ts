import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { rawListeners } from 'process';
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
  @Input() public name = null;
  @Input() public questionId = null;
  @Input() public application = null;
  @Input() public type = null;
  // public hasResults = true;
  private subscriptions = [];
  private positives = [];
  private model = 'rating-star-result';
  private positiveSources = [];
  constructor(
    private broadcastService: BroadcastService,
    private messageService: MessageService,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'update-rating') {
        if (msg.message && msg.message.questionId === $this.questionId) {
          $this.rate = msg.message.rate;
          $this.positives = $this.computeStars(msg.message.rate, 5);
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    if ($this.name) {
      $this.model += ('-' + $this.name);
    }
    // tslint:disable-next-line: no-increment-decrement
    // for (let index = 0; index < 6; index++) {
    //   $this.positiveSources.push($this.computeStars(index));
    // }
    if (!$this.rate) {
      $this.rate = 0;
    }
    console.log('$this.rate ==== ', $this.rate);
    // if (!$this.rate || $this.rate === 0) {
    //   $this.hasResults = false;
    //   return;
    // }
    $this.positives = $this.computeStars($this.rate, 5);
  }

  public ratingChange() {
    const $this = this;
    if (!$this.name) {
      return;
    }
    $this.positives = $this.computeStars($this.rate, 5);
    $this.broadcastService.broadcast($this.model, {
      rate: $this.rate,
    });
  }
  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public rating(star) {
    const $this = this;
    $this.rate = star;
    $this.positives = $this.computeStars(star, 5);
    if ($this.questionId && $this.application && $this.type) {
      $this.messageService.rateQuestion({
        application: $this.application,
        questionId: $this.questionId,
        jobId: $this.application.jobId,
        questionType: $this.type,
        rating: star,
      });
    } else {
      $this.broadcastService.broadcast($this.model, {
        rate: star,
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
    // tslint:disable-next-line: no-increment-decrement
    for (let index = 1; index <= maxRate; index++) {
      if ((rate - index) > 0 && (rate - index) < 1) {
        positives.push({
          display: 'star-half',
        });
      } else if (rate - index >= 0) {
        positives.push({
          display: 'star',
        });
      } else if (rate - index < 0) {
        positives.push({
          display: 'star-outline',
        });
      }
    }
    return positives;
  }
}
