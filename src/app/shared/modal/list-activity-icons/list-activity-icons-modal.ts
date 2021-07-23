import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  IonicAlertService,
  UserService } from '../../services';

import { IActivity, IActivityDocument } from '../../models/activity/activity.interface';

import { default as dataExercises, IExercise } from '../../../../assets/data/exercises';

const jsFilename = 'ListActivityIconsModal';

@Component({
  selector: 'list-activity-icons-modal',
  templateUrl: './list-activity-icons-modal.html',
  styleUrls: ['./list-activity-icons-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ListActivityIconsModal implements OnDestroy, OnInit {
  public exerciseType = 'all';
  private subscriptions = [];
  public primarycolor = '#000';
  public secondarycolor = '#ccc';
  public activity: IActivityDocument;
  public exercises = dataExercises;
  public searchFilter: string; // not yet used

  public defaultExercise = {
    enabled: true,
    exerciseType: ['cardio', 'abs', 'core', 'arms', 'lower', 'upper'],
    exertionLevel: 'medium',
    label: 'Create Your Own',
    muscles: ['shoulders', 'forearm', 'chest', 'abs', 'sideabs', 'neck', 'back', 'glutes', 'upperlegs', 'lowerlegs'],
    name: 'other',
    plural: 'other',
    tags: ['other'],
  };

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private activityService: ActivityService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {
    const $this = this;

    dataExercises.sort((a: IExercise, b: IExercise) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });
    console.log('dataExercises - ', dataExercises);
  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
  }

  public onSearch(val: string) {
    this.exercises = this.filterByType(this.exerciseType);

    val = val.toLowerCase();

    if (!val || val.length === 0) {
      return;
    }
    val = val.replace(/[\W_]+/g, '');
    // filter excercies
    this.exercises = this.exercises.filter((x) => {
      let ret = false;
      x.tags.forEach((tag) => {
        if (tag.indexOf(val) >= 0) {
          ret = true;
        }
      });
      const labelTokens = x.label.toLowerCase().split(' ');
      labelTokens.forEach((tag) => {
        if (tag.indexOf(val) >= 0) {
          ret = true;
        }
      });
      return ret;
    });
  }

  public async selectExcersice(excersice) {
    await this.modalController.dismiss(excersice);
  }

  public changeExerciseType(selectedValue: any) {
    console.log('Selected ExerciseType: ', selectedValue.detail.value);
    const $this = this;
    this.exerciseType = selectedValue.detail.value;

    // filter excercies
    this.exercises = this.filterByType(this.exerciseType);
  }

  private filterByType(filter: string) {
    if (this.exerciseType === 'all') {
      return dataExercises;
    }

    const filteredExercises =  dataExercises.filter(x => x.exerciseType.indexOf(filter) >= 0);
    return filteredExercises;
  }

  public ngOnDestroy() {
    //
  }

  public addYourOwn() {
    window.open('https://www.youtube.com/watch?v=mecp1RNXYGg');
  }

}
