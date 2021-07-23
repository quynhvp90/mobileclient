import { Component, OnInit, OnDestroy, NgZone, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import {
  Router, ActivatedRoute, Params,
} from '@angular/router';

import { ChallengeIntroModalComponent } from '../challenge-modals/challenge-intro-modal/challenge-intro-modal.component';

import {
  ActivityLogService,
  ActivityService,
  BroadcastService,
  ChallengeService,
  UserService,
  AnimationService} from '../../shared/services';
import { IChallengeDocument, IChallenge, IChallengeUser, IChallengeDocumentHydrated } from '../../shared/models/challenge/challenge.interface';
import { default as IUserDocument } from 'src/app/shared/models/user/user.interface';
import { ChallengeTeamApiService } from '../challenge-services/challenge-team.api.service';

const jsFilename = 'challenge-list: ';

@Component({
  selector: 'challenge-list',
  templateUrl: './challenge-list.component.html',
  styleUrls: ['./challenge-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeListComponent implements OnInit, OnDestroy {
  public foundChallenges: IChallengeDocumentHydrated[] = [];
  private subscriptions = [];
  public loading = true;
  public foundUser: IUserDocument;

  constructor(
    private activityService: ActivityService,
    private userService: UserService,
    private navCtrl: NavController,
    private broadcastService: BroadcastService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private challengeService: ChallengeService,
    private challengeTeamApiService: ChallengeTeamApiService,
    private zone: NgZone,
    private router: Router,
    private animationService: AnimationService,
  ) {
    this.foundUser = this.userService.user;
  }

  public ionViewWillEnter() {
    const msgHdr = jsFilename + 'ionViewWillEnter: ';
    const $this = this;
    this.foundChallenges = [];
    this.loading = true;
    setTimeout(() => {
      this.getChallenges();
      this.challengeService.userSeenChallenges();
      $this.broadcastService.broadcast('update-invites');
    }, 100);
  }

  public doRefresh(event) {
    const $this = this;
    this.getChallenges().add(() => {
      event.target.complete();
    });
    $this.broadcastService.broadcast('update-invites');
  }

  public getChallenges() {
    const msgHdr = jsFilename + 'getChallenges: ';
    const $this = this;
    console.info(msgHdr);
    $this.loading = true;
    $this.foundChallenges = [];
    return this.challengeService.getChallenges({}).subscribe((data) => {
      $this.foundChallenges = <IChallengeDocumentHydrated[]> data;
      $this.foundChallenges.sort((a, b) => {
        if (a.created > b.created) {
          return -1;
        }
        if (a.created < b.created) {
          return 1;
        }
        return 0;
      });
      $this.foundChallenges.forEach((foundChallenge) => {
        foundChallenge.lookups.usersTop = foundChallenge.lookups.usersTop.splice(0, 2);
        if (foundChallenge.teams && foundChallenge.teams.enabled) {
          $this.challengeTeamApiService.hydrateChallengeTeams(foundChallenge);
          foundChallenge.lookups.rosterTop = foundChallenge.teams.roster.slice(0, 2);
        }
        // foundChallenge.lookups.teamsTop = foundChallenge.lookups.usersTop.splice(0, 3);
      });
      $this.loading = false;
    });
  }

  public ngOnInit(): void {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';
      if (msg.name === 'update-challenges') {
        // $this.zone.run(() => {
        //   $this.getChallenges();
        // });
        $this.getChallenges();
      } else if (msg.name === 'login') {
        $this.foundUser = this.userService.user;
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public async addChallenge() {
    const msgHdr = jsFilename + 'addChallenge: ';
    const $this = this;
    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: ChallengeIntroModalComponent,
        componentProps: {
          autoStart: false, // ($this.foundChallenges.length === 0),
        },
      });

    modal.onDidDismiss().then((detail) => {
      const result: any = detail;
      if (detail !== null && detail.data !== 'close') {
        if (detail.data.foundChallenge) {
          const foundChallenge = detail.data.foundChallenge;
          setTimeout(() => {
            $this.animationService.animateOn();
            this.navCtrl.navigateForward(['/tabs/challenges/detail/' + foundChallenge._id]);
          }, 100);
        }
      }

      // if (detail && detail.data && detail.data.foundChallenge) {
      //   let challengeFound = false;
      //   $this.foundChallenges.forEach((foundChallenge) => {
      //     if (foundChallenge._id === detail.data.foundChallenge._id) {
      //       challengeFound = true;
      //     }
      //   });
      //   if (!challengeFound) {
      //     $this.foundChallenges.push(detail.data.foundChallenge);
      //   }
      // }

      // do nothing just view
    });
    await modal.present();
  }

  public viewDetail(challenge) {
    const $this = this;
    this.navCtrl.navigateForward(['/tabs/challenges/detail/' + challenge._id]);
  }
}
