import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import {
  ActivityService } from '../../services';

const jsFilename = 'MuscleModal';

@Component({
  selector: 'muscle-modal',
  templateUrl: './muscle-modal.html',
  styleUrls: ['./muscle-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MuscleModal implements OnDestroy, OnInit {

  public listPathSelected = '';
  public muscles = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
  ) {
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
  }
  ionViewWillEnter() {
    this.muscles = this.navParams.get('muscles');
  }
  public async save() {
    await this.modalController.dismiss(this.listPathSelected);
  }

  public handlerSelectedMuscles (muscles) {
    this.listPathSelected = muscles;
  }

  public ngOnDestroy() {
    //
  }

}
