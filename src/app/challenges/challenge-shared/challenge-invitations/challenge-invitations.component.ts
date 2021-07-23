import { Component, OnDestroy, OnInit, Output, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IChallengeDocument } from '../../../shared/models/challenge/challenge.interface';
import { BroadcastService, ChallengeService, ContactService, IonicAlertService, UserService, WorkoutService } from '../../../shared/services';
import { Platform, NavController } from '@ionic/angular';

const jsFilename = 'challenge-invitations: ';

@Component({
  selector: 'challenge-invitations',
  templateUrl: './challenge-invitations.component.html',
  styleUrls: ['./challenge-invitations.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ChallengeInvitationsComponent implements OnDestroy, OnInit {
  @Input() public mode = 'public';
  @Output() public newChallenge: EventEmitter<void> = new EventEmitter<void>();

  private subscriptions = [];

  public listChallengeInvite = [];

  public loadingChallengeInvitations = true;

  constructor(
    private router: Router,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private workoutService: WorkoutService,
    private contactService: ContactService,
    private challengeService: ChallengeService,
    private navCtrl: NavController,
    private ionicAlertService: IonicAlertService,
  ) {
    const $this = this;
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        this.getChallengeInvite();
      } else if (msg.name === 'update-invites') {
        this.getChallengeInvite();
      }
    });
    this.subscriptions.push(subscription);

    this.getChallengeInvite();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public createChallenge() {
    this.newChallenge.emit();
  }

  private getChallengeInvite() {
    const $this = this;
    const msgHdr = jsFilename + 'getChallengeInvite: ';

    const where = {
      $or: [],
      endDate: {
        $gte: new Date(),
      },
    };

    if (this.mode === 'invitations') {
      where.$or.push({
        users: {
          $elemMatch: {
            userId: $this.userService.user._id,
            invitationStatus: 'sent',
          },
        },
      });
    } else { // if (this.mode === 'public') {
      const endDate = new Date();

      where.$or.push({
        permission: 'public',
        endDate: {
          $gte: endDate,
        },
        'users.userId': {
          $ne: $this.userService.user._id,
        },
      });

          //   endDate: {
    //     $gte: endDate,
    //   },

      // where.$or.push({
      //   _id: {
      //     $in: [
      //       '60147b64214bfb0010d273b4',
      //       '60147a1a214bfb0010d2734b',
      //       '60147969214bfb0010d2731d',
      //       '60074ed84f9c94001376ed8f',
      //       '5f99611e4bec070013c04c4d',
      //       '5fec9843f57391001010ef88',
      //     ],
      //   },
      // });
    }

    const subscription = this.challengeService.getChallenges({
      where: where,
      sortField: 'advanced.displayOrder',
      sortOrder: 'asc',
    }).subscribe((data) => {
      $this.loadingChallengeInvitations = false;
      $this.listChallengeInvite = data;

      $this.broadcastService.broadcast('update-invite-cache');
    });
    this.subscriptions.push(subscription);

  }

  public updateInviteCache() {
    const $this = this;
    $this.listChallengeInvite = $this.challengeService.challengeInvites;
  }

  public updateChallengeInvitation(challenge: IChallengeDocument, payload: any) {
    const $this = this;

    $this.challengeService.updateChallengeInvitation(challenge._id, $this.userService.user._id, payload).subscribe((newWorkout) => {
      if (newWorkout) {
        this.getChallengeInvite();
        $this.workoutService.setActiveWorkout(newWorkout);
        $this.broadcastService.broadcast('update-screen');
        $this.broadcastService.broadcast('workout-selected');
        $this.broadcastService.broadcast('update-challenges');
        // $this.router.navigate(['/tabs/activities']);
        // challenge
      }
    });
  }

  public viewChallenge(challenge: IChallengeDocument) {
    const $this = this;
    $this.navCtrl.navigateForward('/tabs/challenges/detail/' + challenge._id);
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

  public enterChallengeCode() {
    const $this = this;
    $this.ionicAlertService.presentAlertPrompt('Enter the private access code to open this challenge', 'It should look like "ABXZ"', 'code', '', (res: {
      code?: string,
    }) => {
      if (!res || !res.code) {
        return;
      }

      let code: string = res.code;
      code = code.toUpperCase().trim();
      code = code.replace(/\s+/g, '');

      $this.navCtrl.navigateForward('/tabs/challenges/detail/' + code);
    });
  }
}
