import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SocialChatComponent } from './social-chat.component';
import { enterFromRight } from '../../../shared/animations/enter-from-right';
import { leaveToRight } from '../../../shared/animations/leave-to-right';
import { IonicAlertService, UserService } from 'src/app/shared/services';

const jsFilename = 'social-chat.service: ';
@Injectable()
export class SocialChatService {
  constructor(
    private modalController: ModalController,
    private ionicAlertService: IonicAlertService,
    private userService: UserService) {
  }

  public openChat(options: {
    userIds?: string[],
    chatroomId?: string,
  }) {
    const msgHdr = jsFilename + 'openChat(): ';

    let componentProps: any = {};
    if (options.userIds) {
      const userIds = options.userIds;
      if (userIds.indexOf(this.userService.user._id) < 0) {
        userIds.push(this.userService.user._id);
      }

      if (userIds.length < 2) {
        this.ionicAlertService.presentAlert('Sorry', 'You can\'t chat with yourself 🤔 !?');
        return;
      }

      componentProps = {
        userIds: userIds,
      };
    } else if (options.chatroomId) {
      componentProps = {
        chatroomId: options.chatroomId,
      };
    } else {
      console.error(msgHdr + 'unexpected state of not userIds or chatroomId');
      return;
    }

    this.modalController.create({
      component: SocialChatComponent,
      enterAnimation: enterFromRight,
      leaveAnimation: leaveToRight,
      componentProps: componentProps,
    }).then((modal) => {
      modal.onDidDismiss().then((result) => {
        if (result !== null && result.data !== 'close') {
          console.log('result = ', result);
        }
      });
      modal.present();
    });
  }
}
