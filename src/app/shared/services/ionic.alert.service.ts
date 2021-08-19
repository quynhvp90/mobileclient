import { Component, Injectable, Optional, SkipSelf } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable()
export class IonicAlertService {
  constructor(
    @Optional() @SkipSelf() prior: IonicAlertService,
    public alertController: AlertController,
    // public snackBar: MatSnackBar
  ) {
    if (prior) {
      return prior;
    }
  }
  public async presentAlert(header: string, subHeader?: string, message?: string, handlerFunction?: any) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: [{
        text: 'Okay',
        handler: (blah) => {
          if (handlerFunction) {
            handlerFunction();
          }
        },
      }],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async presentAlertConfirm(message: string, handlerFunction) {
    const alert = await this.alertController.create({
      header: message,
      // message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }, {
          text: 'Yes',
          handler: handlerFunction,
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  public async presentAlertConfirmPrompt(header: string, message: string, button?: {
    labelCancel?: string,
    labelConfirm?: string,
  }, handlerFunction?) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: button && button.labelCancel ? button.labelCancel : 'Cancel' ,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }, {
          text: button && button.labelConfirm ? button.labelConfirm :'Okay',
          handler: handlerFunction,
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async presentAlertPrompt(header: string, message: string, inputName: string, inputPlaceholder: string, handlerFunction) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      inputs: [{
        name: inputName,
        type: 'text',
        placeholder: inputPlaceholder,
      }],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }, {
          text: 'Okay',
          handler: handlerFunction,
        },
      ],
      backdropDismiss: false,
    });

    await alert.present();
  }

  async presentValue(options: {
    header: string,
    message?: string,
    input: {
      name: string,
      value: string,
      placeholder?: string,
    },
    buttons: {
      primary: {
        label: string,
      },
    },
  }, handlerFunction: any) {
    const alert = await this.alertController.create({
      header: options.header,
      message: options.message,
      inputs: [{
        name: options.input.name,
        type: 'text',
        value: options.input.value,
        placeholder: options.input.placeholder,
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          console.log('Confirm Cancel: blah');
        },
      }, {
        text: options.buttons.primary.label,
        handler: handlerFunction,
      }],
      backdropDismiss: false,
    });

    await alert.present();
  }
}
