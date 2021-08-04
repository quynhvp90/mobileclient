import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { NgForm, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { LoginService } from '../../services/login.service';
import { ActivityService, BroadcastService, IonicAlertService, IUpdatePriority, OrganizationService, ToastService, UserService, WorkoutService } from '../../services';

import { AlertService } from '../../services/alert.service';
import { CONFIG } from '../../../config';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { Platform, LoadingController } from '@ionic/angular';
// import { Deploy } from 'cordova-plugin-ionic';
@Component({
  selector: 'login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, OnDestroy {
  public loggingIn = false;
  public isCordova = false;

  private subscriptions: Subscription[] = [];
  private loader: HTMLIonLoadingElement = null;

  public user = {
    email: '',
    password: '',
    userId: '',
    token: '',
  };

  public version = CONFIG.version;
  public apiEndpoint = environment.api;

  public enablePassword = true;

  public errorMessage = null;

  public loading = false;
  public mode = 'login';
  public currentUser = null;
  public emailEnabled = true;

  public codeForVerifyLogin = {
    codeA: '',
    codeB: '',
    codeC: '',
    codeD: '',
    codeE: '',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer,
    private ionicAlertService: IonicAlertService,
    private authService: AuthService,
    private loginService: LoginService,
    private organizationService: OrganizationService,
    private broadcastService: BroadcastService,
    private loadingController: LoadingController,
    private userService: UserService,
    private platform: Platform,
    // iconRegistry: MatIconRegistry,
    // sanitizer: DomSanitizer,
  ) {
    let subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        console.log('received broadcast login');
        this.organizationService.getOrganizations(null).subscribe((res) => {
          if (this.organizationService.organization && this.organizationService.organizations && this.organizationService.organizations.length > 1) {
            this.router.navigate(['list-org-screen']);
            return;
          }
          this.router.navigate(['']);
        });
      }
    });
    this.subscriptions.push(subscription);

    subscription = this.route.queryParams
    .subscribe((queryParams) => {
      console.log('queryParams = ' , queryParams);
      if (queryParams.email) {
        this.user.email = queryParams.email;
        this.user.token = queryParams.token;
        this.user.userId = queryParams.uid;
        this.emailEnabled = false;
      }

    });

    this.platform.ready().then(() => {
      this.isCordova = this.platform.is('cordova');
    });
  }

  public ngOnInit(): void {
    // this.authenticationService.logout();
    const $this = this;

    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public login() {
    const $this = this;
    this.loading = true;

    this.errorMessage = 'login button pressed;';

    const payload = this.user;

    this.errorMessage = 'payload created';

    this.loginService.login(payload)
      .subscribe((user) => {
        this.loading = false;
        this.errorMessage = 'login received';

        console.log('user = ', user);
        if (user.error) {
          console.error(user.error.message);
          $this.errorMessage = user.error.message;
          $this.ionicAlertService.presentAlert(user.error.message);
          return;
        }
        this.errorMessage = 'user.token = ' + user.token;

        if (user && user.token) {
          console.log('saving token to local storage');
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.errorMessage = 'navigating, and token = ' + user.token;
        }
        this.errorMessage = 'not token, should be toasting error message = ' + user.token;

      });
  }

  public passwordReset() {
    const $this = this;
    $this.loader.present();

    this.userService.passwordReset(this.user.email).subscribe((res) => {
      if (res) {
        this.errorMessage = 'reset password done';
        $this.ionicAlertService.presentAlert('Please check your email for reset instructions');
      }
      $this.loader.dismiss();
    });
  }

  codeChange(inputName: string) {
    console.log('codeChange');
    const idCodeB = this.renderer.selectRootElement('#idCodeB');
    const idCodeC = this.renderer.selectRootElement('#idCodeC');
    const idCodeD = this.renderer.selectRootElement('#idCodeD');
    const idCodeE = this.renderer.selectRootElement('#idCodeE');

    if (inputName === 'idCodeA') {
      this.codeForVerifyLogin.codeA = this.codeForVerifyLogin.codeA.toLocaleUpperCase();
      idCodeB.focus();
    } else if (inputName === 'idCodeB') {
      this.codeForVerifyLogin.codeB = this.codeForVerifyLogin.codeB.toLocaleUpperCase();
      idCodeC.focus();
    } else if (inputName === 'idCodeC') {
      this.codeForVerifyLogin.codeC = this.codeForVerifyLogin.codeC.toLocaleUpperCase();
      idCodeD.focus();
    } else if (inputName === 'idCodeD') {
      this.codeForVerifyLogin.codeD = this.codeForVerifyLogin.codeD.toLocaleUpperCase();
      idCodeE.focus();
    } else if (inputName === 'idCodeE') {
      this.codeForVerifyLogin.codeE = this.codeForVerifyLogin.codeE.toLocaleUpperCase();
    }
  }

  verifyCode() {
    if (this.codeForVerifyLogin.codeA === null || this.codeForVerifyLogin.codeA === '' ||
      this.codeForVerifyLogin.codeB === null || this.codeForVerifyLogin.codeB === '' ||
      this.codeForVerifyLogin.codeC === null || this.codeForVerifyLogin.codeC === '' ||
      this.codeForVerifyLogin.codeD === null || this.codeForVerifyLogin.codeD === '' ||
      this.codeForVerifyLogin.codeE === null || this.codeForVerifyLogin.codeE === '') {
      // this.ionicAlertService.error('Please enter all 5 boxes');
      return;
    }

    this.loading = true;
    const activity = 'registration';
    const token = this.codeForVerifyLogin.codeA + this.codeForVerifyLogin.codeB + this.codeForVerifyLogin.codeC
      + this.codeForVerifyLogin.codeD + this.codeForVerifyLogin.codeE;
    const uid = this.currentUser.id;
    // this.authenticationService.confirm(activity, token, uid)
    //   .subscribe((user) => {
    //     if (!user) {
    //       this.ionicAlertService.success('Verify code is successfully');
    //       this.router.navigate(['/batch-data-entry']);
    //     } else {
    //       this.ionicAlertService.error('User not found or invalid code');
    //     }
    //   });
  }

  public loginSSO(provider: string) {
    const subscription = this.authService.doLogin(provider).subscribe((val) => {
      subscription.unsubscribe();
      if (!val.authenticated) {
        return;
      }

      const $this = this;
      console.log('val = ', val);
      $this.loggingIn = true;

      const loginSub = this.loginService
        .login({
          provider: val.provider,
          code: val.code,
          referredBy: null,
        })
        .subscribe((isSuccess) => {
          if (isSuccess) {
            // this.toastService.activate(`Successfully logged in`);
            // if (this.userService.isLoggedIn) {
            //   this.navigate('/app/explore');
            // } else {
            //   $this.loggingIn = false;
            // }
          } else {
            $this.loggingIn = false;
          }
        });
      $this.subscriptions.push(loginSub);
    });
    this.subscriptions.push(subscription);
  }

  public checkUpdate() {
    try {
      // Deploy.getCurrentVersion().then((currentVersion) => {
      //   Deploy.sync({
      //     updateMethod: 'background',
      //   }).then((resp) => {
      //     this.errorMessage = 'currentVersion.versionId ' +  currentVersion.versionId + ', resp.versionId = ' + resp.versionId;

      //     if (currentVersion.versionId !== resp.versionId) {
      //       // We found an update, and are in process of redirecting you since you put auto!
      //     } else {
      //       // No update available
      //     }
      //   });
      // });
    } catch (err) {
      this.errorMessage = 'deployUpdate: err ' +  err;
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:
      // Deploy.monitoring.exception(err);
    }
  }
}
