import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { ActivityEditModalComponent } from 'src/app/tab-activity/activity-modals/activity-edit-modal/activity-edit-modal.component';
import { IActivityDocument } from '../../shared/models/activity/activity.interface';
import { ActivityService, IonicAlertService, ActivityLogService } from '../../shared/services';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'stat-detail',
  templateUrl: './stat-detail.component.html',
  styleUrls: ['./stat-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatDetailComponent implements OnInit, OnDestroy {
  @ViewChild('barCanvas', { static: false }) barCanvas;

  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public activity: IActivityDocument;
  public activityId = '';
  public groupBy = 'week';

  public chartLabel = '';
  public chartTotal = 0;

  public barChart: any;

  constructor(
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private ionicAlertService: IonicAlertService,
    private navCtrl: NavController,
    private modalController: ModalController,
  ) {
    const $this = this;
    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });
  }

  public ngOnInit() {
    const $this = this;

    const subscription =  this.route.params.subscribe((params: Params) => {
      this.activityId  = params['id'];
      console.log('this.activityId = ', this.activityId);
      if (!this.activityId) {
        return;
      }
      this.getActivity();
    });
    $this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public segmentChanged(value) {
    // console.log('segment = ', segment);
    this.groupBy = value;
    this.getActivity();
  }

  private getActivity() {
    let offSet = -7;
    const fromDateDT = new Date();

    if (this.groupBy === 'month') {
      offSet = -365;
    } else if (this.groupBy === 'year') {
      offSet = -3650;
    }

    fromDateDT.setDate(fromDateDT.getDate() + offSet);

    const toDateDT = new Date();
    toDateDT.setDate(toDateDT.getDate());

    const $this = this;

    const fromDate = (fromDateDT).setHours(0, 0, 0, 0);
    const toDate = (toDateDT).setHours(23, 59, 59, 0);

    const subscription = this.activityService.getActivity(this.activityId, {
      fromDate: fromDate,
      toDate: toDate,
      groupBy: this.groupBy,
    }).subscribe((foundActivity) => {
      if (foundActivity) {
        this.activity = foundActivity;
        $this.drawChart(fromDate, toDate, foundActivity, foundActivity.lookup.stats);
      }
      // duplicateActivites

    });
    this.subscriptions.push(subscription);
  }

  public async editActivity () {
    const $this = this;
    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityEditModalComponent,
      componentProps: {
        mode: 'edit',
        activityId: this.activityId,
      },
    });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
      }
    });
    await modal.present();
  }

  public drawChart(fromDateMS: number, toDateMS: number, foundActivity: IActivityDocument, stats: {
    _id: {
      year: number,
      month?: number,
      day?: number,
    },
    count: number,
  }[]) {
    const labels = [];
    const datasetTotal = [];
    const datasetDelta = [];
    const toDate = new Date(toDateMS);
    const fromDate = new Date(fromDateMS);
    const baseYear = 2018;

    this.chartTotal = 0;

    if (this.groupBy === 'year') {
      this.chartLabel = 'Total ' + foundActivity.label + ' for all time: ';

      const startYear = baseYear;
      const endYear = toDate.getFullYear();
      for (let year = baseYear; year <= endYear; year += 1) {
        labels.push(year);
        let value = 0;
        stats.forEach((stat) => {
          if (stat._id.year === year) {
            value = stat.count;
          }
        });
        this.chartTotal += value;
        datasetTotal.push(value);
      }
    } else if (this.groupBy === 'month') {
      this.chartLabel = 'Total ' + foundActivity.label + ' in the last year: ';

      const startYear = fromDate.getFullYear();
      const endYear = toDate.getFullYear();
      for (let year = baseYear; year <= endYear; year += 1) {
        let month = new Date(fromDateMS).getMonth();
        if (year !== baseYear) {
          month = 0;
        }
        let endMonth = 11;
        if (year === endYear) {
          endMonth = toDate.getMonth();
        }

        for (month; month <= endMonth; month += 1) {
          labels.push(year + '-' + (month + 1));
          let value = 0;
          stats.forEach((stat) => {
            if (stat._id.year === year) {
              if (stat._id.month === (month + 1)) {
                value = stat.count;
              }
            }
          });
          this.chartTotal += value;
          datasetTotal.push(value);
        }
      }
    } else {
      this.chartLabel = 'Total ' + foundActivity.label + ' in the last week: ';

      const currDate = new Date(fromDate);
      const endDate = new Date(fromDate);
      endDate.setDate(currDate.getDate() + 7);
      for (currDate; currDate <= endDate; currDate.setDate(currDate.getDate() + 1)) {
        labels.push(moment(currDate).format('YYYY-MM-DD'));
        let value = 0;
        stats.forEach((stat) => {
          if (stat._id.year === currDate.getFullYear()) {
            if (stat._id.month === currDate.getMonth() + 1) {
              if (stat._id.day === currDate.getDate()) {
                value = stat.count;
              }
            }
          }
        });
        datasetTotal.push(value);
        this.chartTotal += value;

        let delta = foundActivity.goal - value;
        if (delta < 0) {
          delta = 0;
        }
        datasetDelta.push(delta);
      }
    }

    // const labels = ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'];
    // const datasetTotal = [12, 19, 3, 5, 2, 3];
    // const datasetDelta = [8, 1, 17, 15, 18, 17];

    const datasets = [{
      label: 'Total',
      data: datasetTotal,
      backgroundColor: '#238193',
      borderColor: '#238193',
      borderWidth: 1,
    }];

    if (datasetDelta.length > 0) {
      datasets.push({
        label: 'Goal',
        data: datasetDelta,
        backgroundColor: '#E4F7FC',
        borderColor: '#E4F7FC',
        borderWidth: 1,
      });
    }

    this.barChart = new Chart(this.barCanvas.nativeElement, {
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
              maxRotation: 90,
              minRotation: 90,
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

    // setTimeout(() => {
    //   const ctx: any = document.getElementById('barCanvas');
    //   ctx.height = 500;
    // }, 500);
  }

  public removeStats() {
    const $this = this;

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to delete all the stats for ' + $this.activity.label +  '?', () => {
      $this.loader.present();
      const subscription = this.activityLogService.archiveActivityLogs($this.activity._id)
        .subscribe((isSuccess: boolean) => {
          $this.loader.dismiss();
          if (isSuccess) {
            $this.navCtrl.navigateBack('tabs/stats');
          }
        });
      $this.subscriptions.push(subscription);
    });
  }
}
