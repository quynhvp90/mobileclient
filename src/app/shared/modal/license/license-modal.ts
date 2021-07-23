import { Component, Input, Output, EventEmitter, OnInit, ViewChild , OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ModalController, NavParams, LoadingController } from '@ionic/angular';
import {
  FormControl, FormsModule, ReactiveFormsModule,
  FormGroup, FormBuilder, Validators,
  AbstractControl, NG_VALIDATORS, Validator, ValidatorFn,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StripeService, StripeCardComponent,  Elements, Element as StripeElement, ElementOptions, ElementsOptions, StripeInstance, StripeFactoryService } from 'ngx-stripe';
import {
  ActivityLogService,
  AlertService,
  ActivityService,
  BroadcastService,
  IonicAlertService,
  OrdersService,
  UserService } from '../../services';

import { IActivity, IActivityDocument } from '../../models/activity/activity.interface';

const jsFilename = 'LicenseModal';

@Component({
  selector: 'license-modal',
  templateUrl: './license-modal.html',
  styleUrls: ['./license-modal.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class LicenseModal implements OnDestroy, OnInit {
  private subscriptions = [];
  private elements: Elements;
  private card: StripeElement;
  public submitted = false;
  private loader: HTMLIonLoadingElement = null;
  public cardModel = {
    name: '',
    email: '',
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    address_country: '',
    currency: 'USD',
  };
  public formErrors = {
    email: '',
    name: '',
    cardError: '',
  };

  public validationMessages = {
    email: {
      invalidEmail: 'Please enter a valid email.',
    },
    name: {
      invalidName: 'Card Holder is required',
    },
    cardError: '',
  };

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en',
  };
  customWindow: any = window;

  stripeForm: FormGroup;
  public stripe: StripeInstance;
  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private activityService: ActivityService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private stripeFactory: StripeFactoryService,
    private stripeService: StripeService,
    private userService: UserService,
    private ordersService: OrdersService,
    private loadingController: LoadingController,
    private ionicAlertService: IonicAlertService,
    private router: Router,
  ) {
    const $this = this;
  }
  ionViewWillEnter() {
    // this.parentPage = this.navParams.get('parentPage');
  }
  async dismiss(result?: boolean) {
    await this.modalController.dismiss(result);
  }
  public ngOnInit() {
    const msgHdr = jsFilename + 'ngOnInit: ';
    const $this = this;
    $this.loadingController.create({
      translucent: true,
    }).then((loader) => {
      $this.loader = loader;
    });

    this.stripe = this.stripeFactory.create(this.customWindow.appkeys.stripe.key);
    this.buildForm();
    this.stripe.elements(this.elementsOptions)
      .subscribe((elements) => {
        this.elements = elements;
        // Only mount the element the first time
        if (!this.card) {
          this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '50px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#CFD7E0',
                },

              },
            },
            hidePostalCode: true,
          });
          this.card.mount('#card-element');
        }
      });
  }

  async buy() {
    const $this = this;
    this.submitted = true;
    this.stripeForm.controls['email'].updateValueAndValidity();
    this.stripeForm.controls['name'].updateValueAndValidity();

    if (this.stripeForm.valid) {
      $this.loader.present();
      this.stripe
        .createToken(this.card, this.cardModel)
        .subscribe((result) => {
          if (result.token) {
            const user = this.userService.user;
            user.primaryEmail = this.cardModel.email;
            user.license = {
              amount: 2.99,
              name: 'logreps Basic',
            };
            user.stripe = result.token;
            // set license to current user
            const subscription = this.ordersService.create(user).subscribe((resultUpdate) => {
              console.log('Update lisence to CurrentUser: res = ', resultUpdate);
              // update user cache
              this.userService.user.license = user.license;
              this.ionicAlertService.presentAlert('Success', '', 'Purchase Success!');

              this.dismiss(true);
              setTimeout(() => {
                $this.loader.dismiss();
              }, 1000);

            });
            this.subscriptions.push(subscription);

          } else if (result.error) {
            this.formErrors.cardError = result.error.message;
            this.dismiss(false);
            console.error('license-modal = ', result.error.message);
          }
        });
    }

  }

  public ngOnDestroy() {
    //
  }

  private buildForm(): void {
    const $this = this;
    this.stripeForm = this.fb.group({
      email: [this.cardModel.email, [
        $this.emailValidator(),
      ],
      ],
      name: [this.cardModel.name, [
        $this.nameValidator(),
      ],
      ],
      address_line1: [this.cardModel.address_line1, [],
      ],
      address_line2: [this.cardModel.address_line2, [],
      ],
      address_country: [this.cardModel.address_country, [],
      ],
      address_city: [this.cardModel.address_city, [],
      ],
      address_state: [this.cardModel.address_state, [],
      ],
    });
    const subscription = this.stripeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.subscriptions.push(subscription);

    this.stripeForm.reset();
  }
  private isValidEmail(email): boolean {
    // tslint:disable
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // tslint:enable

    return re.test(email);
  }
  private emailValidator(): ValidatorFn {
    const $this = this;
    return (control: AbstractControl): {[key: string]: any} => {
      if (!$this.submitted) {
        return null;
      }
      const email = control.value;
      const isValid = this.isValidEmail(email);
      return !isValid ? { invalidEmail: { email } } : null;
    };
  }

  private nameValidator(): ValidatorFn {
    const $this = this;
    return (control: AbstractControl): {[key: string]: any} => {
      if (!$this.submitted) {
        return null;
      }
      const name = control.value;
      if (!name || name.length < 1 || name.length > 30) {
        return { invalidName: 'invalid' };
      }

      return null;
    };
  }

  private onValueChanged(data?: any): void {
    if (!this.stripeForm) { return; }
    const form = this.stripeForm;

    for (const field of Object.keys(this.formErrors)) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key of Object.keys(control.errors)) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

}
