import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IChallengeDocumentHydrated, IChallengeTeam, IChallengeUserHydrated } from '../../../shared/models/challenge/challenge.interface';
import { ActivityLogService, ActivityService, BroadcastService, UserService } from '../../../shared/services';

const jsFilename = 'challenge-row: ';

export interface IChallengeRowItem {
  userId?: string; // may be team or userId
  teamId?: string;
  avatar: string;
  display: string;
  totalCount: number;
  totalGoal: number;
  invitationStatus?: string;
  percentComplete?: number;
  stats?: {
    dailyStreaks: number;
    totalDaysLogged: number;
  };
}

@Component({
  selector: 'challenge-row',
  templateUrl: './challenge-row.component.html',
  styleUrls: ['./challenge-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChallengeRowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public challengeRowItem: IChallengeRowItem;
  @Input() public challengeHydrated: IChallengeDocumentHydrated;

  public primarycolor = '#FF6A01';
  public secondarycolor = '#FF8E3D';
  public display = 'noName';
  public userAvatar = '';
  public count = 0;
  public showCongrats = false;

  private subscriptions = [];

  public percentComplete = -1;
  public percentLabel = '';

  public gradBar = {
    width: '0%',
    // 'background': '-webkit-linear-gradient(left, #76BF00, #86DE00)', /* For Safari 5.1 to 6.0 */
    // 'background': '-o-linear-gradient(right, #76BF00, #86DE00)', /* For Opera 11.1 to 12.0 */
    // 'background': '-moz-linear-gradient(right, #76BF00, #86DE00)', /* For Firefox 3.6 to 15 */
    background: 'linear-gradient(to right, #76BF00, #86DE00)', /* Standard syntax (must be last) */
    transition: 'width 1s ease-in-out',
  };

  public gradBarToGo = {
    width: '100%',
    transition: 'width 1s ease-in-out',
  };

  private  colors = {
    red: {
      primary: '#E44646',
      secondary: '#E26668',
    },
    blue: {
      primary: '#377EB8',
      secondary: '#4BACF2',
    },
    green: {
      primary: '#4DAF4A',
      secondary: '#61D85D',
    },
    purple: {
      primary: '#984EA3',
      secondary: '#BD61CC',
    },
    orange: {
      primary: '#FF6A01',
      secondary: '#FF8D42',
    },
    yellow: {
      primary: '#FFBF02',
      secondary: '#FFE38E',
    },
    black: {
      primary: '#777',
      secondary: '#CCC',
    },
    default: {
      primary: '#0a9ec7', // 007090
      secondary: '#ccc', //
    },
  };

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private activityLogService: ActivityLogService,
    private broadcastService: BroadcastService,
    private navCtrl: NavController,
    public userService: UserService,
  ) {
    const $this = this;
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';

    $this.updateData();

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'update-challenge-user') {
        const newChallengeUser: IChallengeUserHydrated = msg.message;
        if ($this.challengeRowItem) {
          if (newChallengeUser.userId === $this.challengeRowItem.userId) {
            $this.challengeRowItem = newChallengeUser;
            $this.updateData();
          }
        }
      } else if (msg.name === 'update-challenges') {
        $this.updateData();
      } else if (msg.name === 'challenge-team-update') {
        if (msg.message.challengeTeam) {
          if ($this.challengeRowItem.teamId === msg.message.challengeTeam._id) {
            $this.challengeRowItem.avatar = msg.message.challengeTeam.icon;
            $this.challengeRowItem.display = msg.message.challengeTeam.name;
            $this.updateData();
          }
        } else if (msg.message.challengeRowItem) {
          if ($this.challengeRowItem.teamId === msg.message.challengeRowItem.teamId) {
            $this.challengeRowItem = msg.message.challengeRowItem;
            $this.updateData();
          }
        }
      } else if (msg.name === 'activity-log-update') {
        // if ($this.challengeUserHydrated && $this.challengeUserHydrated.activities) {
        //   $this.challengeUserHydrated.activities.forEach((activity) => {
        //     if (msg.message.activityId === activity._id) {
        //       $this.challengeUserHydrated.totalCount += msg.message.count;
        //       $this.updateData();
        //     }
        //   });
        // }

      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ngAfterViewInit(): void {
    const $this = this;
    const msgHdr = 'ngAfterViewInit: ';
  }

  public congratulate() {
    const $this = this;
    const msgHdr = 'congratulate: ';

  }
  private updateData() {
    const $this = this;
    const msgHdr = jsFilename + 'updateData: ';

    let congratulateUser = false;
    let percentComplete = 0;

    $this.primarycolor = '#FF6A01';
    $this.secondarycolor = '#FF8E3D';
    $this.display = $this.challengeRowItem.display ;
    $this.userAvatar = $this.challengeRowItem.avatar;

    if ($this.challengeRowItem.percentComplete) {
      percentComplete = $this.challengeRowItem.percentComplete;
    } else {
      $this.count = $this.challengeRowItem.totalCount;

      if ($this.challengeRowItem.totalGoal > 0) {
        percentComplete = $this.count / $this.challengeRowItem.totalGoal;
      }
    }

    if (percentComplete >= 1) {
      percentComplete = 1;
      if (($this.percentComplete >= 0) && $this.percentComplete < 1) {
        congratulateUser = true;
      }
    }
    $this.percentComplete = Math.floor(percentComplete * 100);

    const percentToGoal = $this.percentComplete;

    let colorToUse = 'black';
    if (percentToGoal === 0) {
      colorToUse = 'black';
    } else if (percentToGoal < 25) {
      colorToUse = 'blue';
    } else if (percentToGoal < 50) {
      colorToUse = 'red';
    } else if (percentToGoal < 75) {
      colorToUse = 'orange';
    } else if (percentToGoal < 100) {
      colorToUse = 'yellow';
    } else {
      colorToUse = 'green';
    }
    $this.primarycolor = $this.colors[colorToUse].primary;
    $this.secondarycolor = $this.colors[colorToUse].secondary;
    $this.gradBar.width = percentToGoal  + '%';
    $this.gradBar.background = 'linear-gradient(to right, ' + $this.colors[colorToUse].primary + ', ';
    $this.gradBar.background += $this.colors[colorToUse].secondary + ')';
    $this.gradBarToGo.width = (100 - percentToGoal) + '%';

    let showLabel = true;
    if ($this.challengeRowItem.userId) {
      if ($this.challengeHydrated.teams && $this.challengeHydrated.teams.enabled) {
        showLabel = false;
      }
    }

    if (showLabel) {
      $this.percentLabel = $this.percentComplete + '%';

      if ($this.challengeHydrated.advanced && $this.challengeHydrated.advanced.showTotalsInsteadOfPercent) {
        if ($this.challengeRowItem.totalCount) {
          $this.percentLabel = $this.challengeRowItem.totalCount + ' completed';
        }
      }
    }

    return congratulateUser;
  }
}

class Ball {
  private x;
  private y;
  private speed;
  private gravity;
  private diameter;
  private ax;
  private ay;
  private colour;
  private p5ref;

  constructor(p5ref, x, y, x2, y2) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.gravity = 0.1;
    this.diameter = (p5ref.dist(x, y, x2, y2)) * 0.8;

    this.ax = p5ref.random(-this.speed, this.speed);
    this.ay = p5ref.random(-this.speed, this.speed);
    this.p5ref = p5ref;

    this.colour = p5ref.random(['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423']);
  }

  public update() {
    this.diameter = this.diameter - 0.3;
    this.x += this.ax / 2;
    this.y += this.ay / 2;

    this.x += this.p5ref.random(-this.speed / 2, this.speed / 2);
    this.y += this.p5ref.random(-this.speed / 2, this.speed / 2);
  }

  public ballisFinished() {
    if (this.diameter < 0) {
      return true;
    }
  }

  public render() {
    // print(this.colour);
    this.p5ref.noStroke();
    if (this.diameter > 0) {
      this.p5ref.fill(this.colour);
      this.p5ref.ellipse(this.x, this.y, this.diameter, this.diameter);
    }
  }
}
