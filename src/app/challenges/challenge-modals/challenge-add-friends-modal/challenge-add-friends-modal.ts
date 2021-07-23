import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import * as _ from 'lodash';
import { IChallengeDocument } from 'src/app/shared/models/challenge/challenge.interface';
import { AddFriendModal } from '../../../shared/modal/add-friend/add-friend-modal';
import { IContact, IContactDocument } from '../../../shared/models/contact/contact.interface';
import { ContactService, UserService, IonicAlertService, ChallengeService, IFilter, ShareService } from '../../../shared/services';
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';

const jsFilename = 'ChallengeAddFriendsModal';

interface IChallengeInvitation {
  _id?: string; // legacy
  userId: string;
  organizationId: string;
  isChecked: boolean;
  avatar: string;
  display: string;
}

interface IChallengeUserInvitation extends IChallengeDocument {
  lookups: {
    sendInvitation?: boolean,
    usersWithIds?: number,
  };
}

@Component({
  selector: 'challenge-add-friends-modal',
  templateUrl: './challenge-add-friends-modal.html',
  styleUrls: ['./challenge-add-friends-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ChallengeAddFriendsModalComponent implements OnDestroy, OnInit {
  public workoutName = '';
  public mode = 'new';

  public loadingPreviousChallenges = false;

  public challengeName = '';
  public canStartChallenge = false;
  public contact: IContact;
  public listContact: IContactDocument [] = [];
  public friends: IChallengeInvitation[] = [];
  // public challengeUsers: IChallengeInvitation[] = [];
  public foundChallenges: IChallengeUserInvitation[] = [];
  public foundChallenge: IChallengeDocument = null;

  public isValidEmail = false;
  public errMsg = '';
  public customAlertOptionsStart: any = {
    header: 'Challenge Start',
    subHeader: 'challenges start at 12:00 AM',
    // message: '$1.00 per topping',
    // translucent: false,
  };

  public customAlertOptionsEnd: any = {
    header: 'Challenge Duration',
    subHeader: 'challenges end at 11:59 PM',
    // message: '$1.00 per topping',
    // translucent: false,
  };

  private filter: any = {
  };
  private subscriptions = [];
  private loader: HTMLIonLoadingElement = null;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private contactService: ContactService,
    public userService: UserService,
    private ionicAlertService: IonicAlertService,
    private challengeService: ChallengeService,
    private shareService: ShareService,
    private loadingController: LoadingController,
    // private socialSharing: SocialSharing,
  ) {
  }

  ionViewWillEnter() {
    this.workoutName = this.navParams.get('workoutName');
    if (this.workoutName) {
      this.challengeName = this.workoutName + ' Challenge';
    }
  }

  async dismiss() {
    await this.modalController.dismiss();
  }

  public ngOnInit() {
    const $this = this;
    this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
      $this.getData();
      $this.getChallengeUsers();
    });

  }

  public getData() {
    const $this = this;

    const subscription = $this.contactService.getConnections(null, this.filter).subscribe((data) => {
      $this.listContact = data;
      $this.buildFriendList();
    });
    $this.subscriptions.push(subscription);
  }

  public buildFriendList () {
    const msgHdr = jsFilename + 'buildFriendList: ';

    const oldFriends: any[] = [];
    this.friends.forEach((friend) => {
      oldFriends.push(Object.assign({}, friend));
    });

    this.friends = [];
    this.listContact.forEach((contact: IContactDocument) => {
      let isChecked = false;
      oldFriends.forEach((oldFriend) => {
        if (contact.toUserId === this.userService.user._id) {
          if (oldFriend._id === contact.lookups.fromUser._id) {
            isChecked = oldFriend.isChecked;
          }
        } else if (contact.fromUserId === this.userService.user._id) {
          if (oldFriend._id === contact.lookups.toUser._id) {
            isChecked = oldFriend.isChecked;
          }
        }
      });
      if (contact.toUserId === this.userService.user._id) {
        const friend: any = contact.lookups.fromUser;
        friend.isChecked = isChecked;
        this.friends.push(friend);
      } else if (contact.fromUserId === this.userService.user._id) {
        const friend: any = contact.lookups.toUser;
        friend.isChecked = isChecked;
        this.friends.push(friend);
      } else {
        console.error(msgHdr + 'unexpected no match for = ', contact);
      }
      const contacts: IChallengeInvitation[] = _.uniqWith(this.friends, _.isEqual);
      this.friends = [];
      contacts.forEach((contact) => {
        if (contact.display && contact.display.length > 0) {
          if (contact.display.toLowerCase() !== 'someone') {
            this.friends.push({
              userId: contact.userId || contact._id,
              organizationId: contact.organizationId,
              avatar: contact.avatar,
              display: contact.display,
              isChecked: false,
            });
          }
        }
      });

      this.friends.sort(this.sortUsers);
    });
  }

  public getChallengeUsers() {
    const $this = this;

    const where = {
      $or: [{
        users: {
          $elemMatch: {
            userId: $this.userService.user._id,
            role: 'owner',
          },
        },
      }],
    };

    // let userIds = [];

    $this.loadingPreviousChallenges = true;

    const filter: IFilter = {
      where: where,
      skip: 0,
      limit: 10,
      sortField: 'created',
      sortOrder: 'desc',
    };

    $this.challengeService.getChallenges(filter).subscribe((foundChallenges) => {
      console.log('foundChallenges.length = ' + foundChallenges.length);
      $this.foundChallenges = <IChallengeUserInvitation[]> foundChallenges;
      $this.foundChallenges.forEach((foundChallenge) => {
        if (!foundChallenge.lookups) {
          foundChallenge.lookups = {};
        }
        foundChallenge.lookups.sendInvitation = false;
        foundChallenge.lookups.usersWithIds = 0;
        foundChallenge.users.forEach((user) => {
          if (user.userId) {
            foundChallenge.lookups.usersWithIds += 1;
          }
        });
      });

      $this.loadingPreviousChallenges = false;

      // foundChallenges.forEach((foundChallenge) => {
      //   foundChallenge.users.forEach((user) => {
      //     if (user.role === 'participant') {
      //       if (user.userId) {
      //         userIds.push(user.userId);
      //       }
      //     }
      //   });
      // });

      // userIds = _.uniq(userIds);

      // $this.userService.getUsers({
      //   _id: {
      //     $in: userIds,
      //   },
      // }).subscribe((users) => {
      //   users.forEach((user) => {
      //     if (user.publicName && user.publicName.length > 0) {
      //       if (user.publicName.toLowerCase() !== 'someone') {
      //         this.challengeUsers.push({
      //           userId: user._id,
      //           organizationId: user.organizationId,
      //           avatar: user.avatar,
      //           display: user.publicName,
      //           isChecked: false,
      //         });
      //       }
      //     }
      //   });

      //   this.challengeUsers.sort(this.sortUsers);
      //   $this.loadingPreviousChallenges = false;
      // });
    });
  }

  private sortUsers(a, b) {
    const aDisplay = a.display || a.displayName;
    const bDisplay = b.display || b.displayName;
    if (!aDisplay) {
      return -1;
    }
    if (!bDisplay) {
      return 1;
    }
    if (aDisplay.toLowerCase() > bDisplay.toLowerCase()) {
      return 1;
    }
    if (aDisplay.toLowerCase() < bDisplay.toLowerCase()) {
      return -1;
    }
    return 0;
  }

  public async startChallenge() {
    const newInvitations = [];
    this.checkCanStartChallenge();

    if (!this.canStartChallenge) {
      this.ionicAlertService.presentAlert('Sorry', '', 'You must select at least one friend');
      return;
    }
    this.friends.forEach((friend) => {
      if (friend.isChecked) {
        newInvitations.push(friend);
      }
    });

    // this.challengeUsers.forEach((friend) => {
    //   if (friend.isChecked) {
    //     let isDupe = false;
    //     newInvitations.forEach((invitation) => {
    //       if (invitation.userId === friend.userId) {
    //         isDupe = true;
    //       }
    //     });
    //     if (!isDupe) {
    //       newInvitations.push(friend);
    //     }
    //   }
    // });

    this.foundChallenges.forEach((foundChallenge) => {
      if (foundChallenge.lookups && foundChallenge.lookups.sendInvitation) {
        foundChallenge.users.forEach((challengeUser) => {
          let isDupe = false;
          if (!challengeUser.userId) {
            return;
          }
          newInvitations.forEach((invitation) => {
            if (invitation.userId === challengeUser.userId) {
              isDupe = true;
            }
          });
          if (!isDupe) {
            newInvitations.push({
              userId: challengeUser.userId,
            });
          }
        });
      }
    });

    if (newInvitations.length === 0) {
      return;
    }

    await this.modalController.dismiss({
      challengeName : this.challengeName,
      friends: newInvitations,
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public checkCanStartChallenge () {
    let checkedCount = 0;
    this.friends.forEach((friend) => {
      if (friend.isChecked) {
        checkedCount = checkedCount + 1;
      }
    });

    // this.challengeUsers.forEach((friend) => {
    //   if (friend.isChecked) {
    //     checkedCount = checkedCount + 1;
    //   }
    // });

    this.foundChallenges.forEach((foundChallenge) => {
      if (foundChallenge.lookups && foundChallenge.lookups.sendInvitation) {
        checkedCount = checkedCount + 1;
      }
    });

    if (checkedCount > 0) {
      this.canStartChallenge = true;
    } else {
      this.canStartChallenge = false;
    }
  }

  public async addFriend() {
    const msgHdr = jsFilename + 'addFriend: ';

    const oldFriends: any[] = [];
    this.friends.forEach((friend) => {
      oldFriends.push(friend);
    });

    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: AddFriendModal,
      });
    modal.onDidDismiss().then((detail) => {
      if (detail !== null && detail.data !== 'close') {
        // add Friend
        $this.loader.present();
        const contact = detail.data;
        const subscription = $this.contactService.addContact(contact).subscribe((createdContact) => {
          console.log(msgHdr + 'createdContact = ', createdContact);
          $this.loader.dismiss();
          if (createdContact._id) { // added new friend then reload the list friend
            this.listContact.push(createdContact);
            if (createdContact.toUserId === this.userService.user._id) {
              const newFriend = createdContact.lookups.fromUserId;
              newFriend.isChecked = true;
              this.friends.push(newFriend);
            } else if (createdContact.fromUserId === this.userService.user._id) {
              const newFriend = createdContact.lookups.toUser;
              newFriend.isChecked = true;
              this.friends.push(newFriend);
            }
            this.buildFriendList();
          }
        });
        $this.subscriptions.push(subscription);
      }
    });
    await modal.present();
  }

  public async shareInvitationLink() {
    const link = 'https://logreps.com/challenges/' + this.foundChallenge.accessCode;

    this.shareService.showSharePopup({
      text: 'Join my LogReps challenge at the following link',
      url: link,
      dialogTitle: link,
      clipboardValue: link,
      clipboardConfirmText: 'The link has been copied to your clipboard',
    });
  }

}
