import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';

const jsFilename = 'DeepLinkService: ';

@Injectable()
export class DeepLinkService {
  constructor(
    private exceptionService: ExceptionService,
    private apiService: ApiService) {
    const $this = this;
  }

  public getDeepLink(url: string) {
    const query = 'url=' + encodeURIComponent(url);

    const setting: ISetting = {
      resource: 'deeplinks',
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

}
