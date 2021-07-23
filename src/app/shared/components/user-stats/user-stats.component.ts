import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { UtilityService, BroadcastService } from '../../services';
import { ApiService } from '../../services/api.service';
import { TooltipPopover } from 'src/app/shared/popover/tooltip/tooltip-popover';
import { PopoverController } from '@ionic/angular';

const jsFilename = 'user-stats: ';

@Component({
  selector: 'user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss'],
})

export class UserStatsComponent implements OnDestroy, OnInit {
  @Input() public userStats: any;
  @Input() public displayName: string;

  private subscriptions: Subscription[] = [];

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService,
    private broadcastService: BroadcastService,
    private popoverController: PopoverController,
  ) {
    const $this = this;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ngOnInit() {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    });
    this.subscriptions.push(subscription);
  }

  public async showStats($event: Event) {
    const $this = this;
    const msgHdr = jsFilename + 'showStats: ';

    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    if (this.displayName.toLowerCase() === 'someone') {
      return;
    }

    let day = 'day';
    if ($this.userStats.totalDaysLogged > 1) {
      day = 'days';
    }

    let streakDay = 'day';
    if ($this.userStats.dailyStreaks > 1) {
      streakDay = 'days';
    }

    let emoji = '⚡';
    if ($this.userStats.dailyStreaks > 5 && $this.userStats.dailyStreaks < 30) {
      emoji = '🔥';
    } else if ($this.userStats.dailyStreaks >= 30) {
      emoji = '🏆';
    }

    const popover = await this.popoverController.create({
      component: TooltipPopover,
      componentProps: {
        html: '🗓️  <b>' + $this.userStats.totalDaysLogged + '</b> ' + day + ' of logged activities<br />' + emoji + ' <b> ' + $this.userStats.dailyStreaks + '</b> ' + streakDay + ' in a row - "streaks"',
      },
      event: $event,
      translucent: false,
      cssClass: 'popover-wide',
    });

    popover.onDidDismiss().then((val) => {
    });
    return popover.present();

  }
}
