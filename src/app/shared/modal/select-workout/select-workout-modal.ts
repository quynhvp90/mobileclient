import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { IWorkoutDocument } from '../../models/workout/workout.interface';
import { WorkoutService } from '../../services';

const jsFilename = 'SelectWorkoutModal';

@Component({
  selector: 'select-workout-modal',
  templateUrl: './select-workout-modal.html',
  styleUrls: ['./select-workout-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SelectWorkoutModal implements OnDestroy, OnInit {
  public foundWorkouts: IWorkoutDocument[] = [];

  constructor(
    private modalController: ModalController,
    private workoutService: WorkoutService,
  ) {

  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
    const $this = this;
    $this.workoutService.workouts.forEach((workout) => {
      if (workout.workoutType === 'personal') {
        $this.foundWorkouts.push(workout);
      }

    });
  }

  public async selectWorkout(workout: IWorkoutDocument) {
    await this.modalController.dismiss(workout);
  }

  public ngOnDestroy() {
    //
  }

}
