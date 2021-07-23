import { Component, Injectable, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs/Subject';
// import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ToastController } from '@ionic/angular';

export interface ToastMessage {
  message: string;
}

@Injectable()
export class ToastService {
  public toastSubject = new Subject<ToastMessage>();
  public toastState = this.toastSubject.asObservable();

  constructor(
    @Optional() @SkipSelf() prior: ToastService,
    private toastController: ToastController,
    // public snackBar: MatSnackBar
  ) {
    if (prior) {
      return prior;
    }
  }

  public activate(message: string, mode: string) {
    this.toastSubject.next(<ToastMessage> { message });

    // this.snackBar.openFromComponent(ToasterComponent, {
    //   duration: 1000,
    // });

    // const config = new MatSnackBarConfig();
    // config.duration = 5000;
    // if (mode) {
    //   config.panelClass  = ['toast-' + mode];
    // }

    let color = 'danger';
    if (mode === 'success') {
      color = 'success';
    }

    // this.snackBar.open(message, 'OK', config);
    this.toastController.create({
      message: message,
      duration: 4000,
      color: color,
    }).then((toast) => {
      toast.present();
    });
  }
}
