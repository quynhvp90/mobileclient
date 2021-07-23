import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';
import { ApiService, ISetting } from './api.service';
import { BroadcastService } from './broadcast.service';
import { ExceptionService } from './exception.service';
import { GlobalService } from './global.service';
import { SpinnerService } from './spinner.service';
import { UserService } from './user.service';
const jsFilename = 'statsService: ';

export interface IBannerData {
  title: string;
  body: string;
  colors?: {
    background: string;
    font: string;
    dismiss?: string;
    button?: string;
  };
  button?: {
    label: string;
    link: string;
  };
}

@Injectable()
export class SettingsService {
  private bannerAdData: IBannerData[] = [];

  constructor(
    private exceptionService: ExceptionService,
    private apiService: ApiService,
  ) {
    const $this = this;
  }

  public getBannerData(): Observable<IBannerData[]> {
    const $this = this;
    const msgHdr = jsFilename + 'getBannerData: ';

    const setting: ISetting = {
      resource: 'settings/bannerads',
    };

    return $this.apiService
      .get(setting).pipe(
        map((res) => {
          return res;
        })
        , catchError(this.exceptionService.catchBadResponse)
        , share(),
      );
  }
}
