import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, ToastService, IonicAlertService } from '../../../shared/services';
import { IUserDocument } from '../../models/user/user.interface';
import { ListAvatarModal } from '../../modal/list-avatar/list-avatar-modal';

const jsFilename = 'user-setting: ';

@Component({
  selector: 'user-setting',
  templateUrl: './user-setting.component.html',
  styleUrls: ['./user-setting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UserSettingComponent implements OnDestroy, OnInit {
  private defaultPublicName = 'Someone';
  private defaultAvatar = '000';
  private subscriptions = [];

  public user: IUserDocument;

  constructor(
    private broadcastService: BroadcastService,
    private userService: UserService,
    private modalController: ModalController,
    private toastService: ToastService,
  ) {
    const $this = this;
    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        $this.user = this.userService.user;
        this.initData();
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit() {
    this.initData();
  }

  private initData() {
    this.user = this.userService.user;
    if (!this.user.avatar) {
      this.user.avatar = this.defaultAvatar;
    }
    if (!this.user.publicName) {
      this.user.publicName = this.defaultPublicName;
    }
  }

  public save(changeAvatar?: boolean) {
    const $this = this;
    // update user information
    const subscription = this.userService.updateUser(this.user).subscribe((result) => {
      if (result) {
        setTimeout(() => {
          $this.initData();
          if (changeAvatar) {
            this.broadcastService.broadcast('avatar-updated');
          }
          this.toastService.activate('User profile updated', 'success');
          // this.broadcastService.broadcast('reload-data');
        }, 10);
      }
    });
    this.subscriptions.push(subscription);
  }

  public async changeAvatar() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: ListAvatarModal,
        componentProps: {
          mode: 'avatars',
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
       // console.log('avatar result:', detail.data);
        this.user.avatar = detail.data;
        $this.save(true);

      }
    });
    await modal.present();
  }

  // public fakeSave() {
  //   this.ionicAlertService.presentAlert('Your settings have been saved');
  // }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
