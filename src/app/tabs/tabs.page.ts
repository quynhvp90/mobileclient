import { Component } from '@angular/core';
import { ChallengeService, NotificationService } from '../shared/services';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  public showChallengeBadge = false;

  constructor() {

    const $this = this;
  }

  public tabChanged($ev) {
    // not working for ION4
    // https://stackoverflow.com/questions/45661693/change-ionic-tabs-to-navigate-to-their-root-page-and-not-to-their-last-page
    // $ev.setRoot($ev.root);
  }
}
