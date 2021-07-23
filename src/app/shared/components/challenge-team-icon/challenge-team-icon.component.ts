import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'challenge-team-icon',
  templateUrl: './challenge-team-icon.component.html',
  styleUrls: ['./challenge-team-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ChallengeTeamIconComponent implements OnDestroy, OnInit {
  @Input() public icon = '';
  @Input() public width = '45px';
  @Input() public height = '45px';

  // public svg: SafeHtml;
  private subscriptions = [];

  constructor() {
  }

  public ngOnInit() {
    const $this = this;

    if ($this.icon.indexOf('http') < 0) {
      $this.icon = 'https://logreps-public.s3.amazonaws.com/images/animals/' + this.icon + '.svg';
    }
    // $this.setSvgData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
