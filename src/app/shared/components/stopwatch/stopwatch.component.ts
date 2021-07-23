import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import * as moment from 'moment';
import { BroadcastService } from '../../services';

const jsFilename = 'stopwatch: ';

@Component({
  selector: 'stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StopwatchComponent implements OnInit, OnDestroy {
  private subscriptions = [];

  public timeElements = {
    milliseconds: '00',
    seconds: '00',
    minutes: '00',
    hours: '00',
  };

  private startTime: Date;
  private intervalTimer = null;
  private timeoutTimer = null;
  private pausedStartTime: Date = null;

  public paused = false;

  constructor(
    private broadcastService: BroadcastService,
  ) {
    const $this = this;
  }

  public ngOnInit(): void {
    const $this = this;
    $this.startTimer();
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

    if ($this.timeoutTimer) {
      clearTimeout($this.timeoutTimer);
    }
  }

  public startTimer() {
    const $this = this;
    $this.paused = false;

    if ($this.intervalTimer) {
      clearInterval($this.intervalTimer);
    }

    $this.startTime = new Date();

    $this.updateDisplay();

    // $this.intervalTimer = setInterval(() => {
    //   $this.updateDisplay();
    // }, 75);
    $this.loopTimer();
  }

  private loopTimer() {
    const $this = this;

    if ($this.timeoutTimer) {
      clearTimeout($this.timeoutTimer);
    }

    $this.timeoutTimer = setTimeout(() => {
      $this.updateDisplay();
      $this.loopTimer();
    }, 75);
  }

  private updateDisplay() {
    const $this = this;
    const diff = (new Date()).getTime() - $this.startTime.getTime();

    const oneSecond = 1000;
    const oneMinute = 60 * oneSecond;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    let t = diff;

    const days = Math.floor(t / oneDay);
    t -= days * oneDay;

    const hours = Math.floor(t / oneHour) % 24;
    t -= hours * oneHour;

    const minutes = Math.floor(t / oneMinute) % 60;
    t -= minutes * oneMinute;

    const seconds =  Math.floor(t / oneSecond % 60);
    t -= seconds * oneSecond;

    const milliseconds =  Math.floor(t % 1000);

    $this.timeElements.hours = hours.toString().padStart(2, '0');
    $this.timeElements.minutes = minutes.toString().padStart(2, '0');
    $this.timeElements.seconds = seconds.toString().padStart(2, '0');
    $this.timeElements.milliseconds = milliseconds.toString().padStart(3, '0').substr(0, 2);
  }

  public pause() {
    const $this = this;
    this.paused = true;

    this.pausedStartTime = new Date();
    if ($this.timeoutTimer) {
      clearTimeout($this.timeoutTimer);
    }
  }

  public resume() {
    this.paused = false;
    const pausedDiffMS = (new Date()).getTime() - this.pausedStartTime.getTime();
    this.startTime = new Date(this.startTime.getTime() + pausedDiffMS);
    this.loopTimer();
  }

}
