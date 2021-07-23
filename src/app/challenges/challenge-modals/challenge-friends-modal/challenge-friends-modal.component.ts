import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IChallengeDocumentHydrated, IChallengeUserHydrated } from 'src/app/shared/models/challenge/challenge.interface';
import { ChallengeService } from 'src/app/shared/services';
import { ChallengeListActivityModalComponent } from '../challenge-list-activity-modal/challenge-list-activity-modal.component';

@Component({
  selector: 'challge-friends-modal',
  templateUrl: './challenge-friends-modal.component.html',
  styleUrls: ['./challenge-friends-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeFriendsModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocumentHydrated = null;
  public challengeUsers: IChallengeUserHydrated[] = [];

  public loading = true;

  private skip = 0;
  private limit = 10;

  constructor(
    private modalController: ModalController,
    private challengeService: ChallengeService,
  ) {
  }

  public ngOnInit(): void {
    this.challengeUsers = this.foundChallenge.lookups.usersTop;
    this.loading = false;
    this.getData({
      isReload: true,
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewWillEnter() {

  }

  public async dismiss() {
    await this.modalController.dismiss();
  }

  public async viewDetail(challengeUserHydrated: IChallengeUserHydrated) {
    const $this = this;

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeListActivityModalComponent,
        componentProps: {
          challengeUserHydrated: challengeUserHydrated,
          foundChallenge: $this.foundChallenge,
        },
      });
    modal.onDidDismiss().then((detail) => {
      // do nothing just view
    });
    await modal.present();
  }

  public loadMore() {
    this.getData({
      isReload: false,
    });
  }

  private getData(options: {
    isReload: boolean,
  }) {
    const $this = this;
    $this.loading = true;

    if (options.isReload) {
      $this.skip = 0;
    } else {
      $this.skip += $this.limit;
    }

    $this.challengeService.getUsers($this.foundChallenge._id, {
      skip: $this.skip,
      limit: $this.limit,
    }).subscribe((res) => {
      $this.loading = false;
      if (options.isReload) {
        this.challengeUsers = [];
      }

      this.challengeUsers = this.challengeUsers.concat(res.items);
    });
  }
}
