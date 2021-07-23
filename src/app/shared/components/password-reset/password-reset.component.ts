import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, Renderer } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { NgForm, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { BroadcastService } from '../../services/broadcast.service';
import { CONFIG } from '../../../config';
import { Subscription } from 'rxjs/Subscription';
import { UtilityService } from '../..//services/utility.service';
import { ToastService } from '../../services/toast.service';
import { IonicAlertService } from '../../services';

@Component({
  templateUrl: './password-reset.component.html',
  providers: [],
  styleUrls: ['./password-reset.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PasswordResetComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public submitted = false;

  public ajaxRunning = false;
  public message = '';
  public passwordChanged = false;
  public errorMessage = '';

  public model = {
    email: null,
    password: null,
    userId: null,
    token: null,
  };

  public formErrors = {
    email: '',
    password: '',
  };

  public validationMessages = {
    email: {
      invalidEmail: 'That is not a valid email.',
    },
    password: {
      invalidPassword: 'Password must be between 7 and 30 characters long.',
    },
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private utilityService: UtilityService,
    private ionicAlertService: IonicAlertService,
    private loginService: LoginService,
    private broadcastService: BroadcastService,
    private userService: UserService) {}

  public ngOnInit() {
    // subscribe to router event

    this.ajaxRunning = true;
    let subscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.model.userId = params['uid'];
      this.model.token = params['token'];
      this.model.email = params['email'];

      if (!this.model.userId || !this.model.token) {
        this.message = 'The link you clicked on is missing some required fields';
        return;
      }

      this.ajaxRunning = false;
    });
    this.subscriptions.push(subscription);

    subscription = this.broadcastService.subjectUniversal.subscribe((msg) => {
      if (msg.name === 'login') {
        console.log('received broadcast login');
        this.router.navigate(['']);
      }
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public passwordReset() {
    const $this = this;
    this.submitted = true;

    const subscription = $this.userService
      .patch({
        // email: $this.model.email,
        _id: $this.model.userId,
        token: $this.model.token,
        password: $this.model.password,
      })
      .subscribe((isSuccess) => {
        if (isSuccess) {
          this.toastService.activate('Successfully set password', 'success');
          const loginSub = $this.loginService
            .login(this.model)
            .subscribe((user) => {
              if (user.error) {
                console.error(user.error.message);
                $this.errorMessage = user.error.message;
                this.ionicAlertService.presentAlert('Error', '', user.error.message);
                return;
              }
            });
          $this.subscriptions.push(loginSub);
        } else {
          this.passwordChanged = false;
        }
      });
    $this.subscriptions.push(subscription);
  }
}
