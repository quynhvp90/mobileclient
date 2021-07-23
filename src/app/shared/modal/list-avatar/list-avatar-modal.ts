import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import {
  ActivityService,
} from '../../services';

import { IActivityDocument } from '../../models/activity/activity.interface';

const jsFilename = 'ListActivityIconsModal';

@Component({
  selector: 'list-activity-icons-modal',
  templateUrl: './list-avatar-modal.html',
  styleUrls: ['./list-avatar-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ListAvatarModal implements OnDestroy, OnInit {
  public mode = 'choose'; // 'animals';
  public primarycolor = '#000';
  public secondarycolor = '#ccc';
  public activity: IActivityDocument;
  public avatarImages: {
    image: string;
    label?: string;
  }[];

  public avatarImagesScroll: {
    image: string;
    label?: string;
  }[];

  public searchFilter: string; // not yet used

  constructor(
    private modalController: ModalController,
    private httpClient: HttpClient,
  ) {

  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
    console.log('this.mode = ', this.mode);
    if (this.mode !== 'choose') {
      this.selectMode(this.mode);
    }
  }

  public selectMode(mode: string) {
    console.log('selectMode: this.mode = ', this.mode);
    this.mode = mode;

    let avatarImg = '';
    this.avatarImages = [];
    let max = 75;

    if (this.mode === 'countries') {
      this.getCountries();
      return;
    }

    if (this.mode === 'animals') {
      max = 40;
    } else {
      max = 75;
    }
    for (let i = 1; i <= max; i += 1) {
      avatarImg = this.pad(i, 3);

      if (this.mode === 'animals') {
        this.avatarImages.push({
          image: 'https://logreps-public.s3.amazonaws.com/images/animals/' + avatarImg + '.svg',
        });
      } else {
        this.avatarImages.push({
          image: avatarImg,
        });
      }
    }
    this.avatarImages = this.shuffle(this.avatarImages);
    this.avatarImagesScroll = this.avatarImages.slice(0, 20);
  }

  private getCountries() {
    const $this = this;

    this.httpClient.get('https://logreps-public.s3.amazonaws.com/images/flags/country-circles.json').subscribe((countries: {
      code: string,
      country: string,
    }[]) => {
      this.avatarImages = [];
      countries.sort((a, b) => {
        if (a.country > b.country) {
          return 1;
        } else if (a.country < b.country) {
          return -1;
        }
        return 0;
      });
      countries.forEach((country) => {
        this.avatarImages.push({
          image: 'https://logreps-public.s3.amazonaws.com/images/flags/flags-circles-svg/' + country.code.toLowerCase() + '.svg',
          label: country.country,
        });
      });
      this.avatarImagesScroll = this.avatarImages.slice(0, 50);
    });
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
    await this.modalController.dismiss(avatar.image);
  }

  public loadMore(event) {
    console.log('loadMore');
    if (this.avatarImages.length <= this.avatarImagesScroll.length) {
      event.target.complete();
      return;
    }
    setTimeout(() => {
      event.target.complete();
    }, 1000);

    const startIndex = this.avatarImagesScroll.length;
    const endIndex = startIndex + 50;

    this.avatarImagesScroll = this.avatarImagesScroll.concat(this.avatarImages.slice(startIndex, endIndex));
  }

  public ngOnDestroy() {
    //
  }

}
