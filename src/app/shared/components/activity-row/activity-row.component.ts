import { Component, Input, OnInit, AfterViewInit, OnDestroy, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { NgForm, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { map, debounceTime, share } from 'rxjs/operators';

import * as p5 from 'p5/lib/p5.min';

import { NavController   } from '@ionic/angular';

import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  UserService } from '../../services';

import { IActivity, IActivityDocument } from '../../models/activity/activity.interface';

const jsFilename = 'activity-row: ';

@Component({
  selector: 'activity-row',
  templateUrl: './activity-row.component.html',
  styleUrls: ['./activity-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityRowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public activity: IActivityDocument;
  @Input() public parent: string;
  @Input() public showAdd: false;

  public primarycolor = '#FF6A01';
  public secondarycolor = '#FF8E3D';
  public count = 0;
  public showCongrats = false;

  public logLabel = 'push-ups';

  private subscriptions = [];
  private p5;
  private p5canvas;

  private percentComplete = -1;

  public gradBar = {
    width: '0%',
    // 'background': '-webkit-linear-gradient(left, #76BF00, #86DE00)', /* For Safari 5.1 to 6.0 */
    // 'background': '-o-linear-gradient(right, #76BF00, #86DE00)', /* For Opera 11.1 to 12.0 */
    // 'background': '-moz-linear-gradient(right, #76BF00, #86DE00)', /* For Firefox 3.6 to 15 */
    background: 'linear-gradient(to right, #76BF00, #86DE00)', /* Standard syntax (must be last) */
    transition: 'width 1s ease-in-out',
  };

  public gradBarToGo = {
    width: '100%',
    transition: 'width 1s ease-in-out',
  };

  private  colors = {
    red: {
      primary: '#E44646',
      secondary: '#E26668',
    },
    blue: {
      primary: '#377EB8',
      secondary: '#4BACF2',
    },
    green: {
      primary: '#4DAF4A',
      secondary: '#61D85D',
    },
    purple: {
      primary: '#984EA3',
      secondary: '#BD61CC',
    },
    orange: {
      primary: '#FF6A01',
      secondary: '#FF8D42',
    },
    yellow: {
      primary: '#FFBF02',
      secondary: '#FFE38E',
    },
    black: {
      primary: '#777',
      secondary: '#CCC',
    },
    default: {
      primary: '#0a9ec7', // 007090
      secondary: '#ccc', //
    },
  };

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    private userService: UserService,
  ) {
    const $this = this;
    const msgHdr = jsFilename + 'constructor: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        if (msg.message.activityId === $this.activity._id && $this.activity.lookup) {
          const congratulateUser = $this.updateData();
          if (congratulateUser) {
            if ($this.parent === 'list') {
              $this.congratulate();
            }
          }
        }
      } else if (msg.name === 'activity-updated') {
        if (msg.message.activityId === $this.activity._id) {
          $this.activity.goal = msg.message.activityObject.goal;
          $this.activity.name = msg.message.activityObject.name;
          $this.activity.measurement = msg.message.activityObject.measurement;
          $this.activity.unit = msg.message.activityObject.unit;

          $this.updateData();
          this.broadcastService.broadcast('activity-row-updated', {
            name: $this.activity.name,
            activityId: this.activity._id.toString(),
          });
        }
      } else if (msg.name === 'all-activities-updated') {
        $this.updateData();
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    $this.updateData();

    $this.percentComplete = $this.count / $this.activity.goal;
    if ($this.percentComplete > 1) {
      $this.percentComplete = 1;
    }
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public congratulate() {
    const $this = this;
    const msgHdr = 'congratulate: ';

    this.showCongrats = true;
    setTimeout(() => {
      this.showCongrats = false;
    }, 4000);
    setTimeout(() => {
      this.drawP5();
    }, 100);
  }

  public drawP5() {
    const $this = this;
    const msgHdr = 'drawP5: ';

    const balls = [];
    let showTimer = 0;
    const canvasHeight = 98;

    this.p5canvas = window.document.getElementById(this.activity._id);
    const test = this.p5canvas;
    this.p5 = new p5(sketch, test);

    for (let i = 0; i < 40; i += 1) {
      doSetTimeout(this.p5, i);
    }

    function sketch(p: any) {
      p.setup = () => {
        p.createCanvas($this.p5canvas.offsetWidth, canvasHeight);
      };

      p.draw = () => {
        showTimer += 1;
        p.background(255);
        // p.clear();

        p.fill(0);
        if (showTimer > 30) {
          p.textSize(25);
          p.text('Congratulations', 2, canvasHeight / 2 - 5);
          p.textSize(20);
          p.fill(128, 128, 128);
          p.text('You met your goal!', 2, canvasHeight / 2 + 15);
        }
        for (let i = 0; i < balls.length; i += 1) {
          balls[i].update();
          balls[i].render();
          if (balls[i].ballisFinished()) {
            balls.splice(i, 1);
          }
        }
      };
    }

    function addBalls(p: any, x, y, x2, y2) {
      for (let i = 0; i < 50; i += 1) {
        balls.push(new Ball(p, (x + p.random(-30, 30)), y + p.random(-30, 30), x2, y2));
      }
    }

    function doSetTimeout(p: any, i) {
      setTimeout(() => {
        addBalls(p, i * 15, 100, i * 15, 100);
      }, (i * 20));
    }
  }

  private updateData() {
    const $this = this;
    const msgHdr = jsFilename + this.activity._id + ': updateData: ';

    $this.primarycolor = '#FF6A01';
    $this.secondarycolor = '#FF8E3D';
    $this.logLabel = $this.activity.label;

    $this.count = 0;
    const shadowActivity = <any> $this.activity; // activity does not natively have count, but in challenge.lookups.activities it does
    if (shadowActivity.count) {
      $this.count = shadowActivity.count;
    } else if ($this.activity.lookup && $this.activity.lookup.count) {
      $this.count = $this.activity.lookup.count;
    }
    $this.updateActivityLabel();

    let congratulateUser = false;

    let percentComplete = $this.count / $this.activity.goal;
    if (percentComplete >= 1) {
      percentComplete = 1;
      if (($this.percentComplete >= 0) && $this.percentComplete < 1) {
        congratulateUser = true;
      }
    }
    $this.percentComplete = percentComplete;

    const percentToGoal = percentComplete;
    let colorToUse = 'black';
    if (percentToGoal === 0) {
      colorToUse = 'black';
    } else if (percentToGoal < 0.25) {
      colorToUse = 'blue';
    } else if (percentToGoal < 0.50) {
      colorToUse = 'red';
    } else if (percentToGoal < 0.75) {
      colorToUse = 'orange';
    } else if (percentToGoal < 1.0) {
      colorToUse = 'yellow';
    } else {
      colorToUse = 'green';
    }
    $this.primarycolor = $this.colors[colorToUse].primary;
    $this.secondarycolor = $this.colors[colorToUse].secondary;
    $this.gradBar.width = (percentToGoal * 100) + '%';
    $this.gradBar.background = 'linear-gradient(to right, ' + $this.colors[colorToUse].primary + ', ';
    $this.gradBar.background += $this.colors[colorToUse].secondary + ')';
    $this.gradBarToGo.width = ((1 - percentToGoal) * 100) + '%';
    $this.broadcastService.broadcast('changeColor-icon', {
      name: $this.activity.name,
      activityId: this.activity._id.toString(),
      primarycolor:  $this.primarycolor,
      secondarycolor: $this.secondarycolor,
    });

    return congratulateUser;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public updateActivityLabel() {
    this.logLabel = this.activity.label;
    if (this.activity.measurement === 'repetitions') {
      if (this.activity.weight) {
        this.logLabel += ' @ ' + this.activity.weight;
      }
    } else {
      if (this.activity.unit) {
        this.logLabel = this.activity.unit + ' ' + this.activity.label;
      }
    }
  }
}

class Ball {
  private x;
  private y;
  private speed;
  private gravity;
  private diameter;
  private ax;
  private ay;
  private colour;
  private p5ref;

  constructor(p5ref, x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.gravity = 0.1;
    this.diameter = (p5ref.dist(x, y, x2, y2)) * 0.8;

    this.ax = p5ref.random(-this.speed, this.speed);
    this.ay = p5ref.random(-this.speed, this.speed);
    this.p5ref = p5ref;

    this.colour = p5ref.random(['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423']);
  }

  public update() {
    this.diameter = this.diameter - 0.3;
    this.x += this.ax / 2;
    this.y += this.ay / 2;

    this.x += this.p5ref.random(-this.speed / 2, this.speed / 2);
    this.y += this.p5ref.random(-this.speed / 2, this.speed / 2);
  }

  public ballisFinished() {
    if (this.diameter < 0) {
      return true;
    }
  }

  public render() {
    // print(this.colour);
    this.p5ref.noStroke();
    if (this.diameter > 0) {
      this.p5ref.fill(this.colour);
      this.p5ref.ellipse(this.x, this.y, this.diameter, this.diameter);
    }
  }
}
