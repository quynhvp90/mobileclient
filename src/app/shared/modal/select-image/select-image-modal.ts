import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

const jsFilename = 'SelectImageModal';

@Component({
  selector: 'select-image-modal',
  templateUrl: './select-image-modal.html',
  styleUrls: ['./select-image-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SelectImageModal implements OnDestroy, OnInit {
  public images: string[] = [];

  constructor(
    private modalController: ModalController,
  ) {

  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
  }

  public async selectImage(image) {
    await this.modalController.dismiss(image);
  }

  public ngOnDestroy() {
    //
  }

}
