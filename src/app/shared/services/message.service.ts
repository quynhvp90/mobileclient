import { Injectable } from '@angular/core';
import { IMessage, IMessageDocument, IMessageSocial } from '../models/message.interface';

import { Observable } from 'rxjs/Observable';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { map, catchError } from 'rxjs/operators';

const jsFilename = 'messageService: ';

@Injectable()
export class MessageService {
  public filter: {
    where?: {
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  } = {
    where: {},
    limit:30,
    skip: 0,
    sortField: 'modified',
    sortOrder: 'desc',
  };

  public foundMessages: IMessageDocument[] = [];
  public loading = false;
  public filterSkip = 30;

  public userIds: string[] = [];
  public challengeId: string;
  public dbModelId: string;
  public dbModel: string;

  constructor(
    private apiService: ApiService,
    private exceptionService: ExceptionService,
  ) {
  }

  public reset(options?: {
    userIds?: string[],
    challengeId?: string,
    dbModelId?: string,
    dbModel?: string,
    showLoading?: boolean,
    isReload?: boolean,
    limit?: number,
  }) {
    this.clear();
    this.getData(options);
  }

  public clear() {
    this.loading = true;
    this.foundMessages = [];
    this.filter.skip = 0;
    this.filter.limit = 30;
  }

  public getData(options?: {
    userIds?: string[],
    challengeId?: string,
    dbModelId?: string,
    dbModel?: string,
    showLoading?: boolean,
    isReload?: boolean,
    limit?: number,
  }) {
    const $this = this;
    const msgHdr = 'getData: ';

    $this.loading = false;
    if (options && options.showLoading) {
      $this.loading = true;
    }

    if (options.limit) {
      this.filter.limit = options.limit;
    }

    const filter = JSON.parse(JSON.stringify(this.filter));

    if (options.isReload) {
      if ($this.userIds.length > 0) {
        filter.where.userId = {
          $in: $this.userIds,
        };
      }

      if ($this.challengeId) {
        filter.where.dbModelId = $this.challengeId;
        filter.where.dbModel = 'challenge';
      } else if ($this.dbModelId) {
        filter.where.dbModelId = $this.dbModelId;
        filter.where.dbModel = $this.dbModel;
      }
    } else {
      if (options && options.userIds) {
        filter.where.userId = {
          $in: options.userIds,
        };
        $this.userIds = options.userIds;
      } else {
        $this.userIds = [];
      }

      if (options && options.challengeId) {
        filter.where.dbModelId = options.challengeId;
        filter.where.dbModel = 'challenge';
        $this.challengeId = options.challengeId;
      } else if (options.dbModelId) {
        filter.where.dbModelId = options.dbModelId;
        filter.where.dbModel = options.dbModel;
        $this.challengeId = null;
      } else {
        $this.challengeId = null;
      }
    }

    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 30,
          sortOrder: 'desc',
          sortField: 'created',
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
      resource: 'messages',
      queryString: query,
    };

    this.apiService.get(setting)
    .subscribe((results: IMessageDocument[]) => {
      $this.foundMessages = $this.foundMessages.concat(results);
      $this.loading = false;

      return results;
    }), catchError((err) => {
      $this.loading = false;
      return $this.exceptionService.catchBadResponse(err);
    });
  }

  public createMessage(newMessage: IMessage): Observable<IMessageDocument>  {
    const $this = this;

    const setting: ISetting = {
      resource: 'messages',
      payload: newMessage,
    };

    return this.apiService.post(setting)
      .pipe(
        map((res) => {
          return res;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public postSocial(foundMessage: IMessageDocument, socialData: {
    emote?: string,
    comment?: string,
  }): Observable<IMessageSocial>  {
    const $this = this;

    const setting: ISetting = {
      resource: 'messages/' + foundMessage._id + '/social',
      payload: {
        emote: socialData.emote,
        comment: socialData.comment,
      },
    };

    return this.apiService.post(setting)
      .pipe(
        map((res) => {
          return res;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public deleteSocial(foundMessage: IMessageDocument, socialId: string): Observable<boolean> {
    const setting: ISetting = {
      resource: 'messages/' + foundMessage._id + '/social/' + socialId,
    };
    return this.apiService.delete(setting)
      .pipe(
        map(() => {
          return true;
        }), catchError((err) => {
          return this.exceptionService.catchBadResponse(err);
        }),
      );
  }
}
