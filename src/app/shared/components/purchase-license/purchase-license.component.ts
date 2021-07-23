import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, EventEmitter, OnInit, ViewEncapsulation, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, ModalController } from '@ionic/angular';
import { ApiService, BroadcastService, UserService, WorkoutService } from '../../../shared/services';
import { IUserDocument, IUserPublic } from '../../models/user/user.interface';
import { LicenseModal } from '../../modal/license/license-modal';

const jsFilename = 'login-code: ';

@Component({
  selector: 'purchase-license',
  templateUrl: './purchase-license.component.html',
  styleUrls: ['./purchase-license.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PurchaseComponent implements OnDestroy, OnInit {
  public notHasLicense = true;
  private subscriptions = [];
  private loader: HTMLIonLoadingElement = null;
  @Output() public purchased: EventEmitter<boolean> = new EventEmitter<boolean>();

  public auth = {
    showRegistrationCode: false,
    email: '',
    code: '',
  };

  public errMsg = '';
  public successMsg = '';
  public foundUser: IUserDocument = null;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private broadcastService: BroadcastService,
    private http: HttpClient,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private userService: UserService,
    private workoutService: WorkoutService,
    private modalController: ModalController,
  ) {
    const $this = this;
    this.foundUser = this.userService.user;

  }

  public async buy() {
    const $this = this;
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: LicenseModal,
      });

    modal.onDidDismiss().then((result) => {
      if (result !== null) {
        if (result.data) {
          $this.notHasLicense = false;
          $this.purchased.emit(true);
        }
      }
    });
    await modal.present();
  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;
    const user = this.userService.user;
    if (user.license) {
      this.notHasLicense = false;
    } else {
      this.notHasLicense = true;
    }
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

}
