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


@Component({
  templateUrl: './confirm.component.html',
  providers: [],
  styleUrls: ['./confirm.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ConfirmComponent implements OnInit, OnDestroy {
  public message = '';
  public ajaxRunning = false;
  public isConfirmed = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService) {}

  public ngOnInit() {
    this.ajaxRunning = true;
    const subscription = this.activatedRoute.queryParams.subscribe((params: Params) => {
      const userId = params['uid'];
      const activity = params['activity'];
      const token = params['token'];

      if (!userId || !activity || !token) {
        this.message = 'The link you provided is missing some information';
        return;
      }

      this.message = 'Confirming your email address...';

      const subConfirm = this.userService.confirm(userId, activity, token).subscribe((resp) => {
        if (resp === false) {
          this.message = 'There was an error processing your request';
        } else {
          this.message = 'Your email address has been confirmed';
          this.isConfirmed = true;
        }
      });
      this.subscriptions.push(subConfirm);

      this.ajaxRunning = false;
    });
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public login() {
    this.router.navigate(['/login']);
  }
}
