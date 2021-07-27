import { Component, OnDestroy, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { ActivityLogService, BroadcastService, NotificationService, UserService } from '../../shared/services';
import { INotificationLogDocument } from 'src/app/shared/models/notification-log.interface';
import * as moment from 'moment';
const jsFilename = 'notification-item: ';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class NotificationItemComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  @Input() public notificationLog: INotificationLogDocument;

  public title = '';
  public body = '';
  public createdTimeAgo = '';

  constructor(
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    private notificationService: NotificationService,
    // private socialChatService: SocialChatService,
  ) {
  }

  public ngOnInit() {
    // get notification data
    // this.getData();
    const subscription = this.broadcastService.subjectUniversal.subscribe(() => {
      // if (msg.name === 'reload-data') {
      //   this.getData();
      // }
    });
    this.subscriptions.push(subscription);
    if (this.notificationLog.message) {
      this.title = this.notificationLog.message.title;
      if (this.title && this.title.length > 0) {
        this.title = this.title.replace(/(.*)( just gave you)/, '<b>$1</b> just gave you');
        this.title = this.title.replace(/(.*)( commented)/, '<b>$1</b> commented');
        this.title = this.title.replace(/(New message from )(.*)/, 'New message from <b>$2</b>');
      }
      this.body = this.notificationLog.message.body;
      if (this.body && this.body.length > 0) {
        this.body = this.body.replace(/(.*)( has invited you to the )(.*)( challenge)/, '<b>$1</b> has invited you to the <b>$3</b> challenge');
        this.body = this.body.replace(/(.*)( joined the)/, '<b>$1</b> joined the');
        this.body = this.body.replace(/(.*)( is now leading)/, '<b>$1</b> is now leading');
        this.body = this.body.replace(/^(.*)( is now)/, '<b>$1</b> is now');
        this.body = this.body.replace(/(.*)( commented)/, '<b>$1</b> commented');
        this.body = this.body.replace(/(New message from )(.*)/, 'New message from <b>$2</b>');
        this.body = this.body.replace(/^(From )(.*?):/, 'From <b>$2</b>:');
      }

      if (this.notificationLog.created) {
        this.createdTimeAgo = moment(this.notificationLog.created).fromNow();
      }
      // if (!this.body) {
      //   this.body = this.title;
      //   this.title = null;
      // }
    }

    this.initData();
  }

  public initData() {
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public showDetail() {
    const msgHdr = jsFilename + 'showDetail: ';
    console.log(msgHdr + 'notificationLog = ', this.notificationLog);
    this.notificationLog.lookups.class = 'background-read';

    this.notificationService.updateNotifications(this.notificationLog._id, {
      viewed: true,
    }).subscribe(() => {

    });
    if (this.notificationLog.dbModel === 'chatroom') {
      // this.socialChatService.openChat({
      //   chatroomId: this.notificationLog.dbModelId,
      // });
      return;
    }

    if (this.notificationLog.lookups && this.notificationLog.lookups.navLink) {
      this.navCtrl.navigateForward([this.notificationLog.lookups.navLink]);
    }
  }
}
