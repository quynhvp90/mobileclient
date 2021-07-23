import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, GlobalService, SettingsService, UserService } from '../../services';
import { Storage } from '@ionic/storage';
import { ModalController, NavController } from '@ionic/angular';
import { IActivityLogDocument } from '../../models/activity-log/activity-log.interface';
import { EmoteDetailModal } from '../../modal/emote-detail/emote-detail-modal';
import { IMessageDocument, IMessageSocial } from '../../models/message.interface';

const jsFilename = 'emote-stats: ';

@Component({
  selector: 'emote-stats',
  templateUrl: './emote-stats.component.html',
  styleUrls: ['./emote-stats.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmoteStatsComponent implements OnInit, OnDestroy {
  @Input() public foundActivityLog: IActivityLogDocument;
  @Input() public foundMessage: IMessageDocument;

  public showLike = false;
  public showLove = false;
  public showWow = false;
  public showHaha = false;
  public extraCount =  0;

  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'social-emotes') {
        if (msg.message && msg.message.action === 'update') {
          if (msg.message.foundActivityLog && $this.foundActivityLog && msg.message.foundActivityLog._id === $this.foundActivityLog._id) {
            this.updateEmoteList();
          } else if (msg.message.foundMessage && $this.foundMessage && msg.message.foundMessage._id === $this.foundMessage._id) {
            this.updateEmoteList();
          }
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    this.updateEmoteList();
  }

  public ngOnDestroy() {
    const $this = this;

    $this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private updateEmoteList() {
    const $this = this;
    const msgHdr = jsFilename + 'updateEmoteList: ';

    $this.showLike = false;
    $this.showLove = false;
    $this.showWow = false;
    $this.showHaha = false;

    $this.updateEmoteListActivityLog();
    $this.updateEmoteListMessage();
  }

  private updateEmoteListMessage() {
    const $this = this;
    const msgHdr = jsFilename + 'updateEmoteListMessage: ';

    let likeCount = 0;
    let loveCount = 0;
    let wowCount = 0;
    let hahaCount = 0;

    if ($this.foundMessage && $this.foundMessage.social) {
      $this.foundMessage.social.forEach((item) => {
        if (item.emote === 'like') {
          likeCount += 1;
          $this.showLike = true;
        } else if (item.emote === 'love') {
          loveCount += 1;
          $this.showLove = true;
        } else if (item.emote === 'wow') {
          wowCount += 1;
          $this.showWow = true;
        } else if (item.emote === 'haha') {
          hahaCount += 1;
          $this.showHaha = true;
        }
      });

      $this.extraCount = likeCount + loveCount + wowCount + hahaCount;
    }
  }

  private updateEmoteListActivityLog() {
    const $this = this;

    let likeCount = 0;
    let loveCount = 0;
    let wowCount = 0;
    let hahaCount = 0;

    if ($this.foundActivityLog && $this.foundActivityLog.social) {
      $this.foundActivityLog.social.forEach((item) => {
        if (item.emote === 'like') {
          likeCount += 1;
          $this.showLike = true;
        } else if (item.emote === 'love') {
          loveCount += 1;
          $this.showLove = true;
        } else if (item.emote === 'wow') {
          wowCount += 1;
          $this.showWow = true;
        } else if (item.emote === 'haha') {
          hahaCount += 1;
          $this.showHaha = true;
        }
      });

      $this.extraCount = likeCount + loveCount + wowCount + hahaCount;
    }
  }

  public showEmoteDetail($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();

    const emoteItems: IMessageSocial[] = [];

    if (this.foundActivityLog) {
      this.foundActivityLog.social.forEach((social) => {
        emoteItems.push(social);
      });
    } else if (this.foundMessage) {
      this.foundMessage.social.forEach((social) => {
        if (social.emote && social.emote.length > 0) {
          emoteItems.push(social);
        }
      });
    }

    this.modalController.create({
      component: EmoteDetailModal,
      componentProps: {
        emoteItems: emoteItems,
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
      });
    });
  }

}
