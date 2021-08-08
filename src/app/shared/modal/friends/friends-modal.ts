import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IActivityDocument } from '../../models/activity/activity.interface';
import { IWorkoutDocument } from '../../models/workout/workout.interface';
import { ActivityService, ContactService, BroadcastService, IonicAlertService, IUpdatePriority, ToastService, UserService, UtilityService, ShareService } from '../../services';
import { AddFriendModal } from '../add-friend/add-friend-modal';
import { ShowFriendModal } from '../show-friend/show-friend-modal';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { IContactDocument } from '../../models/contact/contact.interface';
import { IUserDocument, IUserPublic } from '../../models/user/user.interface';
const jsFilename = 'workout-edit: ';

@Component({
  templateUrl: './friends-modal.html',
  styleUrls: ['./friends-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class FriendsModal implements OnInit, OnDestroy {
  private subscriptions = [];
  public contacts: IContactDocument[] = [];
  public currentUser: IUserPublic;
  public isEmptyEmail = true;
  public foundUser: IUserDocument = null;

  filter: any = {
  };
  constructor(
    private utilityService: UtilityService,
    private userService: UserService,
    private broadcastService: BroadcastService,
    private route: ActivatedRoute,
    private ionicAlertService: IonicAlertService,
    private contactService: ContactService,
    private toastService: ToastService,
    private router: Router,
    private modalController: ModalController,
    private navCtrl: NavController,
    private shareService: ShareService,
  ) {
    //
  }

  public ngOnInit() {
    const $this = this;
    $this.currentUser = $this.userService.user;
    $this.isEmptyEmail = $this.checkEmptyEmail();
    $this.foundUser = this.userService.user;
    $this.getFriends();

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';
      if (msg.name === 'login') {
        $this.foundUser = this.userService.user;
      }
    });
    this.subscriptions.push(subscription);
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }

  public checkEmptyEmail() {
    if (this.currentUser.email) {
      if (this.utilityService.isValidEmail(this.currentUser.email)) {
        return false;
      }
      return true;
    }
    return true;
  }

  public ionViewWillEnter() {
    const $this = this;
    $this.getFriends();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public cancel() {
    this.modalController.dismiss('close');
  }

  private getFriends() {
    const $this = this;
    const subscription = this.contactService.getConnections(null, this.filter).subscribe((data) => {
      $this.contacts = data;
    });
    this.subscriptions.push(subscription);
  }

  public async showFriend(contact) {
    const $this = this;
    let propsData: any;
    if (contact.fromUserId === $this.currentUser._id) {
      propsData = contact.lookups.toUser;
    } else if (contact.toUserId === $this.currentUser._id) {
      propsData = contact.lookups.fromUser;
    }
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ShowFriendModal,
        componentProps: {
          user: propsData,
        },
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        // add Friend
        const deleteUser = detail.data;
        // delete
        const subscription = this.contactService.deleteContact(contact._id, deleteUser._id).subscribe((success) => {
          if (success) {
            $this.getFriends();
            this.toastService.activate('Successfully removed friend', 'success');
          }
        });
      }
    });
    await modal.present();
  }

  public addViaText() {
    // this.userService.createInvitationLink().subscribe((link) => {
    //   console.log('link = ', link);
    //   if (!link) {
    //     return; // was error;
    //   }

    //   this.shareService.showSharePopup({
    //     text: 'Join me on LogReps, a super easy mobile app to help you get in shape',
    //     url: link,
    //     dialogTitle: link,
    //     clipboardValue: link,
    //     clipboardConfirmText: 'The link has been copied to your clipboard',
    //   });
    // });
  }

  public async addViaEmail() {
    const $this = this;
    const modal: HTMLIonModalElement = await $this.modalController.create({
      component: AddFriendModal,
    });

    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        // add Friend
        const contact = detail.data;
        const subscription = $this.contactService.addContact(contact).subscribe((data) => {
          console.log('added friend', data);
          this.getFriends();
        });
        $this.subscriptions.push(subscription);
      }
    });
    await modal.present();
  }

  public goSettingPage() {
    this.modalController.dismiss('close');
    setTimeout(() => {
      this.navCtrl.navigateForward('/tabs/settings');
    }, 100);
  }

}
