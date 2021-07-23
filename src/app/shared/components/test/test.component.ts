import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

const jsFilename = 'test: ';

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class TestComponent implements OnDestroy, OnInit {
  private subscriptions = [];

  public activities = [{
    name: 'pushup',
    percentComplete: 0.1,
    primarycolor: '#000000',
    secondarycolor: '#000000',
  }, {
    name: 'situp',
    percentComplete: 0.5,
    primarycolor: '#000000',
    secondarycolor: '#000000',
  }, {
    name: 'pullup',
    percentComplete: 1,
    primarycolor: '#000000',
    secondarycolor: '#000000',
  }];

  constructor(
  ) {
    const $this = this;
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;

    const colors = {
      'red': {
        'primary': '#E44646',
        'secondary': '#E26668'
      },
      'blue': {
        'primary': '#377EB8',
        'secondary': '#4BACF2'
      },
      'green': {
        'primary': '#4DAF4A',
        'secondary': '#61D85D'
      },
      'purple': {
        'primary': '#984EA3',
        'secondary': '#BD61CC'
      },
      'orange': {
        'primary': '#FF6A01',
        'secondary': '#FF8D42'
      },
      'yellow': {
        'primary': '#FFBF02',
        'secondary': '#FFE38E'
      },
      'black': {
        'primary': '#777',
        'secondary': '#CCC'
      },
      'default': {
        'primary': '#0a9ec7', // 007090
        'secondary': '#ccc' //
      }
    };

    $this.activities.forEach((activity) => {
      const percentToGoal = activity.percentComplete;
      let colorToUse = 'black';
      if (percentToGoal === 0) {
          colorToUse = 'black';
      } else if (percentToGoal < 0.25) {
          colorToUse = 'blue';
      } else if (percentToGoal < 0.50) {
          colorToUse = 'red';
      } else if (percentToGoal < 0.75) {
          colorToUse = 'orange';
      } else if (percentToGoal < 1.0) {
          colorToUse = 'yellow';
      } else {
          colorToUse = 'green';
      }
      activity.primarycolor = colors[colorToUse].primary;
      activity.secondarycolor = colors[colorToUse].secondary;
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
