import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController, PopoverController, IonContent } from '@ionic/angular';
import { ActivityLogService, BroadcastService, ChatroomService, ContactService, DocumentEventService, IFilter, InviteService, UserService } from '../../../shared/services';
import { IUserPublicDetail } from 'src/app/shared/models/user/user.interface';
import { IChatroomDocument } from 'src/app/shared/models/chatroom.interface';
import { IMessageDocument } from 'src/app/shared/models/message.interface';

const jsFilename = 'social-chat: ';
const MESSAGE_POLL_INTERVAL = 2000;
const SHOW_CONSOLE = false;

interface IMessageGroup {
  date: Date;
  groups: {
    class: string;
    userId: string;
    messages: {
      body: string;
      avatar?: string;
      date?: Date;
    }[];
  }[];
}

@Component({
  selector: 'social-chat',
  templateUrl: './social-chat.component.html',
  styleUrls: ['./social-chat.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialChatComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent, { read: IonContent, static: false }) myContent: IonContent;

  public chatroomId: string = null; // for mapping on modal open
  public userIds: string[] = null; // for mapping on modal open

  private subscriptions = [];

  public isLoaded = false;
  public savingMessage = false;
  public loadingMessages = false;
  private lockLoadingNew: Date = null;
  private lockLoadingOld: Date = null;
  private lastScrollReloadDate: Date = new Date(1900, 1);

  public chatUsers: IUserPublicDetail[] = [];
  public chatUser: IUserPublicDetail = null;

  public foundChatroom: IChatroomDocument = null;
  public foundMessages: IMessageDocument[] = [];

  public messageGroups: IMessageGroup[] = [];
  public inputChat = null;

  private allowStartMessageInterval = false;
  private intervalMessages = null;
  private intervalRunningPeriod = null;

  private lastMessageCount = -1;
  private totalMessages = -1;

  private lastScrollPosition = -1;
  private lastScrollPositionOnLoadMore = -1;

  constructor(
    private broadcastService: BroadcastService,
    private userService: UserService,
    private modalController: ModalController,
    private chatroomService: ChatroomService,
    private contactService: ContactService,
    private inviteService: InviteService,
    private documentEventService: DocumentEventService,
  ) {

  }

  public ngOnInit() {
    const $this = this;
    let subscription = this.broadcastService.subjectUniversal.subscribe(() => {
    });
    this.subscriptions.push(subscription);

    subscription = $this.documentEventService.subjectDocumentEvent.subscribe((res) => {
      if (res.action === 'move' || res.action === 'keypress') {
        if (!this.intervalMessages) {
          $this.startGetMessageInterval(MESSAGE_POLL_INTERVAL);
        }
      }
    });
    $this.subscriptions.push(subscription);

    // this.initDemo();

    // const scrollContent = document.getElementById('listScroll');
    // if (scrollContent) {
    //   scrollContent.scrollTop = 0;
    // }
  }

  public ionViewDidEnter() {
    const msgHdr = jsFilename + 'ionViewDidEnter: ';
    if (SHOW_CONSOLE) console.log(msgHdr);
    this.getRoom();
  }

  public onScroll($event) {
    const msgHdr = jsFilename + 'onScroll: ';
    if (SHOW_CONSOLE) console.log('scrolling');
    if (SHOW_CONSOLE) console.log('this.myContent.scrollHeight = ' + document.getElementById('idSocialChatContent').scrollHeight);
    const $this = this;

    const elem = document.getElementById('idSocialChatContent');
    // the ion content has its own associated scrollElement
    (elem as any).getScrollElement().then((scrollElement) => {
      const scrollPosition = $event.detail.scrollTop;
      const totalContentHeight = scrollElement.scrollHeight;
      const viewportHeight = elem.offsetHeight;
      const scrollWindowHeight = (totalContentHeight - viewportHeight);
      if (SHOW_CONSOLE) console.log('scrollWindowHeight = ', scrollWindowHeight);
      const percentage = scrollPosition / scrollWindowHeight;
      this.lastScrollPosition = scrollWindowHeight - scrollPosition;
      if (SHOW_CONSOLE) console.log('percentage = = ' + percentage);
      if (percentage < 0.2) {
        if (SHOW_CONSOLE)  console.log(msgHdr + 'this.lockLoadingOld = ' + this.lockLoadingOld);
        if (this.lockLoadingOld) {
          return;
        }

        const newDate = (new Date()).getTime();
        const diffSinceLastLoad = (newDate - this.lastScrollReloadDate.getTime());
        if (SHOW_CONSOLE) console.log(msgHdr + 'diffSinceLastLoad = ' + diffSinceLastLoad);
        if (diffSinceLastLoad >= 2000) {
          this.lastScrollReloadDate = new Date();
          $this.loadMore();
        }
      }
      if (SHOW_CONSOLE) console.log(msgHdr + 'this.lastScrollPosition = = ', this.lastScrollPosition);
    });

    this.documentEventService.triggerMouseMove();
  }

  public ngOnDestroy() {
    this.allowStartMessageInterval = false;
    this.cancelMessageInterval();

    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public getRoom() {

    const $this = this;

    if (this.chatroomId) {
      $this.chatroomService.getRoom(this.chatroomId).subscribe((res) => {
        $this.foundChatroom = res;
        $this.afterGetRoom();
      });
      return;
    }

    $this.chatroomService.findOrCreateChatroom({
      userIds: $this.userIds,
      chatroomType: 'direct',
    }).subscribe((res) => {
      $this.foundChatroom = res;
      $this.afterGetRoom();
    });
  }

  private afterGetRoom() {
    const $this = this;

    if ($this.foundChatroom && $this.foundChatroom.lookups) {
      $this.chatUsers = $this.foundChatroom.lookups.users;
      if ($this.chatUsers) {
        $this.chatUsers.forEach((chatUser) => {
          if (chatUser.userId !== $this.userService.user._id) {
            $this.chatUser = chatUser;
            if (!this.chatUser.lookups) {
              this.chatUser.lookups = {};
            }
            this.chatUser.lookups.tagLine = this.userService.getTagLine($this.chatUser.lastActivityDetail);
            if (this.contactService.foundContacts) {
              this.contactService.foundContacts.forEach((foundContact) => {
                if (foundContact.userId === chatUser.userId) {
                  chatUser.lookups.contactId = foundContact.lookups.contactId;
                  chatUser.lookups.tagLine = foundContact.lookups.tagLine;
                  chatUser.lookups.isFriend = foundContact.lookups.isFriend;
                }
              });
            }
          }
        });
      }
    }

    if (SHOW_CONSOLE) console.log('$this.chatUsers = ', $this.chatUsers);
    $this.getMessages('old', {
      showLoader: true,
      isReload: true,
      isIntervalCheck: false,
    }).then(() => {
      $this.allowStartMessageInterval = true;
      $this.foundChatroom.lookups.users.forEach((chatUser) => {
        if (chatUser.userId !== $this.userService.user._id) {
          $this.chatUser = chatUser;
        }
      });
      $this.totalMessages = $this.lastMessageCount;
      if (SHOW_CONSOLE) console.log('$this.totalMessages = ', $this.totalMessages);
      $this.startGetMessageInterval(MESSAGE_POLL_INTERVAL);
      this.scrollToBottom(0);
    });
  }

  private getMessages(mode: string, options: {
    showLoader: boolean,
    isReload: boolean,
    isIntervalCheck: boolean;
  }): Promise<void> {
    const $this = this;
    const msgHdr = jsFilename + 'getMessages: ';
    if (SHOW_CONSOLE) console.log(msgHdr);

    // if (!options.isReload && !options.isIntervalCheck) {
    //   if (this.lastMessageCount >= 0 && this.lastMessageCount <= this.foundMessages.length) {
    //     console.log(msgHdr + 'exit early, no more messages');
    //     return Promise.resolve();
    //   }
    // }

    if ($this.loadingMessages) { // already loading
      return Promise.resolve();
    }

    const filter: IFilter = {
      skip: 0,
      where: {},
      sortField: 'created',
      sortOrder: 'desc',
    };

    if (mode === 'new') {
      if (this.lockLoadingNew) {
        return Promise.resolve();
      }
      this.lockLoadingNew = new Date();
      if ($this.foundMessages && $this.foundMessages.length > 0) {
        filter.where.created = {
          $gt: $this.foundMessages[0].created,
        };
      }
    } else {
      if (this.lockLoadingOld) {
        return Promise.resolve();
      }
      this.lockLoadingOld = new Date();

      if ($this.foundMessages && $this.foundMessages.length > 0) {
        filter.where.created = {
          $lt: $this.foundMessages[$this.foundMessages.length - 1].created,
        };
      }
    }

    return new Promise((resolve, reject) => {
      if (options.showLoader) {
        $this.loadingMessages = true;
      }

      $this.chatroomService
      .getMessages($this.foundChatroom._id, filter)
      .subscribe((res) => {
        $this.isLoaded = true;
        if (options.isReload) {
          this.lastMessageCount = 0;
          this.foundMessages = [];
        }

        if (res && res.items && res.items.length > 0) {
          const newFoundMessages = res.items;
          const noDupeNewItems: IMessageDocument[] = [];
          let dupeFound = false;
          newFoundMessages.forEach((newFoundMessage) => {
            this.foundMessages.forEach((foundMessage) => {
              if (foundMessage._id === newFoundMessage._id) {
                dupeFound = true;
              }
            });

            if (!dupeFound) {
              noDupeNewItems.push(newFoundMessage);
            }
          });

          if (noDupeNewItems.length > 0) {
            if (mode === 'new') {
              const tempCopy = this.foundMessages;
              this.foundMessages = noDupeNewItems;
              this.foundMessages = this.foundMessages.concat(tempCopy);
            } else {
              this.foundMessages = this.foundMessages.concat(noDupeNewItems);
            }

            if (options.isReload) {
              this.lastMessageCount = res.items.length;
            }

            if (this.lastMessageCount > this.totalMessages) {
              this.totalMessages = this.lastMessageCount;
            }

            $this.buildMessageGroup();
            if (SHOW_CONSOLE) console.log(msgHdr + 'this.lastScrollPosition = ', this.lastScrollPosition);
            if ($this.lastScrollPosition < 100) {
              $this.scrollToBottom(0);
            }
          }
        }

        if (mode === 'new') {
          this.lockLoadingNew = null;
        } else {
          this.lockLoadingOld = null;
        }

        if (SHOW_CONSOLE) console.log('setting false');
        $this.loadingMessages = false;
        resolve();
      }, (err) => {
        reject(err);
      });
    });
  }

  public invite() {
    this.inviteService.showActionsheet();
  }

  private buildMessageGroup() {
    const $this = this;
    if (SHOW_CONSOLE) console.log('rebuilding group');
    $this.messageGroups = [];
    let lastMessage = new Date(2300, 1);
    const THIRTYMINUTES = 30 * 60 * 1000;
    let newMessageGroup: IMessageGroup = null;
    $this.foundMessages.forEach((foundMessage) => {
      const messageCreated = new Date(foundMessage.created);
      const diff = lastMessage.getTime() - messageCreated.getTime();
      if (diff > THIRTYMINUTES) {
        if (newMessageGroup) {
          $this.messageGroups.push(newMessageGroup);
        }
        newMessageGroup = {
          date: messageCreated,
          groups: [],
        };
        lastMessage = new Date(foundMessage.created);
      }

      if (newMessageGroup.groups.length === 0 || newMessageGroup.groups[newMessageGroup.groups.length - 1].userId !== foundMessage.fromUserId) {
        let htmlClass = 'yours';
        if (foundMessage.fromUserId === $this.userService.user._id) {
          htmlClass = 'mine';
        }

        newMessageGroup.groups.push({
          class: htmlClass,
          userId: foundMessage.fromUserId,
          messages: [],
        });
      }

      let avatar = null;
      if (foundMessage.lookups && foundMessage.lookups.fromUser) {
        avatar = foundMessage.lookups.fromUser.avatar;
      }

      newMessageGroup.groups[newMessageGroup.groups.length - 1].messages.push({
        body: foundMessage.message.data.body,
        avatar: avatar,
        date: foundMessage.created,
      });
    });

    if (newMessageGroup) {
      $this.messageGroups.push(newMessageGroup);
    }
  }

  public sendChat() {
    const $this = this;
    if (!this.inputChat || this.inputChat.length === 0) {
      return;
    }
    $this.savingMessage = true;
    $this.chatroomService.postMessage($this.foundChatroom._id, {
      message: this.inputChat,
    }).subscribe((createdMessaged: IMessageDocument) => {
      $this.savingMessage = false;
      this.foundMessages.unshift(createdMessaged);
      this.totalMessages += 1;
      this.lastMessageCount += 1;
      this.buildMessageGroup();
      this.inputChat = '';
      this.scrollToBottom(100);
    });
  }

  private scrollToBottom(delay: number) {
    if (this.foundMessages.length > 0) {
      if (this.myContent) {
        this.myContent.scrollToBottom(delay);
      } else {
        setTimeout(() => {
          this.scrollToBottom(delay);
        }, 10);
      }
    }
  }

  public backToSocial() {
    this.modalController.dismiss();
  }

  private startGetMessageInterval(intervalTimer: number) {
    const msgHdr = 'startGetMessageInterval: ';
    const $this = this;
    $this.cancelMessageInterval();
    if (SHOW_CONSOLE) console.log(msgHdr);

    const oneMinute = 60 * 1000;

    this.intervalRunningPeriod = intervalTimer;

    if (!this.allowStartMessageInterval) {
      if (SHOW_CONSOLE) console.log(msgHdr + 'allowStartMessageInterval is false');
      return;
    }

    $this.intervalMessages = setInterval(() => {
      const timeSinceLastMouseMove = $this.documentEventService.getTimeSinceLastEvent();
      if (timeSinceLastMouseMove > (5 * oneMinute)) {
        if (SHOW_CONSOLE) console.log('timeSinceLastMouseMove > 5 min, stopping');
        $this.cancelMessageInterval();
        return;
      }
      if (this.intervalRunningPeriod === MESSAGE_POLL_INTERVAL && timeSinceLastMouseMove > (1 * oneMinute)) {
        if (SHOW_CONSOLE) console.log('timeSinceLastMouseMove > 1 min, dropping to 10 sec interval');
        $this.cancelMessageInterval();
        $this.startGetMessageInterval(5 * MESSAGE_POLL_INTERVAL);
        return;
      }
      $this.getMessages('new', {
        showLoader: false,
        isReload: false,
        isIntervalCheck: true,
      });
      if (SHOW_CONSOLE) console.log(msgHdr + timeSinceLastMouseMove + ': delaying ' + intervalTimer);
    }, intervalTimer);
  }

  private cancelMessageInterval() {
    if (this.intervalMessages) {
      clearInterval(this.intervalMessages);
      this.intervalMessages = null;
    }
  }

  public loadMore(infiniteScrollEvent?) {
    const msgHdr = jsFilename + 'loadMore: ';
    if (SHOW_CONSOLE) console.log(msgHdr + 'load more!!!!!!!');
    if (this.loadingMessages) {
      if (SHOW_CONSOLE) console.log(msgHdr + 'skip, currently loading messages');
      if (infiniteScrollEvent) {
        setTimeout(() => {
          infiniteScrollEvent.target.complete();
        }, 100);
      }
      return;
    }
    if (SHOW_CONSOLE) console.log(msgHdr + 'loading open');

    this.lastScrollPositionOnLoadMore = this.lastScrollPosition;
    this.getMessages('old', {
      showLoader: true,
      isReload: false,
      isIntervalCheck: false,
    }).finally(() => {
      if (SHOW_CONSOLE) console.log(msgHdr + 'this.lastScrollPositionOnLoadMore = ', this.lastScrollPositionOnLoadMore);
      if (this.lastScrollPositionOnLoadMore > 0) {
        setTimeout(() => {
          const elem = document.getElementById('idSocialChatContent');
          // the ion content has its own associated scrollElement
          (elem as any).getScrollElement().then((scrollElement) => {
            const totalContentHeight = scrollElement.scrollHeight;
            const viewportHeight = elem.offsetHeight;
            const scrollWindowHeight = (totalContentHeight - viewportHeight);
            const scrollTo = scrollWindowHeight - this.lastScrollPositionOnLoadMore;
            if (SHOW_CONSOLE) console.log(msgHdr + 'scrollWindowHeight = ', scrollWindowHeight);
            if (SHOW_CONSOLE) console.log(msgHdr + 'scrollTo = ', scrollTo);
            this.myContent.scrollToPoint(0, scrollTo);
          });
        });
      }
      if (infiniteScrollEvent) {
        setTimeout(() => {
          infiniteScrollEvent.target.complete();
        }, 100);
      }
    });
  }
}
