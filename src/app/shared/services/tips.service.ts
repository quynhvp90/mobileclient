import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BroadcastService } from './broadcast.service';
import { GlobalService } from './global.service';
import { UserService } from './user.service';
// import { LoaderService } from '../../core/loader/loader.service';
const jsFilename = 'tipsService: ';

@Injectable()
export class TipsService {
  public tips = {
    showLogActivity: true,
    totalLogs: 0,
    totalCreatedActivities: 2,
    showQuickLogActivity: false,
    showAddNewExercise: true,
  };
 
  constructor(
    private globalService: GlobalService,
    private broadcastService: BroadcastService,
    private storage: Storage,
    private userService: UserService,
  ) {
    const $this = this;
    $this.storage.get('tips').then((tips) => {
      $this.tips = tips;
      if (!$this.tips) {
        $this.reset();
      }
    });

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        if (msg.message.action === 'add') {
          $this.tips.totalLogs += 1;
          $this.update();
        }
      } else if (msg.name === 'activity-created') {
        $this.tips.totalCreatedActivities += 1;
        $this.update();
      }
    });
  }

  public reset() {
    const $this = this;
    $this.tips = {
      showLogActivity: true,
      totalLogs: 0,
      totalCreatedActivities: 2,
      showQuickLogActivity: false,
      showAddNewExercise: true,
    };
  }

  private update() {
    const $this = this;

    if ($this.tips.totalLogs > 2) {
      $this.tips.showLogActivity = false;
    }

    $this.tips.showQuickLogActivity = false;

    if ($this.tips.totalCreatedActivities > 3 && $this.tips.totalLogs > 10 && $this.tips.totalLogs < 20) {
      $this.tips.showQuickLogActivity = true;
    }

    if ($this.tips.totalCreatedActivities > 4) {
      $this.tips.showAddNewExercise = false;
    }

    this.storage.set('tips', this.tips);
  }
}

