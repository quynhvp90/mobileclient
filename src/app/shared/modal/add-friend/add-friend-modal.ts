import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IContact } from '../../models/contact/contact.interface';
import { IonicAlertService } from '../../services/ionic.alert.service';
import { UserService } from '../../services/user.service';
import { UtilityService } from '../../services/utility.service';
// import { UserService, UtilityService, IonicAlertService } from '../../services';

const jsFilename = 'MuscleModal';

@Component({
  selector: 'add-friend',
  templateUrl: './add-friend-modal.html',
  styleUrls: ['./add-friend-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class AddFriendModal implements OnDestroy, OnInit {

  public contact: IContact;
  public isValidEmail = false;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private utilityService: UtilityService,
    private ionicAlertService: IonicAlertService,
  ) {
    const $this = this;
  }

  async dismiss() {
    await this.modalController.dismiss('close');
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    this.contact = {
      inviteMessage: this.userService.user.publicName + ' is inviting you to join LogReps so you can share workouts, and compete in daily challenges.',
      email: '',
    };
  }

  public async save() {
    if (!this.contact.email || this.contact.email.length === 0) {
      this.ionicAlertService.presentAlert('You must enter an email address', '', '');
      return ;
    }

    this.contact.email = this.contact.email.trim().toLowerCase();

    this.isValidEmail = this.utilityService.isValidEmail(this.contact.email);
    if (!this.isValidEmail) {
      this.ionicAlertService.presentAlert('That email is invalid', '', '');
      return ;
    }

    await this.modalController.dismiss(this.contact);
  }

  public ngOnDestroy() {
    //
  }

}
