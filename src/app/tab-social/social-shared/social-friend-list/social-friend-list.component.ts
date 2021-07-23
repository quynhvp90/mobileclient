import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { BroadcastService, ContactService, InviteService, ShareService, SocialService, UserService } from '../../../shared/services';
import { ModalController } from '@ionic/angular';
import { SocialChatComponent } from '../social-chat/social-chat.component';

import { AddFriendModal } from 'src/app/shared/modal/add-friend/add-friend-modal';
import { IUserPublicDetail } from 'src/app/shared/models/user/user.interface';
import { SocialChatService } from '../social-chat/social-chat.service';

const jsFilename = 'social-friend-list: ';
@Component({
  selector: 'social-friend-list',
  templateUrl: './social-friend-list.component.html',
  styleUrls: ['./social-friend-list.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialFriendListComponent implements OnInit, OnDestroy {
  @Input() public showInfiniteScroll = true;

  private subscriptions = [];
  public showFullFriendList = false;

  constructor(
    private broadcastService: BroadcastService,
    public socialService: SocialService,
    private modalController: ModalController,
    public userService: UserService,
    public shareService: ShareService,
    private inviteService: InviteService,
    private socialChatService: SocialChatService,
    public contactService: ContactService,
  ) {
    // this.socialService.clear();
  }

  public ngOnInit() {
    // get social data
    const msgHdr = jsFilename + 'ngOnInit: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        this.getData({
          showLoading: true,
          isReload: true,
        });
      } else if (msg.name === 'reload-social-friend-list') {
        this.getData({
          showLoading: true,
          isReload: true,
        });
      }
    });
    this.subscriptions.push(subscription);

    console.log(msgHdr + 'calling from init');
    this.getData({
      showLoading: true,
      isReload: true,
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public loadMore(infiniteScrollEvent) {
    infiniteScrollEvent.target.complete();
    this.loadMoreButton();
  }

  public loadMoreButton() {
    if (this.contactService.totalCount > -1 && this.contactService.totalCount <= this.contactService.foundContacts.length) {
      return;
    }

    this.contactService.filter.skip += this.contactService.filterSkip;
    this.getData({
      isReload: false,
      showLoading: true,
    });
  }

  public getData(options: {
    showLoading: boolean,
    isReload: boolean,
  }) {
    const msgHdr = jsFilename + 'getData: ';

    this.contactService.getData(options);
  }

  public async openChat(foundContact: IUserPublicDetail) {
    const $this = this;
    this.socialChatService.openChat({
      userIds: [foundContact.userId],
    });
  }

  public invite() {
    this.inviteService.showActionsheet();
  }
}
