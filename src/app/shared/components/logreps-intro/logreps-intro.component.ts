import { Component, Input, OnInit, OnDestroy, Inject, ViewEncapsulation, ViewChild, Renderer } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { NgForm, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { IonSlides, Platform } from '@ionic/angular';
import { map, filter, catchError, mergeMap, finalize  } from 'rxjs/operators';

import { LoginService } from '../../services/login.service';

import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  UserService,
  IntercomService,
  ApiService} from '../../services';

const jsFilename = 'logreps-intro.component: ';

@Component({
  selector: 'logreps-intro',
  templateUrl: './logreps-intro.component.html',
  styleUrls: ['./logreps-intro.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class LogRepsIntroComponent implements OnInit, OnDestroy {
  @ViewChild('slides', { static: false }) slides: IonSlides;

  public introPrimaryColor = '#aaaaaa';
  public introSecondaryColor = '#ffffff';
  public display = 'push-ups';
  public count = 0;

  private subscriptions = [];
  private tempUserCreatedSuccess = false;
  private redirectUrl = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private loginService: LoginService,
    private intercomService: IntercomService,
    private platform: Platform,
    private apiService: ApiService,
  ) {
    const $this = this;

  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = 'ngOnInit: ';

    $this.createTempAccount();

    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        console.log('received broadcast login ' + this.redirectUrl);
        $this.tempUserCreatedSuccess = true;
        if (this.redirectUrl && this.redirectUrl.length > 0) {
          this.router.navigate([this.redirectUrl]);
        }
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.redirectUrl = params['redirectTo'];
      console.log('this.redirectUrl = ', this.redirectUrl);
    });
    this.subscriptions.push(subscription);

    this.intercomService.trackEvent('intro-shown', {});
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private createTempAccount() {
    const msgHdr = jsFilename + 'createTempAccount: ';
    const $this = this;

    this.apiService.post({
      resource: 'users',
      payload: {
        email: 'tempaccount',
        password: 'tempaccount',
      },
    }).pipe(
      map((user) => {
        return user;
      }), catchError((err) => {
        console.error(msgHdr + 'err = ', err);
        return err;
      }),
    ).subscribe((user) => {
      console.log('user = ', user);
      if (user) {
        this.userService.login(user);
      }
    });
  }

  public slideNext() {
    this.slides.slideNext();
  }
  public skipIntro(mode: string) {
    if (this.tempUserCreatedSuccess) {
      if (this.redirectUrl) {
        this.router.navigate([this.redirectUrl]);
      } else {
        this.router.navigate(['']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
