import { Component, OnInit, OnDestroy, ViewEncapsulation, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import {
  ActivityService,
} from '../../services';

const jsFilename = 'tooltipPopover';

@Component({
  selector: 'tooltip-popover',
  templateUrl: './tooltip-popover.html',
  styleUrls: ['./tooltip-popover.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class TooltipPopover implements OnDestroy, OnInit {
  public html: string;

  constructor(
    private popoverController: PopoverController,
    private navParams: NavParams,
  ) {
    this.html = this.navParams.get('html');
  }

  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }

  async dismiss() {
    // await this.modalController.dismiss('close');
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    //
  }

}
