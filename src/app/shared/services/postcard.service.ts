import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ApiService, ISetting } from './api.service';
import { ExceptionService } from './exception.service';
import { SpinnerService } from './spinner.service';
import { IPost, IPostDocument } from '../models/post/post.interface';
import { map, take, catchError, finalize, share } from 'rxjs/operators';
import { default as dataExercises } from '../../../assets/data/exercises';

const jsFilename = 'postcardService: ';

@Injectable()
export class PostcardService {
  public activities: IPostDocument[];
  public dateOffset = 0; // minus dates to log activities in the past

  constructor(
    private http: HttpClient,
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private apiService: ApiService) {
  }

  public create(payload: any): Observable<IPostDocument> {
    const $this = this;

    const setting: ISetting = {
      resource: 'postcards/',
      payload: payload,
    };

    return this.apiService.post(setting)
      .pipe(
        map((postcard) => {
          return postcard;
        }), catchError((err) => {
          return $this.exceptionService.catchBadResponse(err);
        }),
      );
  }
}
