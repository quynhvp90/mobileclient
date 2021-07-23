import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AddFriendModal } from '../../shared/modal/add-friend/add-friend-modal';
import { IActivityLogDocument } from '../../shared/models/activity-log/activity-log.interface';
import { ActivityLogService, BroadcastService, ContactService, UserService, GlobalService, IonicAlertService } from '../../shared/services';
import { FriendsModal } from '../../shared/modal/friends/friends-modal';
import { IUserDocument } from 'src/app/shared/models/user/user.interface';
import { ActivatedRoute, Params } from '@angular/router';

interface IInvitingUser {
  avatar: string;
  display: string;
  primaryEmail: string;
  publicName: string;
  userId: string;
}

@Component({
  selector: 'social',
  templateUrl: './social-invitations.component.html',
  styleUrls: ['./social-invitations.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialInvitationsComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  private invitationId: string;
  public loading = true;
  public saving = false;
  public invitationText: string;
  public invitingUser: IInvitingUser;

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private globalService: GlobalService,
    private userService: UserService,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private ionicAlertService: IonicAlertService,
    private navCtrl: NavController,
  ) {
    const $this = this;
  }

  public ngOnInit() {
    const $this = this;
    let subscription = this.route.params.subscribe((params: Params) => {
      this.invitationId = params['id'];
      if (!this.invitationId) {
        return;
      }
      $this.getInvitationDetail();
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public acceptInvitation() {
    this.saving = true;
    const $this = this;
    const newContact: any = {
      toUserId: $this.invitingUser.userId,
      invitationAccepted: true,
    };

    $this.contactService.addContact(newContact).subscribe((createdContact) => {
      this.saving = false;
      if (createdContact) {
        $this.ionicAlertService.presentAlert('You are now connected as friends');
        $this.navCtrl.navigateRoot('/tabs/social');
      }
      // $this.navCtrl.navigateForward(['/tabs/activities']);
      // $this.loader.dismiss();
    });
  }

  public rejectInvitation() {
    this.navCtrl.navigateForward(['/tabs/activities']);
  }

  private getInvitationDetail() {
    const $this = this;
    $this.loading = true;
    this.userService.getInvitation(this.invitationId).subscribe((foundPublicUser: IInvitingUser) => {
      $this.loading = false;
      if (!foundPublicUser) {
        return; // was error
      }
      $this.invitingUser = foundPublicUser;

      $this.invitationText = foundPublicUser.display + ' has invited you to be a friend';

    });
  }
}
