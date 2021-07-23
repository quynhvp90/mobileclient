import { Component, OnInit, OnDestroy, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

const jsFilename = 'CreatePostModal';
import { UserService } from '../../services';

@Component({
  selector: 'create-post-modal',
  templateUrl: './create-post-modal.html',
  styleUrls: ['./create-post-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class CreatePostModal implements OnDestroy, OnInit {
  @ViewChild('messageTextArea', { static: false }) messageTextArea: any;

  public title = 'Create Post';
  public action = 'POST';
  public mode = 'post';
  public placeholder = 'Type a message like - great job everyone 🙂';

  public message = null;

  constructor(
    private modalController: ModalController,
  ) {
    const $this = this;
    console.log('this.mode = ', this.mode);

    setTimeout(() => {
      this.messageTextArea.setFocus();
    }, 500);
  }
  ionViewWillEnter() {
    // this.exerciseType = this.navParams.get('exerciseType');
  }
  async dismiss() {
    await this.modalController.dismiss();
  }

  async post() {
    await this.modalController.dismiss({
      message: this.message,
    });
  }
  public ngOnInit() {
    if (this.mode === 'comment') {
      this.title = 'Create Comment';
      this.action = 'SAVE';
      this.placeholder = 'Type a comment like - great job 🙂';
    } else if (this.mode === 'feature') {
      this.title = 'Feature Suggestion';
      this.action = 'SAVE';
      this.placeholder = 'Type a feature suggestion like - "I would really like to be able to...."';
    }
  }

  public ngOnDestroy() {
    //
  }

}
