import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, ModalController, PopoverController } from '@ionic/angular';
import { AddFriendModal } from '../../shared/modal/add-friend/add-friend-modal';
import { IActivityLogDocument } from '../../shared/models/activity-log/activity-log.interface';
import { ActivityLogService, BroadcastService, ContactService, UserService, GlobalService, SocialService } from '../../shared/services';
import { FriendsModal } from '../../shared/modal/friends/friends-modal';
import { IUserDocument } from 'src/app/shared/models/user/user.interface';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { InviteService } from 'src/app/shared/services/invite.service';
const jsFilename = 'socialComponent: ';
@Component({
  selector: 'social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SocialComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public loading = false;
  public socialToggle = 'public';
  public foundUser: IUserDocument = null;

  public listActivityLogs: IActivityLogDocument[] = [];
  constructor(
    private storage: Storage,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private contactService: ContactService,
    private modalController: ModalController,
    private globalService: GlobalService,
    private userService: UserService,
    private inviteService: InviteService,
    private socialService: SocialService,
    private popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private activatedRoute: ActivatedRoute,
  ) {
    const $this = this;
    this.foundUser = this.userService.user;
  }

  public ionViewWillEnter() {
    // reset when change tab
    const scrollContent = document.getElementById('listScroll');
    if (scrollContent) {
      scrollContent.scrollTop = 0;
    }
    this.storage.get('social-toggle').then((socialToggle) => {
      if (socialToggle === 'public' || socialToggle === 'friends') {
        this.socialToggle = socialToggle;
      } else {
        this.socialToggle = 'public';
      }
    });
  }

  public ionViewDidEnter() {
    const $this = this;
    const msgHdr = jsFilename + 'ionViewDidEnter: ';
    console.info(msgHdr + 'ionViewDidEnter');
    $this.socialService.reset();
  }

  public ngOnInit() {
    const $this = this;
    const subscription = this.activatedRoute.queryParams.subscribe((params) => {
      if (params.invite) {
        $this.showFriends();
      }
    });
    this.subscriptions.push(subscription);

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public doRefresh(event) {
    const $this = this;
    $this.socialService.reset();
    setTimeout(() => {
      event.target.complete();
    }, 250);
  }

  public friendToggleChange($event) {
    const $this = this;
    this.storage.set('social-toggle', $this.socialToggle);
    // if ($this.socialToggle === 'friends') {
    //   $this.socialService.filter.where.isFriendFeed = true;
    // } else {
    //   delete $this.socialService.filter.where.isFriendFeed;
    //   $this.socialService.reset();
    // }
  }

  public async showFriends() {
    const $this = this;

    const modal = await $this.modalController.create({
      component: FriendsModal,
      // componentProps: {
      //   user: propsData,
      // },
    });
    await modal.present();
  }

  public async invite() {
    this.inviteService.showActionsheet();
  }
}
