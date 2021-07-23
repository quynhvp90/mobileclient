import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { IContact, IContactDocument } from '../../models/contact/contact.interface';
import { IUserDocument } from '../../models/user/user.interface';

const jsFilename = 'MuscleModal';

@Component({
  selector: 'show-friend',
  templateUrl: './show-friend-modal.html',
  styleUrls: ['./show-friend-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ShowFriendModal implements OnDestroy, OnInit {
  @Input() public user: any; // this is the lookup field of contacts

  public isValidEmail = false;
  public errMsg = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
  ) {
    const $this = this;
  }

  ionViewWillEnter() {
    this.user = this.navParams.get('user');
  }
  async dismiss() {
    await this.modalController.dismiss('close');
  }
  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
  }

  public async remove() {
    await this.modalController.dismiss(this.user);
  }

  public ngOnDestroy() {
    //
  }

}
