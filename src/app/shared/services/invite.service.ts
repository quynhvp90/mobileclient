import { Injectable, Optional, SkipSelf } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ShareService } from './share.service';
import { AddFriendModal } from '../modal/add-friend/add-friend-modal';
import { ContactService } from './contact.service';
import { UserService } from '../services/user.service';

@Injectable()
export class InviteService {
  constructor(
    @Optional() @SkipSelf() prior: InviteService,
    private actionSheetController: ActionSheetController,
    private userService: UserService,
    private shareService: ShareService,
    private contactService: ContactService,
    private modalController: ModalController,
  ) {
    if (prior) {
      return prior;
    }
  }

  public inviteViaEmail() {
    const $this = this;
    $this.modalController.create({
      component: AddFriendModal,
    }).then((modal) => {
      modal.onDidDismiss().then((detail) => {
        if (detail !== null && detail.data !== 'close') {
          // add Friend
          const contact = detail.data;
          $this.contactService.addContact(contact).subscribe((data) => {
            console.log('added friend', data);
            // this.getData({
            //   showLoading: true,
            //   isReload: true,
            // });
          });
        }
      });
      modal.present();
    });
  }

  public inviteViaText() {
    // this.userService.createInvitationLink().subscribe((link) => {
    //   console.log('link = ', link);
    //   if (!link) {
    //     return; // was error;
    //   }

    //   this.shareService.showSharePopup({
    //     text: 'Join me on LogReps, a super easy mobile app to help you get in shape',
    //     url: link,
    //     dialogTitle: link,
    //     clipboardValue: link,
    //     clipboardConfirmText: 'The link has been copied to your clipboard',
    //   });
    // });
  }

  public showActionsheet() {
    const $this = this;
    if (this.userService.user.publicName.toLowerCase() === 'someone') {
      // this.userService.promptName({
      //   title: 'Your friends will want to know who this is from.  Time to name yourself on LogReps!',
      // }).then((res) => {
      //   $this.showActionsheetContinue();
      // });

      return;
    }
    $this.showActionsheetContinue();
  }

  public showActionsheetContinue() {
    const $this = this;
    this.actionSheetController.create({
      header: 'Invite a friend',
      buttons: [{
        text: 'Via Email',
        // role: 'destructive',
        handler: () => {
          $this.inviteViaEmail();
        },
      }, {
        text: 'Via SMS/Social Meda/Link',
        handler: () => {
          $this.inviteViaText();
        },
      }, {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        },
      }],
    }).then((actionSheet) => {
      actionSheet.present();
    });
  }
}
