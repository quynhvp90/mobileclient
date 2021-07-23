import { Component, OnInit, OnDestroy, Input, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'stats-row',
  templateUrl: './stats-row.component.html',
  styleUrls: ['./stats-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatsRowComponent implements OnInit, OnDestroy {
  @Input() public activity = null;
  public primarycolor = '#238193';
  public secondarycolor = '#ccc';
  private subscriptions = [];

  constructor(
    private router: Router,

  ) {
  }

  public ngOnInit(): void {
    const $this = this;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
