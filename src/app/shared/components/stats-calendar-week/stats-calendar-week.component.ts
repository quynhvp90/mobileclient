import { Component, ViewChild, OnInit, OnDestroy, Input, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  StatsService,
  UserService } from '../../services';

import * as moment from 'moment';
import { Chart } from 'chart.js';
import { Statement } from '@angular/compiler';

const jsFilename = 'stats-calendar-week: ';

interface IAggregateResult {
  count: number;
  _id: {
    year: number;
    month: number;
    day: number;
  };
}

@Component({
  selector: 'stats-calendar-week',
  templateUrl: './stats-calendar-week.component.html',
  styleUrls: ['./stats-calendar-week.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatsCalendarWeekComponent implements OnInit, OnDestroy {
  @ViewChild('weekBarCanvas', { static: false }) weekBarCanvas: any;

  private subscriptions = [];
  public calendar: {
    weeks?: {
      label?: string,
      days?: number[],
    }[];
  } = {};

  constructor(
    private router: Router,
    private statsService: StatsService,
    private broadcastService: BroadcastService,
  ) {
  }

  public ngOnInit(): void {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'ionViewWillEnter-stats-list') {
        $this.ionViewWillEnter();
      }
    });
    this.subscriptions.push(subscription);
    // $this.getStats(); // fired on ionViewWillEnter
  }

  public ionViewWillEnter() {
    const $this = this;
    // console.debug('ionview will enter');
    $this.getStats();
  }

  public ionViewDidEnter() {
    const $this = this;
    // console.debug('ionview did enter');
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private getStats() {
    const $this = this;
    const msgHdr = jsFilename + 'getStats: ';
    // console.debug(msgHdr);
    $this.statsService.getStats().subscribe((res) => {
      // console.debug(msgHdr + 'res = ', res);
      $this.listCountPerDay(res);

    });
  }

  private listCountPerDay(stats: IAggregateResult[]) {
    const $this = this;
    const msgHdr = jsFilename + 'getStats: ';
    // console.debug(msgHdr + 'stats = ', stats);
    const todayMs = (new Date()).getTime();
    const dayCounterMs = todayMs - (7 * 24 * 60 * 60 * 1000);

    const statsWeek: {
      date: Date;
      count: number;
    }[] = [];

    const statsLast4Weeks: {
      date: Date;
      count: number;
    }[] = [];

    const statsFourWeeks: {
      date: Date;
      count: number;
    }[] = [];

    const statsMonth: {
      date: Date;
      count: number;
    }[] = [];

    const d = new Date();
    let tempDayMS = $this.getMonday(d);
    for (let i = 0; i < 7; i += 1) {
      // // console.debug('day of week = ', new Date(tempDayMS));
      const tempDate = new Date(tempDayMS);

      statsWeek.push({
        date: tempDate,
        count: $this.findStat(stats, tempDate),
      });

      tempDayMS += (1 * 24 * 60 * 60 * 1000);
    }
    setTimeout(() => {
      $this.plotChart(statsWeek);
    }, 100);

    const d2 = new Date();
    d2.setDate(d2.getDate() - (7 * 3));
    let tempFourWeeksMS = $this.getMonday(d2);
    for (let i = 0; i < (7 * 4); i += 1) {
      const tempDate = new Date(tempFourWeeksMS);
      // console.debug('tempDate = ', tempDate);

      statsFourWeeks.push({
        date: tempDate,
        count: $this.findStat(stats, tempDate),
      });

      tempFourWeeksMS += (1 * 24 * 60 * 60 * 1000);
    }
    // console.debug('statsFourWeeks = ', statsFourWeeks);
    let week = -1;
    let day = 0;
    let days: number[] = [];
    let weekOfLabel = null;
    $this.calendar.weeks = [];
    statsFourWeeks.forEach((stat) => {
      day += 1;
      if (day === 1) {
        weekOfLabel = moment(stat.date).format('DDMMM');
        // console.debug(weekOfLabel + '-' + stat.date);
      }

      if (moment(stat.date).format('DDMMM') === moment().format('DDMMM')) {
        days.push(-1);
      } else {
        days.push(stat.count);
      }

      if (day === 7) {
        // console.debug('PUSHING = ', days);
        $this.calendar.weeks.push({
          label: weekOfLabel,
          days: days,
        });
        weekOfLabel = null;
        days = [];
        day = 0;
        week += 1;
      }
    });

    // if (days.length > 0) {
    //   for (let i = days.length; i < 7; i += 1) {
    //     days.push(0);
    //   }
    //   $this.calendar.weeks.push({
    //     label: weekOfLabel,
    //     days: days,
    //   });
    // }
    // console.debug('pushing = ', days);
    // console.debug('$this.calendar.weeks = ', $this.calendar.weeks);

    let tempDayOfMonthMS = $this.getFirstDayOfMonth();
    const daysInMonth = $this.getDaysInMonth();
    for (let i = 0; i < daysInMonth; i += 1) {
      // // console.debug('day of month = ', new Date(tempDayOfMonthMS));
      const tempDate = new Date(tempDayOfMonthMS);

      statsMonth.push({
        date: tempDate,
        count: $this.findStat(stats, tempDate),
      });

      tempDayOfMonthMS += (1 * 24 * 60 * 60 * 1000);
    }

    // // console.debug('statsMonth =', statsMonth);
    // // console.debug('statsWeek =', statsWeek);

  }

  private getMonday(d: Date) {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return (new Date(d.setDate(diff)).getTime());
  }

  private getFirstDayOfMonth() {
    const d = new Date();
    return (new Date(d.getFullYear(), d.getMonth(), 1)).getTime();
  }

  private getDaysInMonth() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  private findStat(stats: IAggregateResult[], tempDate: Date) {
    let count = 0;
    const day = tempDate.getDate();
    const month = tempDate.getMonth() + 1;
    const year = tempDate.getFullYear();

    stats.forEach((stat) => {
      if (stat._id.day === day) {
        if (stat._id.month === month) {
          if (stat._id.year === year) {
            count = stat.count;
          }
        }
      }
    });
    return count;
  }

  private plotChart(stats: {
    date: Date;
    count: number;
  }[]) {
    const labels = [];
    const datasetTotal = [];

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    stats.forEach((stat) => {
      const day = stat.date.getDay();
      const temp = day - (day === 0 ? -6 : 1);
      labels.push(days[temp]);
      datasetTotal.push(stat.count);
    });

    const datasets = [{
      label: 'Total',
      data: datasetTotal,
      backgroundColor: '#238193',
      borderColor: '#238193',
      // backgroundColor: '#ffffff',
      // borderColor: '#ffffff',
      borderWidth: 1,
    }];

    // console.debug('datasets = ', datasets);

    new Chart(this.weekBarCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        // responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
        scales: {
          xAxes: [{
            stacked: true,
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
            },
            gridLines : {
              display : false,
            },
          }],
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              suggestedMax: 25,
            },
          }],
        },
      },
    });
  }
}
