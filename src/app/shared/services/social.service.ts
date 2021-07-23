import { Injectable } from '@angular/core';
import { IActivityLogDocument } from '../models/activity-log/activity-log.interface';
import { ActivityLogService } from './activity-log.service';
import * as moment from 'moment';
@Injectable()
export class SocialService {
  public listActivityLogs: IActivityLogDocument[] = [];
  public loading = false;
  public filterSkip = 10;

  public filter: {
    where?: {
      isFriendFeed?: boolean,
      isSocial?: boolean,
    },
    limit: number,
    skip: number,
    sortField: string,
    sortOrder: string,
  } = {
    where: { isSocial: true },
    limit: this.filterSkip,
    skip: 0,
    sortField: 'created',
    sortOrder: 'desc',
  };

  public userIds: string[] = [];

  constructor(
    private activityLogService: ActivityLogService) { }

  public reset(options?: {
    limit: number,
  }) {
    this.clear();
    if (options && options.limit) {
      this.filter.limit = options.limit;
    }
    this.getData({
      showLoading: true,
    });
  }

  public clear() {
    this.loading = true;
    this.listActivityLogs = [];
    this.filter.skip = 0;
    this.filter.limit = this.filterSkip;
  }

  public getData(options?: {
    userIds?: string[],
    showLoading?: boolean,
    isReload?: boolean,
    limit?: number,
  }) {
    const $this = this;
    const msgHdr = 'getData: ';
    return new Promise((resolve, reject) => {
      $this.loading = false;
      if (options && options.showLoading) {
        $this.loading = true;
      }

      if (options.limit) {
        this.filter.limit = options.limit;
      }

      const filter = JSON.parse(JSON.stringify(this.filter));
      if (options.isReload) {
        $this.listActivityLogs = [];
        $this.filter.skip = 0;
        if ($this.userIds.length > 0) {
          filter.where.userId = {
            $in: $this.userIds,
          };
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
      }

      $this.activityLogService.getSocialLogs(filter).subscribe((data) => {
        if (data && data.items && data.items.length > 0) {
          $this.listActivityLogs = $this.listActivityLogs.concat(data.items);
          $this.listActivityLogs.forEach((activityItem) => {
            if (activityItem.lookups) {
              if (activityItem.lookups.userAvatar) {
                if (activityItem.lookups.userAvatar.indexOf('000') >= 0) {
                  let randomImage = 0;
                  if (activityItem.lookups.userDisplay && activityItem.lookups.userDisplay.toLowerCase() === 'someone') {
                    randomImage = Math.round(Math.random() * 75);
                  } else {
                    const name = activityItem.lookups.userDisplay;
                    let total = 0;
                    for (let i = 0; i < name.length; i += 1) {
                      total += name.charCodeAt(i);
                    }
                    randomImage = total % 75;
                  }

                  if (randomImage > 9) {
                    activityItem.lookups.userAvatar = '0' + randomImage;
                  } else {
                    activityItem.lookups.userAvatar = '00' + randomImage;
                  }
                }
              }
              // activityItem.lookups.created = moment(activityItem.created).format('dddd, MMM Do, YYYY');
              activityItem.lookups.created = moment(activityItem.created).fromNow();
            }
          });
        }
        $this.loading = false;
        resolve({});
      }, (err) => {
        reject(err);
      });
    });
  }
}
