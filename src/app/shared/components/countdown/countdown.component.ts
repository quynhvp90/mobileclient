import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { BroadcastService } from '../../services';

const jsFilename = 'countdown: ';

@Component({
  selector: 'countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input() public endTimer: number;
  public durationString = '';

  private subscriptions = [];
  private intervalTimer = null;
  private intervalStartTimer = null;

  constructor(
    private broadcastService: BroadcastService,
  ) {
    const $this = this;
  }

  public ngOnInit(): void {
    const $this = this;

    $this.restartTime();
    $this.intervalStartTimer = setInterval(() => {
      console.log('countdown.component interval');
      $this.restartTime();
    }, 60 * 1000);

    // const subscription = $this.broadcastService.subjectUniversal.subscribe((msg) => {
    //   if (msg.name === 'update-challenge-user') {
    //   } else if (msg.name === 'update-challenges') {
    //     $this.restartTime();
    //   }
    // });
    // this.subscriptions.push(subscription);
  }

  private restartTime() {
    const $this = this;
    let timeLeft = $this.endTimer;
    if (timeLeft.toString() === 'NaN') {
      return;
    }

    timeLeft = $this.computeTime(timeLeft);

    if ($this.intervalTimer) {
      clearInterval($this.intervalTimer);
      $this.intervalTimer = null;
    }

    $this.intervalTimer = setInterval(() => {
      timeLeft = $this.computeTime(timeLeft);
    }, 1000);
  }

  private computeTime(timeLeft: number) {
    const $this = this;
    const interval = 1000;
    const oneSecond = 1;
    const oneMinute = 60 * oneSecond;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    timeLeft -= interval;
    let t = timeLeft / 1000;

    const days = Math.floor(t / oneDay);
    t -= days * oneDay;

    const hours = Math.floor(t / oneHour) % 24;
    t -= hours * oneHour;

    const minutes = Math.floor(t / oneMinute) % 60;
    t -= minutes * oneMinute;

    const seconds =  Math.floor(t % 60);

    if (days > 0) {
      // $this.durationString = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
      $this.durationString = days + ' day';
      if (days > 1) {
        $this.durationString += 's';
      }
    } else  if (hours > 1) {
      // $this.durationString = hours + 'h ' + minutes + 'm ' + seconds + 's';
      $this.durationString = hours + ' hour';
      if (hours > 1) {
        $this.durationString += 's';
      }
    } else  if (hours > 0) {
      // $this.durationString = hours + 'h ' + minutes + 'm ' + seconds + 's';
      $this.durationString = hours + 'h ' + minutes + 'm ';
    } else if (minutes > 0) {
      $this.durationString = minutes + 'm ' + seconds + 's';
    } else {
      if (minutes > 0) {
        $this.durationString = seconds + 's';
      }
    }

    return timeLeft;
  }

  public ngOnDestroy() {
    const $this = this;

    $this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    if ($this.intervalTimer) {
      clearInterval($this.intervalTimer);
      $this.intervalTimer = null;
    }
    if ($this.intervalStartTimer) {
      clearInterval($this.intervalStartTimer);
      $this.intervalStartTimer = null;
    }
  }
}
