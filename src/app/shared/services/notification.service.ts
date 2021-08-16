import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { Storage } from '@ionic/storage';
import { INotificationLogDocument } from '../models/notification-log.interface';
import { GlobalService } from './global.service';
import { UserService } from './user.service';
import { BroadcastService } from './broadcast.service';

const jsFilename = 'notificationService: ';
@Injectable()
export class NotificationService {
  public filter: {
    where?: {
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  } = {
    where: {},
    limit:15,
    skip: 0,
    sortField: 'created',
    sortOrder: 'desc',
  };

  public loading = false;
  public showBell = false;
  public skip = 15;
  public foundNotifications: INotificationLogDocument[] = [];
  public count = null;
  private bellInterval = null;

  constructor(
    private exceptionService: ExceptionService,
    private storage: Storage,
    private globalService: GlobalService,
    private userService: UserService,
    private broadcastService: BroadcastService,
    private apiService: ApiService) {

    const $this = this;

    $this.broadcastService.subjectUniversal.subscribe((msg) => {
      const msgHdr = jsFilename + 'broadcastService: ';

      if (msg.name === 'login') {
        this.startBellInterval();
      } else if (msg.name === 'current-user-retrieved') {
        this.startBellInterval();
      }
    });
  }

  private startBellInterval() {
    if (this.bellInterval) {
      clearInterval(this.bellInterval);
    }
    this.bellInterval = setInterval(() => {
      this.getBell();
    }, 1000);
    this.getBell();
  }

  public userSeenNotifications() {
    this.globalService.lastSeenNotification = new Date();
    this.storage.set('lastSeenNotification', new Date());
  }

  public reset(options?: {
    showLoading?: boolean,
    isReload?: boolean,
  }) {
    if (this.userService.user) {
      this.clear();
      this.getData(options);
    } else {
      console.log('not resetting as no user');
    }
  }

  public clear() {
    this.foundNotifications = [];
    this.filter.skip = 0;
    this.filter.limit = 15;
  }

  public getData(options?: {
    showLoading?: boolean,
    isReload?: boolean,
  }) {
    return new Promise((resolve, reject) => {
      const msgHdr = 'getData: ';
      const $this = this;

      const enabled = false;
      if (!enabled) {
        return resolve({
          count: 0,
          items: [],
        });
      }

      $this.loading = false;
      if (options && options.showLoading) {
        $this.loading = true;
      }

      if (options && options.isReload) {
        $this.clear();
      }

      this.filter.where = {
        archived: false,
        notificationType: {
          $in: [
            'activity-logged-emote',
            'challenge-invite',
            'challenge-update',
            'challenge-message',
            'chat',
          ],
        },
      };

      const requestOptions = {
        queryParams: [{
          key: 'filter',
          value: this.filter,
        }],
      };

      let query = '';
      if (requestOptions && requestOptions.queryParams) {
        requestOptions.queryParams.forEach((option) => {
          if (typeof option.value === 'string') {
            query += '&' + option.key + '=' + option.value;
          } else {
            query += '&' + option.key + '=' + encodeURIComponent(JSON.stringify(option.value));
          }
        });
      }
      const setting: ISetting = {
        resource: 'notifications',
        queryString: query,
      };

      this.apiService.get(setting)
      .subscribe((results: {
        count: number,
        items: INotificationLogDocument[],
      }) => {
        results.items.forEach((item) => {
          $this.hydrateNotificationLink(item);
        });
        $this.foundNotifications = $this.foundNotifications.concat(results.items);
        $this.loading = false;

        $this.showBell = false;
        $this.count = results.count;
        if ($this.foundNotifications && $this.foundNotifications.length > 0) {
          if (!this.globalService.lastSeenNotification || new Date($this.foundNotifications[0].created).getTime() > new Date(this.globalService.lastSeenNotification).getTime()) {
            $this.showBell = true;
          }
        }

        resolve(results);
      }), catchError((err) => {
        $this.loading = false;
        reject(err);
        return $this.exceptionService.catchBadResponse(err);
      });
    });
  }

  public getBell() {
    return new Promise((resolve, reject) => {
      const msgHdr = 'getBell: ';
      const $this = this;

      const enabled = false;
      if (!enabled) {
        console.log('checking notifications is disabled');
        resolve({
          count: 0,
          items: [],
        });
        return;
      }

      const filter = {
        where: {
          archived: false,
          notificationType: {
            $in: [
              'activity-logged-emote',
              'challenge-invite',
              'challenge-update',
              'challenge-message',
              'chat',
            ],
          },
        },
        limit: 1,
        skip: 0,
        sortField: 'created',
        sortOrder: 'desc',
      };

      const requestOptions = {
        queryParams: [{
          key: 'filter',
          value: filter,
        }],
      };

      let query = '';
      if (requestOptions && requestOptions.queryParams) {
        requestOptions.queryParams.forEach((option) => {
          if (typeof option.value === 'string') {
            query += '&' + option.key + '=' + option.value;
          } else {
            query += '&' + option.key + '=' + encodeURIComponent(JSON.stringify(option.value));
          }
        });
      }
      const setting: ISetting = {
        resource: 'notifications',
        queryString: query,
      };

      this.apiService.get(setting)
      .subscribe((results: {
        count: number,
        items: INotificationLogDocument[],
      }) => {
        $this.showBell = false;
        const foundNotifications = results.items;

        if (foundNotifications && foundNotifications.length > 0) {
          if (!this.globalService.lastSeenNotification || new Date(foundNotifications[0].created).getTime() > new Date(this.globalService.lastSeenNotification).getTime()) {
            $this.showBell = true;
          }
        }

        resolve(results);
      }), catchError((err) => {
        reject(err);
        return $this.exceptionService.catchBadResponse(err);
      });
    });
  }

  private hydrateNotificationLink(foundNotificationLog: INotificationLogDocument) {
    if (!foundNotificationLog.lookups) {
      foundNotificationLog.lookups = {};
    }

    foundNotificationLog.lookups.class = 'background-not-read';
    if (!foundNotificationLog.viewed) {
      foundNotificationLog.lookups.class = 'background-read';
    }

    if (foundNotificationLog) {
      if (foundNotificationLog.dbModel === 'challenge') {
        if (foundNotificationLog.dbModelId) {
          foundNotificationLog.lookups.navLink = '/tabs/challenges/detail/' + foundNotificationLog.dbModelId;
        }
        return;
      }
      if (foundNotificationLog.dbModel === 'chatroom') {
        if (foundNotificationLog.dbModelId) {
          foundNotificationLog.lookups.navLink = '/tabs/social/chatrooms/' + foundNotificationLog.dbModelId;
        }
        return;
      }
      if (foundNotificationLog.dbModel === 'message') {
        if (foundNotificationLog.lookups && foundNotificationLog.lookups.message) {
          if (foundNotificationLog.lookups.message.dbModel === 'challenge') {
            if (foundNotificationLog.dbModelId) {
              foundNotificationLog.lookups.navLink = '/tabs/challenges/detail/' + foundNotificationLog.lookups.message.dbModelId;
            }
            return;
          }
        }
        return;
      }

    }
  }

  public updateNotifications(notificationId: string, payload: {
    viewed?: boolean,
    archived?: boolean,
  }) {
    const $this = this;

    let resource = 'notifications';
    if (notificationId && notificationId.length > 0) {
      resource = 'notifications/' + notificationId;
    }

    const setting: ISetting = {
      resource: resource,
      payload: payload,
    };

    return this.apiService.patch(setting)
      .pipe(
        map((resp) => {
          return resp;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

}
