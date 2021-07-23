import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IChallengeDocumentHydrated } from '../../../shared/models/challenge/challenge.interface';
import { ActivityLogService, ActivityService, BroadcastService, UserService, ChallengeService } from '../../../shared/services';

const jsFilename = 'challenge-timer: ';

@Component({
  selector: 'challenge-timer',
  templateUrl: './challenge-timer.component.html',
  styleUrls: ['./challenge-timer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeTimerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() mode = 'long';
  @Input() set challenge(value: IChallengeDocumentHydrated) {
    this.foundChallenge = value;
    this.setChallengeTimes();
  }

  public foundChallenge: IChallengeDocumentHydrated;
  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
    private challengeService: ChallengeService,
    public userService: UserService,
  ) {
    const $this = this;
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';

    $this.setChallengeTimes();

    // const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
    //   if (msg.name === 'update-challenge-user') {
    //   } else if (msg.name === 'update-challenges') {
    //     $this.setChallengeTimes();
    //   }
    // });
    // this.subscriptions.push(subscription);
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private setChallengeTimes() {
    const $this = this;

    if (!$this.foundChallenge) {
      return;
    }

    $this.challengeService.setChallengeTimes([$this.foundChallenge]);
  }
}
