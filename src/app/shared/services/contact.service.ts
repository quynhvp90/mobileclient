import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ApiService, ISetting, IRequestOptionsArgs } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { BroadcastService } from './broadcast.service';
import { IContact, IContactDocument } from '../models/contact/contact.interface';
import { map, take, catchError, finalize, share } from 'rxjs/operators';
import { UtilityService } from './utility.service';
import { UserService } from './user.service';
import { IUserPublicDetail } from '../models/user/user.interface';
import * as moment from 'moment';
const jsFilename = 'contactService: ';

@Injectable()
export class ContactService {
  public listInvites: IContactDocument[] = [];

  public foundContacts: IUserPublicDetail[] = [];
  public totalCount: number = -1;
  public loading = false;
  public filterSkip = 30;

  public filter: {
    where?: {
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  } = {
    where: {},
    limit: this.filterSkip,
    skip: 0,
    sortField: 'created',
    sortOrder: 'asc',
  };

  private getAllConnectionsObservable: Observable<IUserPublicDetail[]>;

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private broadcastService: BroadcastService,
    private userService: UserService,
    private utilityService: UtilityService,
    private apiService: ApiService) {
    const $this = this;
    const msgHdr = jsFilename + 'constructor: ';

    this.broadcastService.state.subscribe((state) => {
      // this.getData();
    });

    this.getData({
      showLoading: false,
      isReload: true,
    });
    // this.getAllConnections()
    // .subscribe((respConnections) => {
    //   $this.foundContacts = respConnections;
    // },
    // (errGetConnections) => {
    //   console.log('errGetConnections = ', errGetConnections);
    // },
    // () => {
    //   // console.log('connection retrieval completed');
    // });
  }

  public getAllConnections(): Observable<IUserPublicDetail[]> {
    const $this = this;

    if ($this.foundContacts && $this.foundContacts.length > 0) {
      return of($this.foundContacts);
    }

    if ($this.getAllConnectionsObservable) {
      return $this.getAllConnectionsObservable;
    }

    $this.getAllConnectionsObservable = this.getConnections();

    return $this.getAllConnectionsObservable;
  }

