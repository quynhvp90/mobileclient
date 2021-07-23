import { Injectable, EventEmitter } from '@angular/core';
import { WindowService } from './window.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';
import { map, take, catchError, finalize, share } from 'rxjs/operators';
interface IAuthProvider {
  oAuthCallbackUrl: string;
  oAuthCodeUrl: string;
  oAuthTokenUrl: string;
  oAuthUserUrl: string;
  oAuthUserNameField: string;
  oAuthFlow: string;
}

interface IAuthResponse {
  success: boolean;
  authenticated?: boolean;
  provider?: string;
  code?: string;
  token?: string;
  expires?: number;
  error?: Error;
}

@Injectable()
export class AuthService {
  private providers: {
    string?: IAuthProvider,
  } = {};
  private currentProvider: IAuthProvider;
  private currentProviderName: string;
  private authenticated = false;
  private token: string;
  private code: string;
  private expires: any = 0;
  private userInfo: any = {};
  private windowHandle: any = null;
  private intervalId: any = null;
  private expiresTimerId: any = null;
  private loopCount = 600;
  private intervalLength = 100;
  private subject = new Subject<IAuthResponse>();

  constructor(
    private windows: WindowService,
    private http: HttpClient) {

    http.get('./assets/data/auth.json')
      .pipe(
        map((res) => res)
        // map((res) => res.json())
      )
      .subscribe((configs: any) => {
        for (const config of configs) {

          const callback = config.callbackUrl.replace('http://localhost:3500', window.location.origin);
          // console.log(' window.location.origin = ',  window.location.origin);
          // console.log(' callback = ',  callback);

          let codeUrl = config.codeUrl;
          if (codeUrl) {
            codeUrl = codeUrl.replace('__callbackUrl__', callback)
              .replace('__clientId__', config.clientId)
              .replace('__scopes__', config.scopes);
          }

          let tokenUrl = config.tokenUrl;
          if (tokenUrl) {
            tokenUrl = tokenUrl.replace('__callbackUrl__', callback)
              .replace('__clientId__', config.clientId)
              .replace('__scopes__', config.scopes);
          }

          const authProvider: IAuthProvider = {
            oAuthCallbackUrl: callback,
            oAuthCodeUrl: codeUrl,
            oAuthTokenUrl: tokenUrl,
            oAuthFlow: config.flow,
            oAuthUserUrl: config.userInfoUrl,
            oAuthUserNameField: config.userInfoNameField
          };

          this.providers[config.provider] = authProvider;
        }
      });
  }

  public doLogin(provider: string, additionalScopes?: string) {
    const authProvider: IAuthProvider = this.providers[provider];
    const $this = this;
    this.currentProviderName = provider;
    this.currentProvider = authProvider;

    let url = authProvider.oAuthCodeUrl;
    if (authProvider.oAuthFlow === 'token') {
      url = authProvider.oAuthTokenUrl;
    }

    if (additionalScopes && additionalScopes.length > 0) {
      if (provider === 'google') {
        url += ' ' + additionalScopes;
      }
    }

    let loopCount = this.loopCount;
    this.windowHandle = this.windows.createWindow(url, 'OAuth2 Login');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.emitAuthStatus(false);
    }

    this.intervalId = setInterval(() => {
      console.log('auth.service interval');

      if (loopCount-- < 0) {
        clearInterval(this.intervalId);

        this.emitAuthStatus(false);
        this.windowHandle.close();
      } else {
        let href: string;
        try {
          href = this.windowHandle.location.href;
        } catch (e) {
          console.log('Error:', e);
        }
        console.log('href = ', href);
        if (href != null) {
          let re = /code=(.*)/;
          if (authProvider.oAuthFlow === 'token') {
            re = /access_token=(.*)/;
          }
          const found = href.match(re);
          if (found) {
            // console.log('Callback URL:', href);
            clearInterval(this.intervalId);
            const parsed = this.parse(href.substr(authProvider.oAuthCallbackUrl.length + 1));
            const expiresSeconds = Number(parsed.expires_in) || 1800;

            this.token = parsed.access_token;
            this.code = parsed.code;
            if (this.code) {
              this.authenticated = true;
              this.windowHandle.close();
              this.emitAuthStatus(true);
            } else if (this.token) {
              this.authenticated = true;
              this.startExpiresTimer(expiresSeconds);
              this.expires = new Date();
              this.expires = this.expires.setSeconds(this.expires.getSeconds() + expiresSeconds);

              this.windowHandle.close();
              this.emitAuthStatus(true);
              this.fetchUserInfo();
            } else {
              this.authenticated = false; // we got the login callback just fine, but there was no token
              this.emitAuthStatus(false); // so we are still going to fail the login
            }

          } else {
            // http://localhost:3000/auth/callback#error=access_denied
            if (href.indexOf(authProvider.oAuthCallbackUrl) === 0) {
              clearInterval(this.intervalId);
              const parsed = this.parse(href.substr(authProvider.oAuthCallbackUrl.length + 1));
              this.windowHandle.close();
              this.emitAuthStatusError(false, parsed);
            }
          }
        }
      }
    }, this.intervalLength);

    return this.subject.asObservable();
  }

  public doLogout() {
    this.authenticated = false;
    this.expiresTimerId = null;
    this.expires = 0;
    this.token = null;
    this.emitAuthStatus(true);
  }

  public getSession() {
    return {authenticated: this.authenticated, token: this.token, expires: this.expires};
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public getUserName() {
    return this.userInfo ? this.userInfo[this.currentProvider.oAuthUserNameField] : null;
  }

  public isAuthenticated() {
    return this.authenticated;
  }

  private emitAuthStatus(isSuccess: boolean) {
    this.emitAuthStatusError(isSuccess, null);
  }

  private emitAuthStatusError(isSuccess: boolean, error: Error) {
    this.subject.next({
      success: isSuccess,
      authenticated: this.authenticated,
      provider: this.currentProviderName,
      code: this.code,
      token: this.token,
      expires: this.expires,
      error: error
    });
  }

  private fetchUserInfo() {
    if (this.token != null) {
      const headers = new HttpHeaders();
      headers.append('Authorization', `Bearer ${this.token}`);
      //noinspection TypeScriptUnresolvedFunction
      this.http.get(this.currentProvider.oAuthUserUrl, { headers })
        // .pipe(map((res) => res.json()))
        .pipe(map((res) => res))
        .subscribe((info) => {
          this.userInfo = info;
        }, (err) => {
          console.error('Failed to fetch user info:', err);
        });
    }
  }

  private startExpiresTimer(seconds: number) {
    if (this.expiresTimerId != null) {
      clearTimeout(this.expiresTimerId);
    }
    this.expiresTimerId = setTimeout(() => {
      this.doLogout();
    }, seconds * 1000); // seconds * 1000
  }

  private parse(str) { // lifted from https://github.com/sindresorhus/query-string
    if (typeof str !== 'string') {
      return {};
    }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) {
      return {};
    }

    return str.split('&').reduce((ret, param) => {
      const parts = param.replace(/\+/g, ' ').split('=');
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      let key = parts.shift();
      let val = parts.length > 0 ? parts.join('=') : undefined;

      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }

      return ret;
    }, {});
  }

}
