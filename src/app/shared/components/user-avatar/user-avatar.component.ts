import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { UtilityService, BroadcastService } from '../../services';
import { ApiService } from '../../services/api.service';

const jsFilename = 'user-avatar: ';

@Component({
  selector: 'user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})

export class UserAvatarComponent implements OnDestroy, OnInit {
  @Input() public imageName: string;
  @Input() public width = '40px';
  @Input() public height = '40px';

  public avatar = {
    url: null,
    avatarColor: null,
    firstLetter: null,
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService,
    private broadcastService: BroadcastService,
  ) {
    const $this = this;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ngOnInit() {
    const $this = this;
    $this.setImage();

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'avatar-updated') {
        this.setImage();
      }
    });
    this.subscriptions.push(subscription);
  }

  private setImage () {
    const $this = this;
    const msgHdr = jsFilename + 'setImage: ';
    if (!$this.imageName) {
      console.error(msgHdr + 'unexpected no imageName');
      return;
    }
    if ($this.imageName && $this.imageName.length > 0) {
      $this.avatar.url = '/assets/img/avatars/' + $this.imageName.trim() + '.png';
    }
  }
}
