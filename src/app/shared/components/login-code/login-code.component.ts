import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit, Input, ViewEncapsulation, ComponentFactoryResolver } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController } from '@ionic/angular';
import { ApiService, BroadcastService, UserService, WorkoutService, IonicAlertService, UtilityService, GlobalService } from '../../../shared/services';
import { IUserDocument, IUserPublic } from '../../models/user/user.interface';
import { PushNotificationService } from '../../services/push-notification.service';

const jsFilename = 'login-code: ';

@Component({
  selector: 'login-code',
  templateUrl: './login-code.component.html',
  styleUrls: ['./login-code.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class LoginCodeComponent implements OnDestroy, OnInit {
  @Input() public mode = 'button';  
  private subscriptions = [];
  private loaderEmail: HTMLIonLoadingElement = null;
  private loaderCode: HTMLIonLoadingElement = null;

  public auth = {
    email: '',
  };

  public errMsg = '';
  public foundUser: IUserDocument = null;

  public phones: {
    _id: string;
    number: string;
  }[] = [];

  public emails: {
    providerId: string;
    providerType: string;
    email: string;
  }[] = [];

  constructor(
    private router: Router,
    private broadcastService: BroadcastService,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private userService: UserService,
    private ionicAlertService: IonicAlertService,
    private workoutService: WorkoutService,
    private pushNotificationService: PushNotificationService,
    public globalService: GlobalService,
    private utilityService: UtilityService,
  ) {
    const $this = this;
    this.foundUser = this.userService.user;
  }

  public initAuthDetails() {
    const $this = this;
    $this.phones = [];
    $this.emails = [];
    if (this.foundUser) {
      if (this.foundUser.phones && this.foundUser.phones.length > 0) {
        $this.foundUser.phones.forEach((phone) => {
          if (phone.verified) {
            $this.phones.push({
              _id: phone._id,
              number: phone.number,
            });
          }
        });
      }
      if (this.foundUser.emails) {
        $this.foundUser.emails.forEach((email) => {
          if (email.verified) {
            $this.emails.push({
              providerId: email.providerId,
              providerType: email.providerType,
              email: email.email,
            });
          }
        });
      }
    }

  }

  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loaderEmail = loader;
    });

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loaderCode = loader;
    });

    const subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        console.log('received broadcast login');
        $this.workoutService.resetActiveWorkout();
        this.broadcastService.broadcast('reload-data');
        this.router.navigate(['/tabs/activities']);
      }
    });
    this.subscriptions.push(subscription);

    this.initAuthDetails();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public register() {
    const $this = this;
    $this.registerEmailPhone(this.auth.email);
  }

  public registerEmailPhone(emailOrPhone: string) {
    const msgHdr = 'register: ';
    const $this = this;
    $this.errMsg = '';

    if (!emailOrPhone || emailOrPhone.length === 0) {
      this.ionicAlertService.presentAlert('You must enter an email address or phone number', '', '');
      return ;
    }

    emailOrPhone = emailOrPhone.trim().toLowerCase();

    if (emailOrPhone.indexOf('@') >= 0) {
      console.log('emailOrPhone = ', emailOrPhone);
      if (!this.utilityService.isValidEmail(emailOrPhone)) {
        this.ionicAlertService.presentAlert('That email is invalid', '', '');
        return;
      }
    } else {
      emailOrPhone = emailOrPhone.replace(/[^0-9]/g, '');
      console.log('emailOrPhone = ', emailOrPhone);
      const isValidPhone = emailOrPhone.match(/([0-9]+)/gi);
      if (!isValidPhone) {
        this.ionicAlertService.presentAlert('That email or phone number is invalid', '', '');
        return;
      }
      if (emailOrPhone[0] === '1') {
        emailOrPhone = emailOrPhone.substr(1);
      }
      console.log('emailOrPhone = ', emailOrPhone);
      if (emailOrPhone.length !== 10) {
        this.ionicAlertService.presentAlert('That phone number is not a valid 10 digit U.S. mobile number', '', '');
        return;
      }
    }
    console.log('emailOrPhone = ', emailOrPhone);

    $this.auth.email = emailOrPhone;

    // $this.auth.email
    $this.loaderEmail.present();

    this.apiService.post({
      resource: 'auth/validate-email',
      payload: {
        email: $this.auth.email,
      },
    }).subscribe((res: any) => {
      // this.auth.code
      $this.promptForCode();
    }, (err) => {
      console.error('err = ', err);
      $this.errMsg = 'Sorry - there was an error';
      if (err && err.error && err.error.message) {
        $this.errMsg = err.error.message;
      }
    }, () => {
      $this.loaderEmail.dismiss();
    });
  }

  public promptForCode() {
    const $this = this;
    $this.ionicAlertService.presentAlertPrompt('Enter the 4 character code that was sent to ' + this.auth.email, '', 'code', 'enter 4 character code', (res) => {
      console.log('res = ', res);
      $this.confirmCode(res.code);
    });
  }

  public addEmailOrPhone() {
    const $this = this;
    $this.ionicAlertService.presentAlertPrompt('Enter an email address or U.S. mobile phone number', '', 'emailPhone', 'email or phone', (res) => {
      if (res && res.emailPhone) {
        $this.registerEmailPhone(res.emailPhone);
      }
    });
  }

  public addEmail() {
    const $this = this;
    $this.ionicAlertService.presentAlertPrompt('Enter an email address', '', 'email', 'email address', (res) => {
      if (res && res.email) {
        $this.registerEmailPhone(res.email);
      }
    });
  }

  public addPhone() {
    const $this = this;
    $this.ionicAlertService.presentAlertPrompt('Enter a U.S. mobile number', '', 'phone', 'phone number', (res) => {
      console.log('res = ', res);
      if (res && res.phone) {
        $this.registerEmailPhone(res.phone);
      }
    });

  }

  public confirmCode(code: string) {
    const $this = this;
    const msgHdr = 'confirmCode: ';

    $this.errMsg = '';

    if (!code) {
      $this.ionicAlertService.presentAlert('Please enter a valid 4 character code');
      setTimeout(() => {
        $this.promptForCode();
      }, 2000);
      return;
    }
    code = code.replace(/\s/g, '');
    code = code.toUpperCase();

    if (code.length !== 4) {
      $this.ionicAlertService.presentAlert('Please enter a valid 4 character code');
      setTimeout(() => {
        $this.promptForCode();
      }, 2000);
      return;
    }

    console.log('showing loader');
    $this.loaderCode.present();

    this.apiService.post({
      resource: 'auth/validate-code',
      payload: {
        email: $this.auth.email,
        userId: $this.userService.user._id,
        code: code,
      },
    }).subscribe((res: any) => {
      this.userService.login(res);
      $this.foundUser = this.userService.user;
      $this.initAuthDetails();
      if ($this.globalService.isCapacitor) {
        $this.pushNotificationService.requestToken();
      }
    }, (err) => {
      console.error('err = ', err);
      $this.errMsg = 'Sorry - there was an error';
      if (err && err.error && err.error.message) {
        $this.errMsg = err.error.message;
      }
    }, () => {
      $this.loaderCode.dismiss();
    });
  }

  public logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
