import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BroadcastService, UserService, ToastService, IonicAlertService, GlobalService, StatsService, MessageService } from '../../../shared/services';
const jsFilename = 'feature-suggestions: ';
import { CreatePostModal } from '../../modal/create-post/create-post-modal';

@Component({
  selector: 'feature-suggestions',
  templateUrl: './feature-suggestions.component.html',
  styleUrls: ['./feature-suggestions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class FeatureSuggestionsComponent implements OnDestroy, OnInit {
  private subscriptions = [];

  constructor(
    private modalController: ModalController,
    public globalService: GlobalService,
    private messageService: MessageService,
  ) {
  }

  public ngOnInit() {
    const $this = this;

    $this.messageService.reset({
      dbModelId: '1',
      dbModel: 'feature',
      showLoading: true,
      limit: 30,
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public saveAndClose() {

    this.modalController.dismiss();
  }

  async cancel() {
    await this.modalController.dismiss();
  }

  public sendMessage() {
    const $this = this;

    this.modalController.create({
      component: CreatePostModal,
      componentProps: {
        mode: 'feature',
      },
    }).then((modal) => {
      modal.present();

      modal.onDidDismiss().then((detail) => {
        if (detail && detail.data && detail.data.message && detail.data.message.length > 0) {
          const message = detail.data.message;

          console.log('message = ', message);

          $this.messageService.createMessage({
            messageType: 'feature-suggestion',
            dbModel: 'feature',
            dbModelId: '1',
            message: {
              data: {
                body: message,
              },
            },
          }).subscribe((res) => {
            if (res) {
              // $this.ionicAlertService.presentAlert('Message sent');
              $this.messageService.reset({
                dbModelId: '1',
                dbModel: 'feature',
                showLoading: true,
                limit: 30,
              });
            }
          });

          // $this.challengeService.sendMessage($this.foundChallenge._id, {
          //   body: message,
          // }).subscribe((success) => {
          //   if (success) {
          //     // $this.ionicAlertService.presentAlert('Message sent');
          //     $this.messageService.reset({
          //       challengeId: $this.foundChallenge._id,
          //     });
          //   }
          // });
        }
      });
    });
  }
}
