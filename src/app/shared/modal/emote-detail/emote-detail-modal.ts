import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { IMessageSocial } from '../../models/message.interface';

const jsFilename = 'EmoteDetailModal';

@Component({
  selector: 'emote-detail-modal',
  templateUrl: './emote-detail-modal.html',
  styleUrls: ['./emote-detail-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class EmoteDetailModal implements OnDestroy, OnInit {
  public emoteItems: IMessageSocial[] = [];

  constructor(
    private modalController: ModalController,
  ) {
    const $this = this;
  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss();
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    //
  }

}
