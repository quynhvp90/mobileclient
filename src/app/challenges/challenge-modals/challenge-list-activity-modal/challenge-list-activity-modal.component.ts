import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { IChallengeDocument, IChallengeUser, IChallengeUserHydrated, IChallengeDocumentHydrated } from '../../../shared/models/challenge/challenge.interface';
import { ActivityLogService, ActivityService, BroadcastService, UserService,
  PostService, ContactService, IonicAlertService, ShareService, ChallengeService } from '../../../shared/services';
import { IonItemSliding, NavParams, MenuController, LoadingController, NavController, ModalController } from '@ionic/angular';
import { ActivityLogModal } from 'src/app/tab-activity/activity-shared/activity-log/activity-log.modal';

const jsFilename = 'list-activity: ';

import { ShareOptionsModal } from 'src/app/shared/modal/share-options/share-options-modal';

@Component({
  selector: 'challenge-list-activity-modal',
  templateUrl: './challenge-list-activity-modal.component.html',
  styleUrls: ['./challenge-list-activity-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeListActivityModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public challengeUserHydrated: IChallengeUserHydrated;

  private loader: HTMLIonLoadingElement = null;

  public foundChallenge: IChallengeDocumentHydrated = null;
  public primarycolor = '#FF6A01';
  public secondarycolor = '#FF8E3D';

  private subscriptions = [];
  public isLoggedInUser = false;
  public loading = false;

  public sendingInvitation = false;

  public showSendInviteButton = false;
  public showAcceptInviteButton = false;

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    private userService: UserService,
    private storage: Storage,
    private navParams: NavParams,
    private contactService: ContactService,
    private modalController: ModalController,
    private ionicAlertService: IonicAlertService,
    private loadingController: LoadingController,
    private challengeService: ChallengeService,
    private shareService: ShareService,
    private postService: PostService,
  ) {
    const $this = this;
  }

  ionViewWillEnter() {
    // this.activities = this.navParams.get('activities');
    // this.userChallenge = this.navParams.get('userChallenge');
    const $this = this;
    console.log('challengeUserHydrated = ', $this.challengeUserHydrated);
    if ($this.challengeUserHydrated.userId === $this.userService.user._id) {
      $this.isLoggedInUser = true;
    }
    console.log('$this.isLoggedInUser = ', $this.isLoggedInUser);
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }

  public ngOnInit(): void {
    const $this = this;

    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });

    $this.getData();
    $this.updateInviteUI();
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public getData() {
    const msgHdr = 'getData: ';
    const $this = this;

    if ($this.challengeUserHydrated.activities && $this.challengeUserHydrated.activities.length > 0) {
      return;
    }

    $this.loading = true;

    $this.challengeService.getUsers($this.foundChallenge._id, {
      skip: 0,
      limit: 1,
      where: {
        userId: $this.challengeUserHydrated.userId,
      },
    }).subscribe((res) => {
      $this.loading = false;
      if (res && res.items && res.items.length > 0) {
        $this.challengeUserHydrated = res.items[0];
      }
    });
  }

  async createActivityLog(slidingActivities: IonItemSliding, activity: IActivityDocument) {
    const $this = this;
    await slidingActivities.close();

    $this.loader.present();
    const logDate = new Date();

    const subscription = $this.activityLogService.postActivityLog(activity, activity.lastLogCount, logDate).subscribe((activityLog) => {
      $this.loader.dismiss();
      activity.lookup.count += activity.lastLogCount;

      $this.storage.set('quickAdd', 'true');

      $this.broadcastService.broadcast('activity-log-update', {
        action: 'add',
        activityLog: activityLog,
        name: 'activity-log-update',
        activityId: activity._id,
        count: activity.lastLogCount,
      });
    });
    this.subscriptions.push(subscription);
  }

  async viewDetail(slidingActivities: IonItemSliding , activity: IActivityDocument) {
    const $this = this;
    await slidingActivities.close();
    // $this.navCtrl.navigateForward('/tabs/activities/detail/' + activity._id.toString());

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityLogModal,
      componentProps: {
        foundActivity: activity,
      },
    });
    modal.onDidDismiss().then((detail) => {
      console.log('detail = ', detail);
      if (detail !== null && detail.data !== 'close') {
        // add Friend
      }
    });
    await modal.present();
  }

  public updateInviteUI() {
    const $this = this;
    const contactStatus = $this.challengeUserHydrated.contactStatus;

    $this.showSendInviteButton = false;
    $this.showAcceptInviteButton = false;

    const inviteLabels = [
      'not a friend',
      'they denied this friend request',
    ];

    const acceptLabels = [
      'you have been invited',
      'you denied this friend request',
    ];

    const ignoreLabels = [
      'you',
      'is a friend',
      'you invited them',
    ];

    if (inviteLabels.indexOf(contactStatus) >= 0) {
      $this.showSendInviteButton = true;
    }
    if (acceptLabels.indexOf(contactStatus) >= 0) {
      $this.showAcceptInviteButton = true;
    }

  }

  public sendAccept() {
    this.sendInvitation(true);
  }

  public shareProgress(mode: string) {
    const $this = this;
    // const link = 'https://logreps.com/challenges/' + this.foundChallenge.publicId + '/users/' + $this.challengeUserHydrated.userId;
    // if (mode === 'twitter') {
    //   window.open('https://twitter.com/intent/tweet?url=' + link);
    // } else if (mode === 'facebook') {
    //   window.open('https://www.facebook.com/sharer.php?u=' + link);
    // } else {
    //   this.shareService.showSharePopup({
    //     text: 'See my progress for the ' + $this.foundChallenge.name + ' challenge',
    //     url: link,
    //     dialogTitle: link,
    //     clipboardValue: link,
    //     clipboardConfirmText: 'The link has been copied to your clipboard',
    //   });
    // }

    let label = $this.userService.user.publicName;
    if (label === 'Somone') {
      label = 'My';
    } else {
      label += '\'s';
    }
    const title = label + ' challenge update';

    this.modalController.create({
      component: ShareOptionsModal,
      componentProps: {
        foundActivities: $this.challengeUserHydrated.activities,
        title: title,
      },
    }).then((modal) => {
      modal.present();
    });
  }

  public sendInvitation(isAccept: boolean) {
    this.sendingInvitation = true;
    const $this = this;

    if ($this.challengeUserHydrated.userId === $this.userService.user._id) {
      $this.ionicAlertService.presentAlert('You cannot invite yourself as a friend');
      return;
    }
    const newContact: any = {
      toUserId: $this.challengeUserHydrated.userId,
      invitationAccepted: false,
    };

    $this.contactService.addContact(newContact).subscribe((createdContact) => {
      this.sendingInvitation = false;
      console.log('createdContact = ', createdContact);
      if (createdContact) {
        if (isAccept) {
          $this.ionicAlertService.presentAlert('You are now connected as friends');
          $this.challengeUserHydrated.contactStatus = 'is a friend';
        } else {
          $this.ionicAlertService.presentAlert('Your friend request has been sent');
          $this.challengeUserHydrated.contactStatus = 'you invited them';
        }
      }
      $this.updateInviteUI();

      // $this.navCtrl.navigateForward(['/tabs/activities']);
      // $this.loader.dismiss();
    });
  }
}
