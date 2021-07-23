import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { IonMenu, ModalController } from '@ionic/angular';
import { IWorkoutDocument } from '../../models/workout/workout.interface';
import { BroadcastService, ApiService, ReportService, UserService, WorkoutService, TipsService } from '../../services';
import { environment } from '../../../../environments/environment';
import { WorkoutEditModalComponent } from '../../../workouts/workout-modals/workout-edit-modal/workout-edit-modal.component';

const jsFilename = 'logreps-workouts: ';

@Component({
  selector: 'logreps-workouts',
  templateUrl: './logreps-workouts.component.html',
  styleUrls: ['./logreps-workouts.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LogRepsWorkoutsComponent implements OnInit, OnDestroy {
  private subscriptions = [];

  public personalWorkouts: IWorkoutDocument[] = [];
  // public challengeWorkouts: IWorkoutDocument[] = [];
  public isLocalDev = (environment.api === 'http://localhost:4000');

  constructor(
    private router: Router,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private workoutService: WorkoutService,
    private reportService: ReportService,
    private apiService: ApiService,
    private tipsService: TipsService,
    private ionMenu: IonMenu,
    private modalController: ModalController,
  ) {
    const $this = this;

    // this.observableOdometer = new Observable<boolean>((observer: any) => this.observerOdometer = observer).pipe(share());
  }

  public ngOnInit(): void {
    const $this = this;
    const msgHdr = jsFilename + 'onInit: ';
    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'workout-updated') {
        $this.getData();
      } else if (msg.name === 'login') {
        $this.getData();
      }
      if (msg.name === 'workout-deleted') {
        $this.getData();
      }
    });
    this.subscriptions.push(subscription);

    $this.getData();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private getData() {
    const msgHdr = jsFilename + 'getData: ';
    const $this = this;
    $this.personalWorkouts = [];
    // $this.challengeWorkouts = [];

    $this.workoutService.resetWorkoutList().subscribe((data) => {
      if (data && data.items && data.items.length > 0) {
        data.items.forEach((item) => {
          if (!item.workoutType || item.workoutType === 'personal') {
            $this.personalWorkouts.push(item);
          // } else {
          //   $this.challengeWorkouts.push(item);
          }
        });
      }
    });
  }

  public selectWorkout(workout: IWorkoutDocument) {
    const $this = this;
    const msgHdr = jsFilename + 'selectWorkout: ';
    console.log(msgHdr);
    $this.ionMenu.close();

    $this.workoutService.setActiveWorkout(workout);
    $this.broadcastService.broadcast('update-screen');
    $this.broadcastService.broadcast('workout-selected');
    $this.router.navigate(['/tabs/activities']);
  }

  public selectAllWorkouts() {
    const $this = this;
    const msgHdr = jsFilename + 'selectAllWorkouts: ';
    console.log(msgHdr);
    $this.ionMenu.close();
    $this.router.navigate(['/tabs/activities/all']);
  }

  public async createWorkout() {
    const $this = this;
    $this.ionMenu.close();

    const modal: HTMLIonModalElement =
      await $this.modalController.create({
        component: WorkoutEditModalComponent,
        componentProps: {
        },
      });
    modal.onDidDismiss().then((detail) => {
      // workout updated on broadcast
    });
    await modal.present();
  }

  public mergeWorkouts() {
    this.apiService.post({
      resource: 'workouts/merge',
    }).subscribe((resMergeWorkouts: any) => {
      console.log('resMergeWorkouts = ', resMergeWorkouts);
    }, (errMergeWorkouts) => {
      console.error('errMergeWorkouts = ', errMergeWorkouts);
    });
  }

  public resetTutorial() {
    const $this = this;
    $this.tipsService.reset();
  }

  public sendNewsLetter() {
    const $this = this;
    $this.ionMenu.close();
    this.userService.sendNewsLetter().subscribe((result) => {
    });
  }

  public report(format: string) {
    const $this = this;
    $this.reportService.dowloadReport(format).subscribe((result) => {
    });
  }
}
