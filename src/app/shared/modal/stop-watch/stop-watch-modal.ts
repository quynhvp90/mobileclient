import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { IActivityDocument } from '../../models/activity/activity.interface';

@Component({
  selector: 'stop-watch-modal',
  templateUrl: './stop-watch-modal.html',
  styleUrls: ['./stop-watch-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class StopWatchModal implements OnDestroy, OnInit {
  constructor(
    private modalController: ModalController,
  ) {

  }

  public ngOnInit() {
    const $this = this;

  }

  public ngOnDestroy() {
    const $this = this;
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }

}