  // 20210101 - NJC - I know this is stupid to have getConnections and getData
  public getConnections(term?: string, where?: any) {
    const msgHdr = jsFilename + 'getConnections: ';

    // this.loaderService.display(true);
    const requestOptions: IRequestOptionsArgs = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 100,
        },
      }],
    };

    if (where) {
      requestOptions.queryParams[0].value.where = where;
    }

    if (term) { // filtering is actually done client side
      requestOptions.queryParams[0].value.search = term;
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
      resource: 'contacts',
      queryString: query,
    };

    return this.apiService
      .get(setting).pipe(
        map((res) => {
          const result: any = res;
          const items = result.items;
          return <IContactDocument[]> items;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }

    // 20210101 - NJC - I know this is stupid to have getConnections and getData
  public getData(options: {
    showLoading?: boolean,
    isReload?: boolean,
  }) {
    const $this = this;
    const msgHdr = 'getData: ';

    $this.loading = false;
    if (options && options.showLoading) {
      $this.loading = true;
    }

    if (options.isReload) {
      $this.foundContacts = [];
      $this.filter.skip = 0;
    }

    const filter = JSON.parse(JSON.stringify(this.filter));

    const requestOptions = {
      queryParams: [{
        key: 'filter',
        value: {
          limit: 100,
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
      resource: 'contacts',
      queryString: query,
    };

    return this.apiService.get(setting)
    .subscribe((results: {
      items: IContactDocument[],
      count: number,
    }) => {
      if (results && results.items && results.items.length > 0) {
        const cleanContacts = $this.getCleanContacts(results.items);
        if (options.isReload) {
          $this.foundContacts = [];
        }
        $this.foundContacts = $this.foundContacts.concat(cleanContacts);
      }
      $this.totalCount = results.count;

      $this.loading = false;
      return results;
    }), catchError((err) => {
      $this.loading = false;
      return $this.exceptionService.catchBadResponse(err);
    });
  }

  public addContact(contact: IContactDocument) {
    const $this = this;

    const setting: ISetting = {
      resource: 'contacts/',
      payload: contact,
    };

    return this.apiService
      .post(setting).pipe(
        map((createdContact : IContactDocument) => {
          this.broadcastService.broadcast('contact-created', createdContact);
          this.getData({
            showLoading: true,
            isReload: true,
          });
          // const cleanContacts = $this.getCleanContacts([createdContact]);
          // this.foundContacts.concat(cleanContacts);
          return createdContact;
        })
      , catchError(this.exceptionService.catchBadResponse));
  }

  public deleteContact(contactId: string, friendId?: string) : Observable<Boolean> {
    const $this = this;
    const msgHdr = jsFilename + 'deleteContact: ';
    const setting: ISetting = {
      resource: `contacts/${contactId}/friendId/${ friendId }`,
    };
    return this.apiService.delete(setting)
      .pipe(
        map((res) => {
          this.broadcastService.broadcast('contact-deleted');
          return true;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }

  public getConnection(id: string) {
    const setting: ISetting = {
      resource: `contacts/${id}`,
    };
    return this.apiService
      .get(setting).pipe(
        map((contact: IContactDocument) => {
          const result = contact;
          return result;
        }), catchError(this.exceptionService.catchBadResponse),
    );
  }

  public updateContact(contactId: string, payload: any) {
    const setting: ISetting = {
      resource: 'contacts/' + contactId,
      payload: payload,
    };
    return this.apiService
      .patch(setting).pipe(
        map((res) => {
          return true;
        })
      , catchError(this.exceptionService.catchBadResponse),
    );
  }

  private getCleanContacts(foundContacts: IContactDocument[]) {
    const msgHdr = jsFilename + 'getCleanContacts: ';
    const $this = this;
    const cleanContacts: IUserPublicDetail[] = [];
    foundContacts.forEach((foundContact) => {
      let cleanContact: IUserPublicDetail = null;
      if (foundContact.fromUserId === $this.userService.user._id) {
        cleanContact = foundContact.lookups.v2.toUser;
      } else {
        cleanContact = foundContact.lookups.v2.fromUser;
      }
      let tagLine = null;
      if (!cleanContact) {
        console.warn(msgHdr + 'unknown contact = ', foundContact);
        return;
      }

      let isFriend = false;
      if (foundContact.invitationAccepted) {
        isFriend = true;
      }

      if (foundContact.fromUserId === $this.userService.user._id && !foundContact.invitationAccepted) {
        if (foundContact.invitationDeny) {
          tagLine = 'Declined invitation';
        } else {
          tagLine = 'Invited ' + moment(foundContact.created).fromNow();
        }
        if (!cleanContact.publicName || cleanContact.publicName.toLowerCase() === 'someone') {
          let email = foundContact.email;
          if (email.length > 0) {
            email = email.split('@')[0];
            email = email.substr(0, 5) + '...';
          }
          cleanContact.publicName = email;
        }
      } else if (foundContact.toUserId === $this.userService.user._id && !foundContact.invitationAccepted) {
        tagLine = 'You have not yet accepted this invitation sent ' + moment(foundContact.created).fromNow();
      } else if (cleanContact.lastActivityDetail && cleanContact.lastActivityDetail.count) {
        const lastActivityDetail = cleanContact.lastActivityDetail;
        tagLine = this.userService.getTagLine(lastActivityDetail);
      }

      cleanContact.lookups = {
        contactId: foundContact._id,
        invitationEmail: foundContact.email,
        isFriend: isFriend,
        tagLine: tagLine,
      };
      cleanContacts.push(cleanContact);
    });
    return cleanContacts;
  }

}
