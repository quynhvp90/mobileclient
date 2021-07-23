import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import {
  ActivityLogService,
  BroadcastService,
  ActivityService,
  UserService } from '../../../shared/services';

import { default as dataExercises, IExercise } from '../../../../assets/data/exercises';

const jsFilename = 'activity-icon: ';

@Component({
  selector: 'activity-icon',
  templateUrl: './activity-icon.component.html',
  styleUrls: ['./activity-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ActivityIconComponent implements OnDestroy, OnInit {
  @Input() public primarycolor = '#FF6A01';
  @Input() public secondarycolor = '#FF8E3D';
  @Input() set name(val: string) {
    this.changeName(val);
  }
  @Input() public activityId = '';
  @Input() public width = '100%';
  @Input() public height = '100%';
  @Input() public subscribeToEvents = true;

  public svg: SafeHtml;
  private privateName = 'pushup';
  private subscriptions = [];

  constructor(
    private sanitizer: DomSanitizer,
    private broadcastService: BroadcastService,
    private http: HttpClient,
  ) {
    const $this = this;
  }

  public changeName(val: string) {
    this.privateName = val;
    this.setSvgData();
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;
    $this.setSvgData();

    if (!this.subscribeToEvents) {
      return;
    }

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (this.activityId && msg.name === 'activity-row-updated' && this.activityId === msg.message.activityId) {
        this.changeName(msg.message.name);
      } else if (msg.name === 'activity-new-icon' && !this.activityId) {
        this.changeName(msg.message.name);
      } else if (msg.name === 'changeColor-icon' && this.activityId === msg.message.activityId) {
        $this.primarycolor = msg.message.primarycolor;
        $this.secondarycolor = msg.message.secondarycolor;
        this.changeName(msg.message.name);
      }
    });
    this.subscriptions.push(subscription);
  }

  private setSvgData() {
    const $this = this;
    if (!this.privateName || this.privateName === 'undefined') {
      return;
    }

    let imageName = this.privateName;
    dataExercises.forEach((exercise) => {
      if (exercise.name === this.privateName) {
        if (exercise.image && exercise.image.length > 0) {
          imageName = exercise.image;
        }
      }
    });
    const iconUrl = 'assets/icon/activity-icon/' + imageName + '.svg';

    this.http.get(
      iconUrl,
      {
        responseType: 'text',
      },
    ).subscribe((data) => {
      let svgContent = data.toString();
      svgContent = svgContent.replace(/\#000000/gi, this.primarycolor);
      svgContent = svgContent.replace(/\#cccccc/gi, this.secondarycolor);
      $this.svg = $this.sanitizer.bypassSecurityTrustHtml(svgContent);
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
