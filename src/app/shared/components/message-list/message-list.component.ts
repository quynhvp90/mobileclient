import { Component, OnDestroy, OnInit, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { BroadcastService, MessageService, UserService } from '../../../shared/services';

const jsFilename = 'message-list: ';
@Component({
  selector: 'message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MessageListComponent implements OnInit, OnDestroy {
  @Input() public userIds: string[];
  @Input() public showInfiniteScroll = true;
  @Input() public allowEngagement = false;
  @Input() public limit = 30;
  @Input() public mode = 'messages';
  @Output() newMessage = new EventEmitter<any>();

  private subscriptions = [];
  public addYourOwnText = 'Add your own message...';
  public noMessagesFoundText = 'No messages found';

  constructor(
    private broadcastService: BroadcastService,
    public messageService: MessageService,
    public userService: UserService,
  ) {
  }

  public ngOnInit() {
    // get message data
    const msgHdr = jsFilename + 'ngOnInit: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        this.getData({
          showLoading: true,
        });
      } else if (msg.name === 'reload-message-list') {
        this.getData({
          showLoading: true,
        });
      }
    });
    this.subscriptions.push(subscription);

    if (this.mode === 'features') {
      this.addYourOwnText = 'Add your own feature suggestion...';
      this.noMessagesFoundText = 'No suggestions found';
    }
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
    this.messageService.filter.skip += this.messageService.filterSkip;
    this.getData({
      showLoading: false,
    });
  }

  public getData(options: {
    showLoading?: boolean,
    isReload?: boolean,
  }) {
    const msgHdr = jsFilename + 'getData: ';
    // userIds
    options.isReload = true;
    this.messageService.filter.limit = this.limit;
    this.messageService.getData(options);
  }

  public sendMessage() {
    const $this = this;
    $this.newMessage.emit();
  }
}
