import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { Observable } from 'rxjs/Observable';
import { ApiService, ISetting, IFilter } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { BroadcastService } from './broadcast.service';
import { IChallenge, IChallengeDocument, IChallengeDocumentHydrated, IChallengeUserHydrated } from '../models/challenge/challenge.interface';
import { map, catchError, finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { GlobalService } from './global.service';
import { UserService } from './user.service';

const jsFilename = 'ChallengeService: ';

@Injectable()
export class ChallengeService {
  public challengeInvites: IChallengeDocumentHydrated[] = [];
  public foundChallenge: IChallengeDocument = null;
  public showBell = false;

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private globalService: GlobalService,
    private userService: UserService,
    private storage: Storage,
    private apiService: ApiService) {

    this.broadcastService.state.subscribe(() => {
      // console.log(jsFilename + ': getting challenge on state change');
      // this.getChallenges({});
    });

    this.getBell();
  }

  public getChallenges(filter: IFilter): Observable<IChallengeDocument[]> {
    // this.loaderService.display(true);
    const $this = this;
    const msgHdr = jsFilename + 'getChallenges: ';
    console.info(msgHdr + 'filter = ', filter);

    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          skip: filter.skip || 0,
          limit: filter.limit || 50,
        },
      }],
    };

    if (filter) {
      requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
    }

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
      resource: 'challenges',
      queryString: query,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          const items = result.items;
          $this.sortChallengeTeams(items);
          $this.challengeInvites = items;
          $this.setChallengeTimes(<IChallengeDocumentHydrated[]> items);
          $this.setDefaults($this.challengeInvites);
          return <IChallengeDocumentHydrated[]> items;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }

  private sortChallengeTeams(foundChallenges: IChallengeDocument[]) {
    foundChallenges.forEach((foundChallenge) => {
      if (foundChallenge.teams && foundChallenge.teams.roster && foundChallenge.teams.roster.length > 1) {
        foundChallenge.teams.roster.sort((a, b) => {
          if (a.percentComplete > b.percentComplete) {
            return -1;
          }
          if (a.percentComplete < b.percentComplete) {
            return 1;
          }
          return 0;
        });
      }
    });
  }

  private setDefaults(foundChallenges: IChallengeDocument[]) {
    if (foundChallenges.length > 0) {
      // foundChallenges = foundChallenges.sort((a, b) => {
      //   let aOrder = 0;
      //   let bOrder = 0;
      //   if (a.advanced && a.advanced.displayOrder) {
      //     aOrder = a.advanced.displayOrder;
      //   }
      //   if (b.advanced && b.advanced.displayOrder) {
      //     bOrder = b.advanced.displayOrder;
      //   }
      //   if (aOrder < bOrder) {
      //     return 1;
      //   }
      //   if (aOrder > bOrder) {
      //     return -1;
      //   }
      //   return 0;
      // });

      foundChallenges.forEach((foundChallenge) => {
        if (!foundChallenge.advanced) {
          foundChallenge.advanced = {
          };
        }

        if (!foundChallenge.advanced.bannerImage) {
          foundChallenge.advanced.bannerImage = 'https://logreps-public.s3.amazonaws.com/images/banners/challenge-background-03.png';
        }
        if (!foundChallenge.advanced.thumbnailImage) {
          foundChallenge.advanced.thumbnailImage = 'https://logreps-public.s3.amazonaws.com/images/challenge-thumbnails/20210127/2.png';
        }
      });
    }
  }

  public getUsers(challengeId: string, filter: IFilter): Observable<{
    count: number,
    items: IChallengeUserHydrated[],
  }> {
    // this.loaderService.display(true);
    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          skip: filter.skip || 0,
          limit: filter.limit || 20,
        },
      }],
    };

    if (filter) {
      requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
    }

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
      resource: 'challenges/' + challengeId + '/users',
      queryString: query,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }

  public createChallenge(challenge: IChallenge) {

    const setting: ISetting = {
      resource: 'challenges/',
      payload: challenge,
    };

    return this.apiService
      .post(setting).pipe(
        map((res : IChallengeDocument) => {
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse));
  }

  public getChallenge(id: string) {
    const now = new Date();
    const fromDate = (now).setHours(0, 0, 0, 0);
    const toDate = (now).setHours(23, 59, 59, 0);
    const $this = this;

    let query = 'timezoneoffset=' + (new Date()).getTimezoneOffset();
    query += '&stats-from=' + fromDate + '&stats-to=' + toDate;

    const setting: ISetting = {
      resource: `challenges/${id}`,
      queryString: query,
    };

    return this.apiService
      .get(setting).pipe(
        map((challenge: IChallengeDocument) => {
          $this.foundChallenge = challenge;
          $this.setDefaults([$this.foundChallenge]);
          $this.sortChallengeTeams([challenge]);
          $this.setChallengeTimes(<IChallengeDocumentHydrated[]> [$this.foundChallenge]);
          return challenge;
        }), catchError((err) => {
          err.customMessage = 'There was a problem connecting with this challenge';
          return this.exceptionService.catchBadResponse(err);
        }),
    );
  }

  public deleteChallenge(challengeId: string) {
    const $this = this;
    const setting: ISetting = {
      resource: `challenges/${challengeId}`,
    };
    return this.apiService.delete(setting)
      .pipe(
        map(() => {
          $this.broadcastService.broadcast('update-challenges');
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public leaveChallenge(challengeId: string) {
    const $this = this;
    const setting: ISetting = {
      resource: `challenges/${challengeId}/leave`,
    };
    return this.apiService.post(setting)
      .pipe(
        map(() => {
          $this.broadcastService.broadcast('update-challenges');
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public archiveChallenge(challengeId: string) {
    const $this = this;
    const setting: ISetting = {
      resource: `challenges/${challengeId}/archive`,
    };
    return this.apiService.post(setting)
      .pipe(
        map(() => {
          $this.broadcastService.broadcast('update-challenges');
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public joinChallenge(challengeId: string) {
    const setting: ISetting = {
      resource: `challenges/${challengeId}/join`,
    };
    return this.apiService.post(setting)
      .pipe(
        map(() => {
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public shareChallenge(challengeId: string): Observable<{
    dynamicLink: string,
  }> {
    const setting: ISetting = {
      resource: `challenges/${challengeId}/share`,
    };
    return this.apiService.post(setting)
      .pipe(
        map((res: any) => {
          return res;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public sendMessage(challengeId: string, message: {
    body: string;
    parentMessageId?: string;
  }): Observable<{
    success: boolean,
  }> {
    const setting: ISetting = {
      resource: `challenges/${challengeId}/messages`,
      payload: message,
    };
    return this.apiService.post(setting)
      .pipe(
        map(() => {
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }), finalize(() => this.spinnerService.hide()),
      );
  }

  public updateChallenge(challengeId: string, payload: any) {
    return this.apiService
      .patch({
        resource: 'challenges/' + challengeId,
        payload: payload,
      }).pipe(
        map((res) => {
          return res;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public updateChallengeInvitation(challengeId: string, userId: string, payload: any) {
    return this.apiService
      .patch({
        resource: 'challenges/' + challengeId + '/users/' + userId,
        payload: payload,
      }).pipe(
        map((challenge: IChallengeDocument) => {
          const result = challenge;
          return result;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public inviteUsers(challengeId: string, users: {
    userId: string,
    organizationId: string,
    role: string,
    invitationStatus: string,
  }[]) {
    const setting: ISetting = {
      resource: 'challenges/' + challengeId + '/users',
      payload: {
        users: users,
      },
    };

    return this.apiService
      .post(setting).pipe(
        map((res : IChallengeDocument) => {
          return res;
        })
      , catchError(this.exceptionService.catchBadResponse));
  }

  public setChallengeTimes(foundChallenges: IChallengeDocumentHydrated[]) {
    const $this = this;
    foundChallenges.forEach((foundChallenge) => {
      if (!foundChallenge.lookups) {
        foundChallenge.lookups = {};
      }
      const now = (new Date()).getTime();
      foundChallenge.lookups.timeToStart = (new Date(foundChallenge.startDate)).getTime() - now;
      foundChallenge.lookups.timeToEnd = (new Date(foundChallenge.endDate)).getTime() - now;
      foundChallenge.lookups.durationStr = $this.getDuration(foundChallenge);
    });
  }

  public getDuration(foundChallenge: IChallengeDocument) {
    const msgHdr = jsFilename + 'getDuration: ';

    try {
      const start = new Date(foundChallenge.startDate);
      const end = new Date(foundChallenge.endDate);
      if (start.toString() === 'Invalid Date') {
        return '';
      }

      // const startStrDay = moment(start).format('MMM Do');
      // const endStrDay = moment(end).format('MMM Do');
      // if (startStrDay !== endStrDay) {
      //   return startStrDay + ' - ' + endStrDay;
      // }
      // return moment(start).format('hh:mma, MMM Do') + ' - ' + moment(end).format('hh:mma');
      return moment(start).format('hh:mma, MMM Do') + ' - ' + moment(end).format('hh:mma, MMM Do');
    } catch (err) {
      console.error(msgHdr + 'err = ', err);
      return '';
    }
  }

  public getBell() {
    const $this = this;
    const msgHdr = jsFilename + 'getChallengeInvite: ';

    const where = {
      $or: [],
      endDate: {
        $gte: new Date(),
      },
    };

    where.$or.push({
      users: {
        $elemMatch: {
          userId: $this.userService.user._id,
          invitationStatus: 'sent',
        },
      },
    });

    where.$or.push({
      permission: 'public',
      'users.userId': {
        $ne: $this.userService.user._id,
      },
    });

    this.getChallenges({
      where: where,
    }).subscribe((foundChallenges) => {
      if (!this.globalService.lastSeenChallenge) {
        if (foundChallenges.length > 0) {
          this.showBell = true;
          return;
        }
      }
      const lastSeenChallenge = new Date(this.globalService.lastSeenChallenge);

      foundChallenges.forEach((foundChallenge) => {
        const challengeDate = new Date(foundChallenge.created);

        if (lastSeenChallenge.getTime() < challengeDate.getTime()) {
          this.showBell = true;
        }
      });
    });
  }

  public userSeenChallenges() {
    this.showBell = false;
    this.globalService.lastSeenChallenge = new Date();
    this.storage.set('lastSeenChallenge', new Date());
  }
}
