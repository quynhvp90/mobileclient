import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ModalController, NavController, LoadingController } from '@ionic/angular';
import { IActivityDocument } from '../../shared/models/activity/activity.interface';
import { IChallengeDocument, IChallengeUserHydrated, IChallengeDocumentHydrated, IChallengeTeam } from '../../shared/models/challenge/challenge.interface';
import { IWorkoutDocument } from '../../shared/models/workout/workout.interface';
import { ChallengeService, IonicAlertService, BroadcastService, UserService, SocialService, MessageService, GlobalService } from '../../shared/services';
import { ChallengeListActivityModalComponent } from '../challenge-modals/challenge-list-activity-modal/challenge-list-activity-modal.component';
import { ChallengeAddFriendsModalComponent } from '../challenge-modals/challenge-add-friends-modal/challenge-add-friends-modal';
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Plugins } from '@capacitor/core';
import { ShareService } from 'src/app/shared/services/share.service';
import { ChallengeNewModalComponent } from '../challenge-modals/challenge-new-modal/challenge-new-modal.component';
import { CreatePostModal } from 'src/app/shared/modal/create-post/create-post-modal';
import { ChallengeFriendsModalComponent } from '../challenge-modals/challenge-friends-modal/challenge-friends-modal.component';
import anchorme from 'anchorme';
import { ChallengeTeamApiService } from '../challenge-services/challenge-team.api.service';
import { ChallengeTeamModalService } from '../challenge-modals/challenge-team-modal/challenge-team-modal.service';
import { ChallengeTeamEditModalService } from '../challenge-modals/challenge-team-edit-modal/challenge-team-edit-modal.service';
import { ChallengeTeamSelectModalService } from '../challenge-modals/challenge-team-select-modal/challenge-team-select-modal.service';
import { ChallengeJoinService } from '../challenge-services/challenge-join.service';
const jsFilename = 'challenge-detail: ';

