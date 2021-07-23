import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IActivityDocument } from '../../../shared/models/activity/activity.interface';
import { BroadcastService } from '../../../shared/services';


const jsFilename = 'challenge-activity-row: ';

@Component({
  selector: 'challenge-activity-row',
  templateUrl: './challenge-activity-row.component.html',
  styleUrls: ['./challenge-activity-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeActivityRowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public activity: IActivityDocument;

  public display = 'push-ups';
  public primarycolor = '#777';
  public secondarycolor = '#CCC';
  private subscriptions = [];

  constructor(
    private broadcastService: BroadcastService,
  ) {
    const $this = this;

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {

    });
    this.subscriptions.push(subscription);
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    if ($this.activity && $this.activity.lookup) {
      $this.updateData();
    }
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  private updateData() {
    const $this = this;

    $this.display = $this.activity.goal + ' ' + $this.activity.label;
    if (this.activity.logLabel && this.activity.logLabel.length > 0) {
      $this.display =  $this.activity.goal + ' ' + $this.activity.logLabel;
    }
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
