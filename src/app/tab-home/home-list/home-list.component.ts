declare var introJs: any;
import * as _ from 'lodash';

import { Component, OnInit, OnDestroy, NgZone, ViewEncapsulation } from '@angular/core';
import {
  HomeLogService,
  HomeService,
  BroadcastService,
  IonicAlertService,
  UserService,
  WorkoutService,
  TipsService,
  ChallengeService,
  GlobalService,
  PostService,
  ShareService,
} from '../../shared/services';

import { IonItemSliding, MenuController, LoadingController, NavController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import {
  Router, ActivatedRoute,
} from '@angular/router';
import { IUserDocument } from '../../shared/models/user/user.interface';

const jsFilename = 'home-list: ';

@Component({
  selector: 'home-list',
  templateUrl: './home-list.component.html',
  styleUrls: ['./home-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeListComponent implements OnInit, OnDestroy {
  private loader: HTMLIonLoadingElement = null;
  private subscriptions = [];

  public loading = true;

  constructor(
    private broadcastService: BroadcastService,
    public userService: UserService,
    private loadingController: LoadingController,
    public globalService: GlobalService,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    const $this = this;

    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        // respond to broadcast here
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams['mode'] && queryParams['mode'] === 'reload') {
          // reload data
          // this.getActivities();
        }
      });
    this.subscriptions.push(subscription);

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      // this.getActivities();
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewWillEnter() {
    const $this = this;
  }

  public ionViewWillLeave() {
  }

}
