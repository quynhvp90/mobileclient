import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, HealthService, ToastService, IonicAlertService, GlobalService, PushNotificationService } from '../../services';
import { IUserDocument, INotificationSettings, IUserReminders } from '../../models/user/user.interface';
const jsFilename = 'notifications: ';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class NotificationsComponent implements OnDestroy, OnInit {
  private subscriptions = [];
  public foundUser: IUserDocument;
  public appleHealthKitEnabled = false;
  public googleFitEnabled = false;
  public notificationSettings: INotificationSettings;
  public reminderSettings: IUserReminders;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    public globalService: GlobalService,
    private pushNotificationService: PushNotificationService,
  ) {
    // const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    //   if (msg.name === 'login') {
    //     $this.user = this.userService.user;
    //     this.initData();
    //   }
    // });
    // this.subscriptions.push(subscription);
  }

  public ngOnInit() {
    this.initData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private initData() {
    this.foundUser = this.userService.user;
    this.notificationSettings = this.foundUser.notifications;
    this.reminderSettings = this.foundUser.reminders;
  }

  public saveAndClose() {

    const subscription = this.userService.updateUser({
      _id: this.foundUser._id,
      notifications: this.notificationSettings,
      reminders: this.reminderSettings,
    }).subscribe((result) => {
      if (result) {
        this.userService.user.notifications = this.notificationSettings;
        this.userService.user.reminders = this.reminderSettings;
        // setTimeout(() => {
        //   $this.initData();
        //   this.toastService.activate('User profile updated', 'success');
        //   // this.broadcastService.broadcast('reload-data');
        // }, 10);
      }
      this.modalController.dismiss();
    });
    this.subscriptions.push(subscription);
  }

  public registerPush() {
    const $this = this;
    $this.pushNotificationService.requestToken();
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
