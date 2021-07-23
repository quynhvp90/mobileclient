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
  templateUrl: './export-data-modal.html',
  styleUrls: ['./export-data-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ExportDataModal implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundUser: IUserDocument = null;
  public format = 'xlsx';

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
    $this.foundUser = this.userService.user;

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

  public ionViewWillEnter() {
    const $this = this;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public cancel() {
    this.modalController.dismiss('close');
  }

  public open() {
    const $this = this;
    const link = 'https://app.logreps.com/api/v1/reports/export?id=' + $this.foundUser.publicId + '&format=' + $this.format;
    window.open(link);
  }

  public share() {
    const $this = this;
    const link = 'https://app.logreps.com/api/v1/reports/export?id=' + $this.foundUser.publicId + '&format=' + $this.format;

    this.shareService.showSharePopup({
      text: 'Link to LogReps export data',
      url: link,
      dialogTitle: link,
      clipboardValue: link,
      clipboardConfirmText: 'The link has been copied to your clipboard',
      clipboardHeader: 'Copy this link, and send it to your computer via email',
    });
  }

}
