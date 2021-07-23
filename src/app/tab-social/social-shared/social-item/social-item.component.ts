import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { IActivityLogDocument } from '../../../shared/models/activity-log/activity-log.interface';
import { ActivityLogService, BroadcastService, UserService } from '../../../shared/services';
import { EmotePopover } from 'src/app/shared/popover/emote/emote-popover';
import { TooltipPopover } from 'src/app/shared/popover/tooltip/tooltip-popover';
import { SocialChatService } from '../social-chat/social-chat.service';
import { EmoteDetailModal } from 'src/app/shared/modal/emote-detail/emote-detail-modal';

const jsFilename = 'social-item: ';

@Component({
  selector: 'social-item',
  templateUrl: './social-item.component.html',
  styleUrls: ['./social-item.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialItemComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  @Input() public activityLog: IActivityLogDocument;

  constructor(
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private modalController: ModalController,
    private popoverController: PopoverController,
    private socialChatService: SocialChatService,
  ) {
  }

  public ngOnInit() {
    // get social data
    // this.getData();
    const subscription = this.broadcastService.subjectUniversal.subscribe(() => {
      // if (msg.name === 'reload-data') {
      //   this.getData();
      // }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public async emote(evt: Event) {
    const $this = this;
    const msgHdr = jsFilename + 'emote: ';

    const popover = await this.popoverController.create({
      component: EmotePopover,
      event: evt,
      translucent: false,
      cssClass: 'emote-popover-270',
    });

    popover.onDidDismiss().then((val) => {
      if (!val || !val.data) {
        return;
      }
      const emote = val.data;

      if (emote === 'chat') {
        this.socialChatService.openChat({
          userIds: [this.activityLog.userId],
        });
        return;
      }

      let isDelete = false;
      let existingItem = null;
      let existingItemIndex = -1;
      let index = -1;
      if ($this.activityLog.social) {
        $this.activityLog.social.forEach((item) => {
          index += 1;
          if (item.userId === $this.userService.user._id) {
            existingItem = item;
            existingItemIndex = index;
            if (item.emote === emote) {
              isDelete = true;
            }
          }
        });
      }

      if (isDelete) {
        $this.activityLogService.deleteActivityLogSocial($this.activityLog, existingItem._id)
        .subscribe(() => {
          $this.activityLog.social.splice(existingItemIndex, 1);
          $this.broadcastService.broadcast('social-emotes', {
            action: 'update',
            foundActivityLog: $this.activityLog,
          });
        });
        return;
      }

      $this.activityLogService.postActivityLogSocial($this.activityLog, {
        emote: emote,
      })
      .subscribe((newSocial) => {
        if (existingItem) {
          existingItem.emote = emote;
        } else {
          $this.activityLog.social.push(newSocial);
        }
        $this.broadcastService.broadcast('social-emotes', {
          action: 'update',
          foundActivityLog: $this.activityLog,
        });

      });

    });
    return popover.present();
  }
}
