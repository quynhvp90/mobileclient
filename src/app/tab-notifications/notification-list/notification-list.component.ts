import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { INotificationLogDocument } from 'src/app/shared/models/notification-log.interface';
import { BroadcastService, NotificationService } from '../../shared/services';

const jsFilename = 'notification-list: ';
@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class NotificationListComponent implements OnInit, OnDestroy {
  @Input() public showInfiniteScroll = true;

  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    public notificationService: NotificationService,
  ) {
  }

  public ngOnInit() {
    // get notification data
    const msgHdr = jsFilename + 'ngOnInit: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'reload-data') {
        this.getData({
          showLoading: true,
        });
      } else if (msg.name === 'reload-notification-list') {
        this.getData({
          showLoading: true,
        });
      }
    });
    this.subscriptions.push(subscription);

    // this.getData({
    //   isReload: true,
    //   showLoading: true,
    // });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public loadMore(infiniteScrollEvent) {
    // infiniteScrollEvent.target.complete();
    this.loadMoreButton(infiniteScrollEvent);
  }

  public loadMoreButton(infiniteScrollEvent) {
    if (this.notificationService.count <= this.notificationService.foundNotifications.length) {
      infiniteScrollEvent.target.complete();
      return;
    }
    this.notificationService.filter.skip += this.notificationService.skip;
    this.getData({
      showLoading: false,
      isReload: false,
    }, infiniteScrollEvent);
  }

  public getData(options: {
    showLoading?: boolean,
    isReload?: boolean,
  }, infiniteScrollEvent?) {
    const msgHdr = jsFilename + 'getData: ';
    this.notificationService.getData(options).then((res) => {
      if (infiniteScrollEvent) {
        infiniteScrollEvent.target.complete();
      }
    });
  }

  public dismiss(slidingItem: IonItemSliding, foundNotification: INotificationLogDocument, index: number) {
    slidingItem.disabled = true;
    this.notificationService.updateNotifications(foundNotification._id, {
      archived: true,
    }).subscribe((res) => {
      slidingItem.close();
      this.notificationService.foundNotifications.splice(index, 1);
    });
  }
}
