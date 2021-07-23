import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ModalController, NavParams, PopoverController } from '@ionic/angular';
import {
  ActivityService,
} from '../../services';

const jsFilename = 'emotePopover';

@Component({
  selector: 'emote-popover',
  templateUrl: './emote-popover.html',
  styleUrls: ['./emote-popover.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmotePopover implements OnDestroy, OnInit {
  public showChat = true;

  constructor(
    private popoverController: PopoverController,
  ) {

  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    // await this.modalController.dismiss('close');
  }

  public emote(value) {
    this.popoverController.dismiss(value);
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    //
  }

}
