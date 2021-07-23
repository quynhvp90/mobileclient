import { Injectable } from '@angular/core';

import { BroadcastService } from '../../shared/services/broadcast.service';
import { IChallengeDocument } from '../../shared/models/challenge/challenge.interface';

import { ChallengeService, IonicAlertService, LoaderService, UserService } from 'src/app/shared/services';

@Injectable()
export class ChallengeJoinService {
  constructor(
    private broadcastService: BroadcastService,
    private userService: UserService,
    private loader: LoaderService,
    private ionicAlertService: IonicAlertService,
    private challengeService: ChallengeService) {

    this.broadcastService.state.subscribe(() => {
    });
  }

  public joinChallenge(foundChallenge: IChallengeDocument) {
    const $this = this;

    let promptForName = false;
    if ($this.userService && $this.userService.user) {
      if (!$this.userService.user.publicName ||  $this.userService.user.publicName.toLowerCase() === 'someone') {
        promptForName = true;
      }
    }
    if (!promptForName) {
      $this.joinChallengeNow(foundChallenge);
      return;
    }
    $this.ionicAlertService.presentAlertPrompt('Please type in your name', 'Feel free to name yourself something simple and fun <span class="mr-5">😋</span> as long as your friends know who you are 😊', 'name', '', (res) => {
      if (!res) {
        return;
      }

      if (!res.name || res.name.length < 3) {
        $this.ionicAlertService.presentAlert('Sorry', 'Please enter at least 3 characters');
        return;
      }

      this.userService.patch({
        action: 'update-misc',
        publicName: res.name,
      }).subscribe((result) => {
        if (result) {
          $this.userService.user.publicName = res.name;
          $this.joinChallengeNow(foundChallenge);
          $this.ionicAlertService.presentAlert('Welcome to the challenge!', 'You can go to settings for additional features like setting your avatar, backing up your data, etc.');
        }
      });
    });
  }

  public joinChallengeNow(foundChallenge: IChallengeDocument) {
    const $this = this;

    $this.loader.showLoader();
    $this.challengeService.joinChallenge(foundChallenge._id)
      .subscribe((isJoined) => {
        if (isJoined) {
          $this.broadcastService.broadcast('joined-challenge');
        }
        $this.loader.hideLoader();

      });
  }
}
