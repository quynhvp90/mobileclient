declare const Rollbar: any;

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ToastService } from './toast.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ModalController } from '@ionic/angular';
const jsFilename = 'exception.service: ';
import { Storage } from '@ionic/storage';

@Injectable()
export class ExceptionService {
  constructor(
    private router: Router,
    private modalController: ModalController,
    private storage: Storage,
    private toastService: ToastService) { }

  public catchBadResponse: (errorResponse: any) => Observable<any> = (errorResponse: any) => {
    // const res = <Response> errorResponse;
    const res = errorResponse;
    let err = null;

    const msgHdr = jsFilename + 'catchBadResponse: ';

    console.log(msgHdr + ', res = ', res);
    try {
      console.log(msgHdr + ', res = ', JSON.stringify(res, null, 4));
    } catch (e) {
      console.error(msgHdr + ' unable to parse e ', e);
    }
    if (res && res.json) {
      err = res.json();
    }
    console.log(msgHdr + ', err = ', err);

    if (res && (res.status === 401 || res.status === 403))  {
      const message: any = res;
      this.toastService.activate(`${message.error.message}`, 'error');
      console.log(msgHdr + 'exception go to login');
      this.modalController.dismiss('close');
      localStorage.removeItem('token');
      this.storage.remove('token');
      this.storage.clear();
      this.router.navigate(['/login']);
      return of(false);
    }
    if (res && res.status === 404 && res.url.indexOf('api/token') > -1)  {
      const message: any = res;
      console.log(msgHdr + ' message.error.message');
      this.toastService.activate('Email or password invalid.', 'error');
      return of(false);
    }

    if (res && res.customMessage && res.customMessage.length) {
      this.toastService.activate(res.customMessage, 'error');
      return of(false);
    }

    if (res && res.error && res.error.message) {
      this.toastService.activate(res.error.message, 'error');
      return of(false);
    }

    if (err && err.message) {
      this.toastService.activate(`${err.message}`, 'error');
      console.error(`${err.message}`, 'error');
    } else if (err && err.code && err.code === 'NotFoundError') {
      this.toastService.activate('Your request failed, because we could not find a related item in the system', 'error');
      console.error('Your request failed, because we could not find a related item in the system', 'error');
    } else {
      console.error(msgHdr + 'toasting on error');
      const emsg = err ?
        (err.error ? err.error :
        (err.message ? err.message : JSON.stringify(err))) :
        (res.statusText || 'unknown error');
      this.toastService.activate(`Error - Bad Response - ${emsg}`, 'error');
      console.error(`Error - Bad Response - ${emsg}`, 'error');
    }
    // if (Rollbar) Rollbar.error(msgHdr);

    return of(false);
  }
}
