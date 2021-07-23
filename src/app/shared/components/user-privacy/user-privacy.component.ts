import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, ToastService, IonicAlertService, GlobalService, StatsService } from '../../../shared/services';
const jsFilename = 'user-privacy: ';

@Component({
  selector: 'user-privacy',
  templateUrl: './user-privacy.component.html',
  styleUrls: ['./user-privacy.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UserPrivacyComponent implements OnDestroy, OnInit {
  private subscriptions = [];
  public showActivityInPublicFeed = false;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    public globalService: GlobalService,
  ) {
    this.showActivityInPublicFeed = this.userService.user.showActivityInPublicFeed;
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public saveAndClose() {
    const $this = this;

    this.userService.patch({
      action: 'update-privacy',
      showActivityInPublicFeed: this.showActivityInPublicFeed,
    }).subscribe((result) => {
      if (result) {
        $this.userService.user.showActivityInPublicFeed = this.showActivityInPublicFeed;
      }
      this.modalController.dismiss();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
