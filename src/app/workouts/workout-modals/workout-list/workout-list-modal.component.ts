import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { StripeInstance } from 'ngx-stripe';
import { IWorkoutDocument } from '../../../shared/models/workout/workout.interface';
import { BroadcastService, WorkoutService } from '../../../shared/services';
import { WorkoutEditModalComponent } from '../workout-edit-modal/workout-edit-modal.component';

const jsFilename = 'list-wokout-modal';

@Component({
  selector: 'workout-list-modal',
  templateUrl: './workout-list-modal.component.html',
  styleUrls: ['./workout-list-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class WorkoutListModalComponent implements OnDestroy, OnInit {
  private subscriptions = [];
  public workouts: IWorkoutDocument[] = [];

  stripeForm: FormGroup;
  public stripe: StripeInstance;
  constructor(
    private modalController: ModalController,
    private workoutService: WorkoutService,
    private broadcastService: BroadcastService,
    private router: Router,
  ) {
    const $this = this;
  }
  ionViewWillEnter() {
    // this.parentPage = this.navParams.get('parentPage');
  }
  async dismiss(result: boolean) {
    await this.modalController.dismiss(result);
  }
  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;
    $this.workouts = $this.workoutService.workouts;
  }

  public ngOnDestroy() {
    //
  }
  public selectWorkout(workout: IWorkoutDocument) {
    const $this = this;
    const msgHdr = jsFilename + 'selectWorkout: ';

    $this.workoutService.setActiveWorkout(workout);
    localStorage.setItem('todayWorkout', workout.name);
    $this.broadcastService.broadcast('update-screen');
    $this.dismiss(true);
  }
  public async createWorkout() {
    const $this = this;
    $this.dismiss(false);
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

  public async editWorkout() {
    const $this = this;
    $this.dismiss(false);

    const modal: HTMLIonModalElement =
    await $this.modalController.create({
      component: WorkoutEditModalComponent,
      componentProps: {
        foundWorkout: $this.workoutService.getActiveWorkout(),
      },
    });
    modal.onDidDismiss().then((detail) => {
      // workout updated on broadcast
    });
    await modal.present();
  }

}
