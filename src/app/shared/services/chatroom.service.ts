import { Injectable } from '@angular/core';
import { IMessage, IMessageDocument } from '../models/message.interface';

import { Observable } from 'rxjs/Observable';
import { ApiService, IFilter, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { map, catchError } from 'rxjs/operators';
import { IChatroomDocument } from '../models/chatroom.interface';
import { of } from 'rxjs/observable/of';
import { throwError } from 'rxjs';

const jsFilename = 'ChatroomService: ';

@Injectable()
export class ChatroomService {
  public foundChatroom: IChatroomDocument = null;

  public filter: {
    where?: {
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  } = {
    where: {},
    limit:10,
    skip: 0,
    sortField: 'created',
    sortOrder: 'desc',
  };

  public loading = false;

  constructor(
    private apiService: ApiService,
    private exceptionService: ExceptionService,
  ) {
  }

  // public getChatrooms(options?: {
  //   showLoading?: boolean,
  //   isReload?: boolean,
  // }) {
  //   const $this = this;
  //   const msgHdr = 'getChatrooms: ';

  //   console.log(msgHdr + 'options = ', options);

  //   $this.loading = false;
  //   if (options && options.showLoading) {
  //     $this.loading = true;
  //   }

  //   const filter = JSON.parse(JSON.stringify(this.filter));

  //   console.log(msgHdr + 'options = ', options);

  //   if (options.isReload) {
  //   }

  //   const requestOptions = {
  //     queryParams: [{
  //       key: 'filter',
  //       value: {
  //         limit: 20,
  //         sortOrder: 'desc',
  //         sortField: 'created',
  //       },
  //     }],
  //   };

  //   console.log('filter = ', filter);
  //   console.log('filter.where = ', filter.where);

  //   if (filter) {
  //     requestOptions.queryParams[0].value = Object.assign(requestOptions.queryParams[0].value, filter);
  //   }

  //   let query = '';
  //   if (requestOptions && requestOptions.queryParams) {
  //     requestOptions.queryParams.forEach((option) => {
  //       if (typeof option.value === 'string') {
  //         query += '&' + option.key + '=' + option.value;
  //       } else {
  //         query += '&' + option.key + '=' + encodeURIComponent(JSON.stringify(option.value));
  //       }
  //     });
  //   }
  //   const setting: ISetting = {
  //     resource: 'chatrooms',
  //     queryString: query,
  //   };

  //   console.log(msgHdr + 'setting = ', setting);

  //   this.apiService.get(setting)
  //   .subscribe((results: {
  //     items: IChatroomDocument[],
  //     count: number,
  //   }) => {
  //     $this.loading = false;

  //     return results;
  //   }), catchError((err) => {
  //     $this.loading = false;
  //     return $this.exceptionService.catchBadResponse(err);
  //   });
  // }

  public getRoom(chatroomId): Observable<IChatroomDocument> {
    const $this = this;
    const msgHdr = jsFilename + 'getRoom: ';

    const setting: ISetting = {
      resource: 'chatrooms/' + chatroomId,
    };

    return this.apiService.get(setting)
      .pipe(
        map((chatroom) => {
          $this.foundChatroom = <IChatroomDocument> chatroom;
          return chatroom;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public findOrCreateChatroom(payload: {
    userIds: string[],
    chatroomType: string,
  }): Observable<IChatroomDocument> {
    const $this = this;
    const msgHdr = jsFilename + 'createChatroom: ';

    const setting: ISetting = {
      resource: 'chatrooms',
      payload: payload,
    };

    return this.apiService.post(setting)
      .pipe(
        map((chatroom) => {
          return chatroom;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public postMessage(chatroomId: string, payload: {
    message: string;
  }) {
    const $this = this;
    const setting: ISetting = {
      resource: 'chatrooms/' + chatroomId + '/messages',
      payload: payload,
    };

    return this.apiService.post(setting)
    .pipe(
      map((createdMessage) => {
        return createdMessage;
      }), catchError((err) => {
        return $this.exceptionService.catchBadResponse(err);
      }),
    );
  }

  public getMessages(chatroomId: string, filter: IFilter): Observable<{
    items: IMessageDocument[],
    count: 0,
  }> {
    const $this = this;
    const msgHdr = jsFilename + 'getMessages: ';

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
      resource: 'chatrooms/' + chatroomId + '/messages',
      queryString: query,
    };

    return this.apiService.get(setting)
      .pipe(
        map((resp) => {
          return resp;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }
}
