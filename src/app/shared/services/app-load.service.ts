import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../../config';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';
import { GlobalService } from './global.service';

@Injectable()
export class AppLoadService {

  constructor(
    private httpClient: HttpClient,
    private storage: Storage,
    private globalService: GlobalService,
  ) { }

  initializeMyApp(): Promise<void> {
    const $this = this;
    return new Promise((resolve, reject) => {
      this.httpClient.get('assets/data/config.json').subscribe((res) => {
        const config: any = res;
        CONFIG.version = config.version;
        const localToken = localStorage.getItem('token');
        $this.storage.get('token').then((storageToken) => {
          if (localToken && localToken.length > 0) {
            $this.storage.set('token', localToken);
            storageToken = localToken;
            localStorage.removeItem('token');
          }
          $this.globalService.token = storageToken;

          $this.storage.get('lastSeenNotification').then((lastSeenNotification) => {
            $this.globalService.lastSeenNotification = lastSeenNotification;

            $this.storage.get('lastSeenChallenge').then((lastSeenChallenge) => {
              $this.globalService.lastSeenChallenge = lastSeenChallenge;
              resolve();
            });
          });
        });
      });
    });
  }
}
