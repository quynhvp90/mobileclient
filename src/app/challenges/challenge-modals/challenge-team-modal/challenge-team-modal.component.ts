import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BroadcastService, IonicAlertService, LoaderService, UserService } from '../../../shared/services';
import { ModalController  } from '@ionic/angular';
import { IChallengeDocument, IChallengeDocumentHydrated, IChallengeTeam, IChallengeUserHydrated } from 'src/app/shared/models/challenge/challenge.interface';
import { ChallengeTeamEditModalService } from '../challenge-team-edit-modal/challenge-team-edit-modal.service';
import { ChallengeTeamApiService } from '../../challenge-services/challenge-team.api.service';
import { ChallengeListActivityModalComponent } from '../challenge-list-activity-modal/challenge-list-activity-modal.component';
import { ActivityEditModalComponent } from 'src/app/tab-activity/activity-modals/activity-edit-modal/activity-edit-modal.component';
import { ActivityLogModal } from 'src/app/tab-activity/activity-shared/activity-log/activity-log.modal';
import { IActivityDocument } from 'src/app/shared/models/activity/activity.interface';

const jsFilename = 'challenge-team-modal: ';

@Component({
  selector: 'challenge-team-modal',
  templateUrl: './challenge-team-modal.component.html',
  styleUrls: ['./challenge-team-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeTeamModalComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocumentHydrated;
  public foundChallengeTeam: IChallengeTeam;

  public loading = false;
  public showJoinTeam = false;
  public showSwitchTeam = false;
  public showLogActivity = false;
  private userAlreadyInTeamId: string = null;

  constructor(
    private broadcastService: BroadcastService,
    private modalController: ModalController,
    private challengeTeamEditModalService: ChallengeTeamEditModalService,
    private userService: UserService,
    private challengeTeamApiService: ChallengeTeamApiService,
    private ionicAlertService: IonicAlertService,
    private loader: LoaderService,
  ) {
    //      console.log(msg);

  }

  public ngOnInit() {
    const $this = this;
    const msgHdr = jsFilename + 'ngOnInit: ';

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'update-challenge') {
        const broadcastChallenge = <IChallengeDocumentHydrated> msg.message;
        if (broadcastChallenge._id === $this.foundChallenge._id) {
          if (broadcastChallenge.teams && broadcastChallenge.teams.roster && broadcastChallenge.teams.roster.length > 0) {
            broadcastChallenge.teams.roster.forEach((broadcastChallengeTeam) => {
              if (broadcastChallengeTeam._id === $this.foundChallengeTeam._id) {
                broadcastChallengeTeam.lookups.activities.forEach((broadcastActivity) => {
                  $this.foundChallengeTeam.lookups.activities.forEach((activity) => {
                    if (activity._id === broadcastActivity._id) {
                      activity.count = broadcastActivity.count;
                    }
                  });
                });
                $this.broadcastService.broadcast('all-activities-updated');
              }
            });
          }
        }
      }
    });
    this.subscriptions.push(subscription);

    console.log(msgHdr + 'foundChallenge = ' + this.foundChallenge);
    this.getData();
  }

  private getData() {
    const msgHdr = jsFilename + 'getData: ';
    const $this = this;
    $this.loading = true;
    $this.challengeTeamApiService
    .getTeam($this.foundChallenge, $this.foundChallengeTeam._id)
    .subscribe((foundChallengeTeam) => {
      console.info(msgHdr + 'foundChallengeTeam = ', foundChallengeTeam);
      $this.foundChallengeTeam = foundChallengeTeam;
      $this.loading = false;

      $this.showJoinTeam = true;
      $this.showSwitchTeam = false;
      $this.showLogActivity = false;

      $this.userAlreadyInTeamId = null;
      if ($this.foundChallenge.teams) {
        if ($this.foundChallenge.teams.roster) {
          $this.foundChallenge.teams.roster.forEach((team) => {
            if (team.users) {
              team.users.forEach((challengeUser) => {
                if (challengeUser.userId === $this.userService.user._id) {
                  if (team._id !== $this.foundChallengeTeam._id) {
                    $this.userAlreadyInTeamId = team._id;
                  }
                }
              });
            }
          });
        }
      }

      if ($this.foundChallengeTeam.users) {
        foundChallengeTeam.users.forEach((challengeUser) => {
          if (challengeUser.userId === $this.userService.user._id) {
            $this.showJoinTeam = false;
          }
        });
      }

      $this.foundChallengeTeam.lookups.users.sort((a, b) => {
        if (a.totalCount < b.totalCount) {
          return 1;
        }
        if (a.totalCount > b.totalCount) {
          return -1;
        }
        return 0;
      });

      let maxComplete = 0;
      $this.foundChallengeTeam.lookups.users.forEach((user, index) => {
        if (index === 0) {
          user.percentComplete = 1;
          maxComplete = user.totalCount;
        } else {
          if (maxComplete > 0) {
            user.percentComplete = user.totalCount / maxComplete;
          }
        }
        console.log(user);
      });

      if ($this.showJoinTeam && $this.userAlreadyInTeamId) {
        $this.showJoinTeam = false;
        $this.showSwitchTeam = true;
      }

      if (!$this.showJoinTeam && !$this.showSwitchTeam) {
        $this.showLogActivity = true;
      }
    });
  }

  async viewActivityDetail(activity: IActivityDocument) {
    const $this = this;

    let foundUserActivity: IActivityDocument = null;
    $this.foundChallenge.lookups.users.forEach((challengeUser) => {
      if (challengeUser.userId === $this.userService.user._id) {
        challengeUser.activities.forEach((userActivity) => {
          if (userActivity.logLabel === activity.logLabel) {
            foundUserActivity = userActivity;
          }
        });
        console.log('challengeUser.activities = ', challengeUser.activities);
      }
    });

    if (!foundUserActivity) {
      $this.ionicAlertService.presentAlert('Sorry - there was a problem.  Try going back to the homepage of the challenge and clicking "Log Activity"');
      return;
    }

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: ActivityLogModal,
      componentProps: {
        foundActivity: foundUserActivity,
      },
    });
    modal.onDidDismiss().then((detail) => {
    });
    await modal.present();
  }

  public ionViewWillEnter() {

  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  public editTeam() {
    let validEdit = false;
    if (this.foundChallengeTeam.ownerUserId === this.userService.user._id) {
      validEdit = true;
    }

    this.foundChallenge.users.forEach((challengeUser) => {
      if (challengeUser.userId === this.userService.user._id) {
        if (challengeUser.role === 'owner') {
          validEdit = true;
        }
      }
    });

    if (!validEdit) {
      this.ionicAlertService.presentAlert('Sorry - only the challenge or team creator can make edits');
      return;
    }
    this.challengeTeamEditModalService.editTeam(this.foundChallenge, this.foundChallengeTeam);
  }

  public switchTeam() {
    const msgHdr = jsFilename + 'switchTeam: ';
    const $this = this;

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to switch teams? All of your reps will be moved to this new team.', (res) => {
      $this.loader.showLoader({
        message: 'Saving...',
      });
      this.challengeTeamApiService.joinTeam(this.foundChallenge, this.foundChallengeTeam).subscribe((res) => {
        // this.modalController.dismiss();
        this.getData();
        $this.challengeTeamApiService
        .getTeam($this.foundChallenge, $this.userAlreadyInTeamId)
        .subscribe(() => {}); // will trigger updated broadcast with change stats for team
      }, (errSwitchingTeams) => {
        console.error(msgHdr + 'errSwitchingTeams = ', errSwitchingTeams);
      }, () => {
        $this.loader.hideLoader();
      });
    });
  }

  public joinTeam() {
    const msgHdr = jsFilename + 'joinTeam: ';
    this.challengeTeamApiService.joinTeam(this.foundChallenge, this.foundChallengeTeam).subscribe((res) => {
      console.log(msgHdr + 'res = ', res);
      this.modalController.dismiss();
    });
  }

  public logActivity() {
    const $this = this;
    $this.foundChallenge.lookups.users.forEach((challengeUser) => {
      if (challengeUser.userId === $this.userService.user._id) {
        $this.viewTeamMemberDetail(challengeUser);
      }
    });
  }

  public async viewTeamMemberDetail(challengeUserHydrated: IChallengeUserHydrated) {
    const $this = this;

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeListActivityModalComponent,
        componentProps: {
          challengeUserHydrated: challengeUserHydrated,
          foundChallenge: $this.foundChallenge,
        },
      });
    modal.onDidDismiss().then(() => {
      // do nothing just view
    });
    await modal.present();
  }
}
