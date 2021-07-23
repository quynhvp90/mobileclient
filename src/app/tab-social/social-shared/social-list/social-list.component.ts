import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { BroadcastService, SocialService } from '../../../shared/services';

const jsFilename = 'social-list: ';
@Component({
  selector: 'social-list',
  templateUrl: './social-list.component.html',
  styleUrls: ['./social-list.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialListComponent implements OnInit, OnDestroy {
  @Input() public mode: string = 'public';
  @Input() public userIds: string[];
  @Input() public showInfiniteScroll = true;
  @Input() public limit = 30;

  public loadingMore = false;

  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    public socialService: SocialService,
  ) {
  }

  public ngOnInit() {
    // get social data
    const msgHdr = jsFilename + 'ngOnInit: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        this.getData({
          showLoading: true,
        });
      } else if (msg.name === 'reload-social-list') {
        this.getData({
          showLoading: true,
        });
      }
    });
    this.subscriptions.push(subscription);

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
    this.socialService.filter.skip += this.socialService.filterSkip;
    this.loadingMore = true;
    this.getData({
      showLoading: false,
    }).then(() => {
      this.loadingMore = false;
    });
  }

  public getData(options: {
    showLoading?: boolean,
    isReload?: boolean,
  }) {
    const msgHdr = jsFilename + 'getData: ';
    if (this.mode === 'public') {
      delete this.socialService.filter.where.isFriendFeed;
    } else {
      this.socialService.filter.where.isFriendFeed = true;
    }
    this.socialService.filter.limit = this.limit;
    console.log(msgHdr + 'this.socialService = ', this.socialService);
    return this.socialService.getData(options);
  }
}
