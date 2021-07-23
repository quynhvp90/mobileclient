import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { IActivityLogDocument } from '../../shared/models/activity-log/activity-log.interface';
import { ActivityLogService, BroadcastService, ContactService, UserService, GlobalService, SocialService, NotificationService } from '../../shared/services';
import { IUserDocument } from 'src/app/shared/models/user/user.interface';
import { ActivatedRoute } from '@angular/router';

const jsFilename = 'notificationsComponent: ';
@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class NotificationsComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public loading = false;

  public listActivityLogs: IActivityLogDocument[] = [];
  constructor(
    private userService: UserService,
    public notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  public ionViewWillEnter() {
    // reset when change tab
    const scrollContent = document.getElementById('listScroll');
    if (scrollContent) {
      scrollContent.scrollTop = 0;
    }
  }

  public ionViewDidEnter() {
    const $this = this;
    const msgHdr = jsFilename + 'ionViewDidEnter: ';
    console.info(msgHdr + 'ionViewDidEnter');
    $this.notificationService.reset({
      showLoading: true,
      isReload: true,
    });
    $this.notificationService.userSeenNotifications();
  }

  public ngOnInit() {
    const $this = this;
    const subscription = this.activatedRoute.queryParams.subscribe((params) => {
    });
    this.subscriptions.push(subscription);

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public clearNotifications() {
    this.notificationService.clear();
    this.notificationService.updateNotifications(null, {
      archived: true,
    }).subscribe((res) => {
      console.log('res = ', res);
    });
  }

  public doRefresh(event) {
    const $this = this;
    $this.notificationService.reset({
      showLoading: true,
    });
    setTimeout(() => {
      event.target.complete();
    }, 250);
  }
}
