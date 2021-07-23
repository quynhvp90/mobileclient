import 'rxjs/add/operator/map';

import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { GlobalService } from './global.service';

export interface ISetting {
  authorization?: string;
  queryString?: string;
  payload?: object;
  url?: string;
  id?: string;
  resource?: string;
  method?: string;
}

export interface IFilter {
  where?: any;
  search?: string;
  fields?: any;
  limit?: number;
  skip?: number;
  sortField?: string;
  sortOrder?: string;
}

export interface IRequestOptionsArgs {
  queryParams: [{
    key: string,
    value: any,
  }];
}

const jsFilename = 'api.service: ';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private globalService: GlobalService) {
  }

  private formatUrl(setting: ISetting): string {
    let url = environment.api + '/api/';
    // url = 'https://production-api.logreps.com/api/v1/';
    // url = 'https://spark.ngrok.io/api/v1/';

    // let url = '/api/v1/';
    // url = 'http://localhost:4000/' + url;

    if (setting.url) {
      url = setting.url;
    }
    if (setting.resource) {
      url += setting.resource;
    }

    if (setting.id) {
      url += '/' + setting.id;
    }

    if (setting.method) {
      url += '/' + setting.method;
    }

    if (setting.queryString) {
      url += '?' + setting.queryString;
    }
    console.log('url = ', url);

    // console.log('url = ', url);

    return url;
  }

  private setHeaders() {
    const msgHdr = jsFilename + 'setHeaders: ';
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        version: this.globalService.version,
        platforms: this.globalService.platforms,
      }),
    };

    if (this.globalService.token) {
      const token = 'Bearer ' + this.globalService.token;
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: token,
          version: this.globalService.version,
          platforms: this.globalService.platforms,
        }),
      };
    }

    return httpOptions;
  }

  public get<T>(setting: ISetting): Observable<T> {
    return this.http.get<T>(this.formatUrl(setting), this.setHeaders());
  }

  public post<T>(setting: ISetting): Observable<T> {
    return this.http.post<T>(this.formatUrl(setting), setting.payload, this.setHeaders());
  }

  public upload<T>(setting: any): any {
    // create form data for file
    const form = new FormData();

    form.append('file', setting.payload.file, setting.payload.name);

    // upload file and report progress
    const req = new HttpRequest('POST', this.formatUrl(setting), form, {
      reportProgress: true,
    });

    return this.http.request(req);
  }

  public put<T>(setting: ISetting): Observable<T> {
    return this.http
      .put<T>(this.formatUrl(setting), setting.payload, this.setHeaders());
  }

  public patch<T>(setting: ISetting): Observable<T> {
    return this.http
      .patch<T>(this.formatUrl(setting), setting.payload, this.setHeaders());
  }

  public delete<T>(setting: ISetting): Observable<T> {
    return this.http.delete<T>(this.formatUrl(setting), this.setHeaders());
  }
}

@Injectable()
export class CustomInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.headers.has('Content-Type')) {
      req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    // console.log(JSON.stringify(req.headers));
    return next.handle(req);
  }
}