@Component({
  selector: 'challenge-detail',
  templateUrl: './challenge-detail.component.html',
  styleUrls: ['./challenge-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeDetailComponent implements OnInit, OnDestroy {
  private subscriptions = [];
  public foundChallenge: IChallengeDocumentHydrated;
  public challengeUsers: IChallengeUserHydrated[] = [];
  public challengeActivities: IActivityDocument[] = [];
  public userIsOwner = false;
  public userStatus = 'anonymous';
  private loader: HTMLIonLoadingElement = null;
  public loadingChallenge = true;
  public socialUserIds: string[] = [];

  public socialToggle = 'messages';

  public showError = false;
  public showJoinTeam = false;

  private challengeId = '';
  constructor(
    private navCtrl: NavController,
    private modalController: ModalController,
    private challengeService: ChallengeService,
    private challengeTeamApiService: ChallengeTeamApiService,
    private challengeTeamModalService: ChallengeTeamModalService,
    private challengeTeamEditModalService: ChallengeTeamEditModalService,
    private challengeTeamSelectModalService: ChallengeTeamSelectModalService,
    private route: ActivatedRoute,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private ionicAlertService: IonicAlertService,
    private loadingController: LoadingController,
    private shareService: ShareService,
    public globalService: GlobalService,
    private messageService: MessageService,
    private challengeJoinService: ChallengeJoinService,
    // private socialSharing: SocialSharing,
  ) {
  }

  public ngOnInit(): void {
    const $this = this;

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ionViewWillEnter() {
    // reset when change tab
    // const scrollContent = document.getElementById('listChallengeScroll');
    // if (scrollContent) {
    //   scrollContent.scrollTop = 0;
    // }
  }

  public ionViewDidEnter() {
    const $this = this;
    const msgHdr = jsFilename + 'ionViewDidEnter: ';

    $this.messageService.clear();
    if ($this.socialUserIds.length > 0) {

    }

    let subscription = this.route.params.subscribe((params: Params) => {
      this.challengeId = params['id'];
      if (!this.challengeId) {
        return;
      }
      $this.getChallenge();
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'activity-log-update') {
        setTimeout(() => {
          $this.getChallenge();
        }, 1000);
      } else if (msg.name === 'joined-challenge') {
        if (this.showJoinTeam) {
          this.joinTeam();
          return;
        }
        $this.getChallenge();
      } else if (msg.name === 'joined-challenge-team') {
        $this.getChallenge();
      } else if (msg.name === 'challenge-team-update') {
        if (msg.message.challengeTeam) {
          $this.foundChallenge.teams.roster.forEach((team) => {
            if (team._id === msg.message.challengeTeam._id) {
              team.name =  msg.message.challengeTeam.name;
              team.icon =  msg.message.challengeTeam.icon;
            }
          });
        }
      }
    });
    this.subscriptions.push(subscription);
  }

  public ionViewDidLeave() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public showAllParticipants() {
    const $this = this;
    // $this.challengeUsers = $this.foundChallenge.lookups.users;

    this.modalController.create({
      component: ChallengeFriendsModalComponent,
      componentProps: {
        foundChallenge: $this.foundChallenge,
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data && detail.data.message && detail.data.message.length > 0) {
          const message = detail.data.message;

          $this.challengeService.sendMessage($this.foundChallenge._id, {
            body: message,
          }).subscribe((success) => {
            if (success) {
              // $this.ionicAlertService.presentAlert('Message sent');
              $this.messageService.reset({
                challengeId: $this.foundChallenge._id,
              });
            }
          });
        }
      });
    });
  }

  public sendMessage() {
    const $this = this;

    this.modalController.create({
      component: CreatePostModal,
      componentProps: {
        mode: 'post',
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data && detail.data.message && detail.data.message.length > 0) {
          const message = detail.data.message;

          $this.challengeService.sendMessage($this.foundChallenge._id, {
            body: message,
          }).subscribe((success) => {
            if (success) {
              // $this.ionicAlertService.presentAlert('Message sent');
              $this.messageService.reset({
                challengeId: $this.foundChallenge._id,
              });
            }
          });
        }
      });
    });
  }

  private getChallenge() {
    const $this = this;
    const subscription = this.challengeService.getChallenge($this.challengeId).subscribe((data) => {
      this.loadingChallenge = false;
      if (!data) {
        this.showError = true;
        return;
      }

      $this.foundChallenge = data;
      if (data.lookups && data.lookups.users) {
        $this.challengeUsers = data.lookups.usersTop;
        if ($this.challengeUsers && $this.challengeUsers.length > 0) {
          if ($this.challengeUsers[0].activities) {
            $this.challengeActivities = $this.challengeUsers[0].activities;
          }
        }
        $this.challengeUsers.forEach((challengeUser) => {
          this.broadcastService.broadcast('update-challenge-user', challengeUser);
        });
      }
      if ($this.foundChallenge.description) {
        $this.foundChallenge.description = anchorme($this.foundChallenge.description);
      }

      $this.showJoinTeam = false;
      if ($this.foundChallenge.teams && $this.foundChallenge.teams.enabled) {
        if ($this.foundChallenge.teams.roster) {
          $this.showJoinTeam = true;
          $this.foundChallenge.teams.roster.forEach((challengeTeam) => {
            if (challengeTeam.users) {
              challengeTeam.users.forEach((challengeUser) => {
                if (challengeUser.userId === $this.userService.user._id) {
                  $this.showJoinTeam = false;
                }
              });
            }
          });
        }
      }

      $this.challengeTeamApiService.hydrateChallengeTeams($this.foundChallenge);
      $this.broadcastService.broadcast('update-challenge', $this.foundChallenge);
      $this.updateOwner();
      $this.updateLists();
    });
    this.subscriptions.push(subscription);
  }

  private updateOwner() {
    const $this = this;
    $this.userIsOwner = false;
    $this.userStatus = 'anonymous';
    $this.socialUserIds = [];
    if ($this.foundChallenge && $this.foundChallenge.users) {
      $this.foundChallenge.users.forEach((user) => {
        if (user.invitationStatus === 'accepted') {
          $this.socialUserIds.push(user.userId);
        }
        if (user.userId === $this.userService.user._id) {
          $this.userStatus = user.invitationStatus;
        }

        if (user.role === 'owner' && user.userId === $this.userService.user._id) {
          $this.userIsOwner = true;
        }
      });
    }
  }

  public backtoChallenges() {
    this.navCtrl.navigateBack('tabs/challenges');
  }

  public leaveChallenge() {
    const $this = this;

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to leave and remove this challenge?', () => {
      $this.loader.present();
      const subscription = this.challengeService.leaveChallenge(this.foundChallenge._id)
        .subscribe((isDeleted) => {
          $this.loader.dismiss();
          if (isDeleted) {
            $this.navCtrl.navigateBack('tabs/challenges');
          }
        });
      $this.subscriptions.push(subscription);
    });
  }

  public joinChallenge() {
    const $this = this;
    $this.challengeJoinService.joinChallenge($this.foundChallenge);
  }

  public joinTeam() {
    this.challengeTeamSelectModalService.showSelectTeam(this.foundChallenge);
  }

  public createTeam() {
    const $this = this;
    $this.challengeTeamEditModalService.createTeam($this.foundChallenge);
  }

  public archiveChallenge() {
    const $this = this;

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to archive this challenge?', () => {
      $this.loader.present();
      const subscription = this.challengeService.archiveChallenge(this.foundChallenge._id)
        .subscribe((isDeleted) => {
          if (isDeleted) {
            $this.navCtrl.navigateBack('tabs/challenges');
          }
          $this.loader.dismiss();
        });
      $this.subscriptions.push(subscription);
    });
  }

  public deleteChallenge() {
    const $this = this;

    if (!$this.userIsOwner) {
      $this.ionicAlertService.presentAlert('Only the owner of this challenge can delete it');
      return;
    }

    $this.ionicAlertService.presentAlertConfirm('Are you sure you want to permanently delete this challenge?', () => {
      $this.loader.present();
      const subscription = this.challengeService.deleteChallenge(this.foundChallenge._id)
        .subscribe((isDeleted) => {
          if (isDeleted) {
            $this.navCtrl.navigateBack('tabs/challenges');
          }
          $this.loader.dismiss();
        });
      $this.subscriptions.push(subscription);
    });
  }

  public selectWorkout() {
  }

  public shareProgress() {
    window.open('https://logreps.com/challenges/' + this.foundChallenge.accessCode);
  }

  public shareInvitationLink() {
    const link = 'https://logreps.com/challenges/' + this.foundChallenge.accessCode;

    this.shareService.showSharePopup({
      text: 'Join my LogReps challenge at the following link',
      url: link,
      dialogTitle: link,
      clipboardValue: link,
      clipboardConfirmText: 'The link has been copied to your clipboard',
    });
  }

  public async addFriend() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeAddFriendsModalComponent,
        componentProps: {
          workoutName: '',
          foundChallenge: $this.foundChallenge,
          mode: 'edit',
        },
      });

    modal.onDidDismiss().then((detail) => {
      if (detail && detail.data) {
        // add Challenge
        const friends: any[] = detail.data.friends;
        if (friends.length > 0) {
          const usersToAdd: {
            userId: string,
            organizationId: string,
            role: string,
            invitationStatus: string,
          }[] = [];

          // add friends
          friends.forEach((friend) => {
            const user = {
              userId: friend.userId || friend._id,
              organizationId: friend.organizationId,
              role: 'participant',
              invitationStatus: 'sent',
            };
            usersToAdd.push(user);
          });

          // const newChallenge: IChallenge = {
          //   name: challengeName,
          //   workoutId: workout._id,
          //   users: challengeUser,
          // };
          const subscription = $this.challengeService.inviteUsers($this.foundChallenge._id, usersToAdd).subscribe(() => {
            // this.broadcastService.broadcast('update-challenges');

            this.navCtrl.navigateBack('/tabs/challenges');
          });
          $this.subscriptions.push(subscription);
        }
      }
    });
    await modal.present();
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
    modal.onDidDismiss().then(() => {
      // do nothing just view
    });
    await modal.present();
  }

  public logActivity() {
    const $this = this;
    if ($this.foundChallenge.teams && $this.foundChallenge.teams.enabled) {
      $this.foundChallenge.teams.roster.forEach((challengeTeam) => {
        challengeTeam.users.forEach((challengeUser) => {
          if (challengeUser.userId === $this.userService.user._id) {
            $this.viewTeam(challengeTeam);
          }
        });
      });
    } else {
      $this.foundChallenge.lookups.users.forEach((challengeUser) => {
        if (challengeUser.userId === $this.userService.user._id) {
          $this.viewDetail(challengeUser);
        }
      });
    }
  }

  public updateChallengeInvitation(challenge: IChallengeDocument, payload: any) {
    const $this = this;

    $this.loader.present();
    $this.challengeService.updateChallengeInvitation(challenge._id, $this.userService.user._id, payload).subscribe((newWorkout) => {
      $this.loader.dismiss();
      if (newWorkout) {
        $this.broadcastService.broadcast('update-screen');
        $this.broadcastService.broadcast('update-challenges');
        $this.getChallenge();
      } else {
        $this.navCtrl.navigateBack('tabs/challenges');
      }
    });
  }

  public acceptChallenge(challenge: IChallengeDocument) {
    this.updateChallengeInvitation(challenge, {
      status: 'accepted',
    });
  }

  public denyChallenge(challenge: IChallengeDocument) {
    this.updateChallengeInvitation(challenge, {
      status: 'rejected',
    });
  }

  public messagesOrActivitiesToggle() {
    const $this = this;
    if ($this.socialToggle === 'messages') {
    } else {
    }
  }

  private updateLists() {
    const $this = this;

    $this.messageService.reset({
      challengeId: $this.foundChallenge._id,
      showLoading: true,
      limit: 30,
    });
  }

  public async editChallenge() {
    const $this = this;

    const userId = $this.userService.user._id;
    let isOwnerMakingEdit = false;
    $this.foundChallenge.users.forEach((user) => {
      if (user.role === 'owner') {
        if (userId === user.userId) {
          isOwnerMakingEdit = true;
        }
      }
    });

    if (!isOwnerMakingEdit) {
      $this.ionicAlertService.presentAlert('Sorry', 'Only the owner of this challenge can make any changes');
      return;
    }

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeNewModalComponent,
        componentProps: {
          foundChallenge: $this.foundChallenge,
          mode: 'edit',
        },
      });

    modal.onWillDismiss().then((detail) => {
      if (detail && detail.data && detail.data.foundChallenge) {
        $this.foundChallenge = null;
        $this.getChallenge();
      }
    });

    modal.onDidDismiss().then((detail) => {
      if (detail && detail.data && detail.data.foundChallenge) {
      }
    });
    await modal.present();
  }

  public donate() {
    window.open(this.foundChallenge.advanced.donateUrl);
  }

  public viewTeam(challengeTeam: IChallengeTeam) {
    if (this.userStatus !== 'accepted') {
      this.ionicAlertService.presentAlert('You must first join or accept your invitation');
      return;
    }
    this.challengeTeamModalService.viewTeam(this.foundChallenge, challengeTeam);
  }

}
