import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { BroadcastService, ChatroomService, IonicAlertService, MessageService, UserService } from '../../../shared/services';
import { EmotePopover } from 'src/app/shared/popover/emote/emote-popover';
import { IMessageDocument, IMessageSocial } from '../../models/message.interface';
import { ModalController, PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { CreatePostModal } from '../../modal/create-post/create-post-modal';
import { DomSanitizer } from '@angular/platform-browser';
import anchorme from 'anchorme';

const jsFilename = 'message-item: ';

@Component({
  selector: 'message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MessageItemComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  @Input() public foundMessage: IMessageDocument;
  @Input() public allowEngagement = false;

  public hasEmotes = false;
  public comments: IMessageSocial[] = [];
  public body = '';

  constructor(
    private messageService: MessageService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private sanitizer: DomSanitizer,
  ) {
  }

  public ngOnInit() {
    // get message data
    // this.getData();
    if (!this.foundMessage.message) {
      this.foundMessage.message = {
        data: {},
      };
    }
    if (!this.foundMessage.message.data) {
      this.foundMessage.message.data = {};
    }

    const subscription = this.broadcastService.subjectUniversal.subscribe(() => {
      // if (msg.name === 'reload-data') {
      //   this.getData();
      // }
    });
    this.subscriptions.push(subscription);

    this.initData();
  }

  public initData() {
    const $this = this;

    if (!this.foundMessage.lookups) {
      this.foundMessage.lookups = {};
    }

    if (this.foundMessage.lookups && this.foundMessage.lookups.fromUser) {
      if (this.foundMessage.lookups.fromUser.publicName) {
        this.foundMessage.lookups.fromUser.publicName = this.foundMessage.lookups.fromUser.publicName.substr(0, 25);
      }
    }
    if (this.foundMessage.created) {
      this.foundMessage.lookups.created = moment(this.foundMessage.created).fromNow();
    }

    $this.comments = [];
    $this.hasEmotes = false;
    if ($this.foundMessage && $this.foundMessage.social) {
      $this.foundMessage.social.forEach((item) => {
        if (item.emote) {
          this.hasEmotes = true;
        }
        if (item.comment && item.comment.length > 0) {
          item.comment = anchorme(item.comment);
          item.comment = $this.sanitizer.sanitize(1, item.comment);
          item.lookups = {};
          if (item.date) {
            item.lookups = {
              ago: this.timeSince(new Date(item.date)),
            };
          }
          this.comments.push(item);
        }
      });
    }

    if ($this.foundMessage && $this.foundMessage.message && $this.foundMessage.message.data) {
      $this.body = $this.foundMessage.message.data.body;
      if ($this.body && $this.body.length > 0) {
        $this.body = anchorme($this.body);
        $this.body = $this.sanitizer.sanitize(1, $this.body);
      }
    }

    $this.broadcastService.broadcast('social-emotes', {
      action: 'update',
      foundMessage: $this.foundMessage,
    });
  }

  private timeSince(date: Date) {
    const now = Date.now();
    const seconds = Math.floor((now - date.getTime()) / 1000);

    const HOUR = 3600;
    const DAY = HOUR * 24;
    const WEEK = DAY * 7;

    // let interval = seconds / 31536000;
    // if (interval > 1) {
    //   return Math.floor(interval) + ' years';
    // }
    // interval = seconds / 2592000;
    // if (interval > 1) {
    //   return Math.floor(interval) + ' months';
    // }

    let interval = seconds / WEEK;
    if (interval > 1) {
      return Math.floor(interval) + 'w';
    }

    interval = seconds / DAY;
    if (interval > 1) {
      return Math.floor(interval) + 'd';
    }
    interval = seconds / HOUR;
    if (interval > 1) {
      return Math.floor(interval) + 'h';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + 'm';
    }
    return '1m';
    // return Math.floor(seconds) + 's';
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public message() {
    // this.socialChatService.openChat({
    //   userIds: [this.foundMessage.fromUserId],
    // });
    return;
  }

  public async emote(evt: Event) {
    const $this = this;

    const popover = await this.popoverController.create({
      component: EmotePopover,
      componentProps: {
        showChat: false,
      },
      event: evt,
      translucent: false,
      cssClass: 'emote-popover-220',
    });

    popover.onDidDismiss().then((val) => {
      if (!val || !val.data) {
        return;
      }
      const emote = val.data;

      if (emote === 'chat') {
        // this.socialChatService.openChat({
        //   userIds: [this.foundMessage.fromUserId],
        // });
        return;
      }

      let isDelete = false;
      let existingItem = null;
      let existingItemIndex = -1;
      let index = -1;
      if ($this.foundMessage.social) {
        $this.foundMessage.social.forEach((item) => {
          index += 1;
          if (item.userId === $this.userService.user._id) {
            if (item.emote === emote) {
              existingItem = item;
              existingItemIndex = index;
              isDelete = true;
            }
          }
        });
      }

      if (isDelete) {
        $this.messageService.deleteSocial($this.foundMessage, existingItem._id)
        .subscribe(() => {
          $this.foundMessage.social.splice(existingItemIndex, 1);
          $this.initData();
        });
        return;
      }

      $this.messageService.postSocial($this.foundMessage, {
        emote: emote,
      })
      .subscribe((newSocial) => {
        if (existingItem) {
          existingItem.emote = emote;
        } else {
          if (!$this.foundMessage.social) {
            $this.foundMessage.social = [];
          }
          $this.foundMessage.social.push(newSocial);
        }
        $this.initData();
      });

    });
    return popover.present();
  }

  public sendComment() {
    const $this = this;

    this.modalController.create({
      component: CreatePostModal,
      componentProps: {
        mode: 'comment',
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data && detail.data.message && detail.data.message.length > 0) {
          const message = detail.data.message;

          $this.messageService.postSocial($this.foundMessage, {
            comment: message,
          })
          .subscribe((newSocial) => {
            $this.foundMessage.social.push(newSocial);
            $this.initData();
          });
        }
      });
    });
  }
}
