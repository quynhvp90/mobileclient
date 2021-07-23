import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { IActivityDocument } from '../../models/activity/activity.interface';

@Component({
  selector: 'list-activity-icons-modal',
  templateUrl: './avatar-builder-modal.html',
  styleUrls: ['./avatar-builder-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class AvatarBuilderModal implements OnDestroy, OnInit {

  public primarycolor = '#000';
  public secondarycolor = '#ccc';
  public activity: IActivityDocument;
  public avatarImages = [];
  public searchFilter: string; // not yet used

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
    let avatarImg = '';
    this.avatarImages = [];
    for (let i = 1; i <= 75; i += 1) {
      if (i < 10) {
        avatarImg = this.pad(i, 3);
        this.avatarImages.push(avatarImg);
      } else {
        avatarImg = this.pad(i, 3);
        this.avatarImages.push(avatarImg);
      }
    }
    this.avatarImages = this.shuffle(this.avatarImages);
  }

  private shuffle(array: any[]) {
    let currentIndex = array.length;
    let temporaryValue: number;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  private pad(num, size) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  public async selectAvatar(avatar) {
    await this.modalController.dismiss(avatar);
  }

  public ngOnDestroy() {
    //
  }

}
