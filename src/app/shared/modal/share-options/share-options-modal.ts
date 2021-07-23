import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { IActivityDocument } from '../../models/activity/activity.interface';
import { IUserDocument } from '../../models/user/user.interface';
import { PostService } from '../../services/post.service';
import { PostcardService } from '../../services/postcard.service';
import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

const jsFilename = 'ShareOptionsModal';
const WEBSERVER = 'https://logreps.com';

import * as moment from 'moment';
import { UserService } from '../../services';
import { IPostDocument, IPost } from '../../models/post/post.interface';
import { SelectImageModal } from 'src/app/shared/modal/select-image/select-image-modal';

moment.locale('en3', {
  calendar: {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: 'dddd, MMM Do, YYYY',
    nextWeek: 'dddd, MMM Do, YYYY',
    sameElse: 'dddd, MMM Do, YYYY',
  },
});

moment.locale('en4', {
  calendar: {
    lastDay: '[Yesterday]',
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastWeek: 'MMM Do, YYYY',
    nextWeek: 'MMM Do, YYYY',
    sameElse: 'MMM Do, YYYY',
  },
});

@Component({
  selector: 'share-options-modal',
  templateUrl: './share-options-modal.html',
  styleUrls: ['./share-options-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ShareOptionsModal implements OnDestroy, OnInit {
  public images: string[] = [];
  public title: string = null;
  public foundActivities: IActivityDocument[];
  public shareType: string = 'workout'; // challenge-user

  public running = false;
  public thumbnailGenerated = null;
  public createdPost: IPostDocument;
  public backgroundThumbnail = null;
  public mode = 'step1';

  constructor(
    private modalController: ModalController,
    private postService: PostService,
    private postcardService: PostcardService,
    private userService: UserService,
  ) {
    const $this = this;
    for (let i = 1; i <= 19; i += 1) {
      $this.images.push('https://logreps-public.s3.amazonaws.com/images/backgrounds/20201111/thumbnail/' + i + '.png');
      $this.backgroundThumbnail = $this.images[0];
    }
  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
  }

  public async changeBanner() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: SelectImageModal,
        componentProps: {
          images: $this.images,
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        $this.backgroundThumbnail = detail.data;
      }
    });
    await modal.present();
  }

  public generateThumbnail() {
    const $this = this;
    const data = [];

    const background = $this.backgroundThumbnail.replace('/thumbnail/', '/');

    let totalComplete = 0;
    let completePercent = 0;

    this.running = true;
    this.mode = 'step2';

    $this.foundActivities.forEach((foundActivity) => {
      data.push({
        label: foundActivity.label,
        name: foundActivity.name,
        count: foundActivity.lookup.count,
        goal: foundActivity.goal,
      });
      totalComplete += foundActivity.lookup.count;
      if (foundActivity.goal > 0) {
        let numerator = foundActivity.lookup.count;
        if (numerator > foundActivity.goal) {
          numerator = foundActivity.goal;
        }
        completePercent += (numerator / foundActivity.goal);
      }
    });

    if (completePercent > 0) {
      completePercent = Math.round(100 * (completePercent / $this.foundActivities.length)) / 100;
    }

    if (completePercent >= 1) {
      completePercent = 1;
    }

    $this.postService.postPost({
      postType: $this.shareType, // 'workout', 'challenge-user'
      title: $this.title,
      background: background,
      postData: {
        header: {
          label: 'percent',
          count: totalComplete,
          complete: completePercent,
        },
        activities: data,
      },
    }).subscribe((createdPost) => {
      console.log('createdPost = ', createdPost);

      if (createdPost) {
        $this.createdPost = createdPost;
        if (Share) {
          $this.postService.getThumbnail(createdPost._id).subscribe((thumbnail) => {
            console.log('thumbnail = ', thumbnail);
            this.mode = 'step3';

            if (thumbnail) {
              $this.thumbnailGenerated = thumbnail;
            }
            Share.share({
              // title: 'Join my LogReps challenge at the following link',
              text: 'See my daily workout using LogReps',
              url: WEBSERVER + '/postcards/' + createdPost.publicId,
            }).then((shareDetails) => {
              console.log('success sharing = ', shareDetails);
            }).catch((errSending) => {
              console.error('errSending = ', errSending);
              $this.openShareLink();
            });
          });
        } else {
          $this.openShareLink();
        }
      }
    });
  }

  public openShareLink() {
    window.open(WEBSERVER + '/postcards/' + this.createdPost.publicId);
  }

  public ngOnDestroy() {
    //
  }

}
