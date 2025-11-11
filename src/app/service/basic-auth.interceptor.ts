import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
authToken:any;
  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with basic auth credentials if available
    const skipUrl = [
    'https://projectacedevelop.thestorywallcafe.com/api/login',
    'https://projectacedevelop.thestorywallcafe.com/api/register',
    'https://projectacedevelop.thestorywallcafe.com/api/forgot-password-send-otp',
    'https://projectacedevelop.thestorywallcafe.com/api/otp-verify-forgot-pass',
    'https://projectacedevelop.thestorywallcafe.com/api/password-reset',
    'https://projectacedevelop.thestorywallcafe.com/api/country/',
    'https://projectacedevelop.thestorywallcafe.com/api/state/',
    'https://projectacedevelop.thestorywallcafe.com/api/city/',

    'https://projectacetest.thestorywallcafe.com/api/login',
    'https://projectacetest.thestorywallcafe.com/api/register',
    'https://projectacetest.thestorywallcafe.com/api/forgot-password-send-otp',
    'https://projectacetest.thestorywallcafe.com/api/otp-verify-forgot-pass',
    'https://projectacetest.thestorywallcafe.com/api/password-reset',
    'https://projectacetest.thestorywallcafe.com/api/country/',
    'https://projectacetest.thestorywallcafe.com/api/state/',
    'https://projectacetest.thestorywallcafe.com/api/city/',

    'https://projectaceuat.thestorywallcafe.com/api/login',
    'https://projectaceuat.thestorywallcafe.com/api/register',
    'https://projectaceuat.thestorywallcafe.com/api/forgot-password-send-otp',
    'https://projectaceuat.thestorywallcafe.com/api/otp-verify-forgot-pass',
    'https://projectaceuat.thestorywallcafe.com/api/password-reset',
    'https://projectaceuat.thestorywallcafe.com/api/country/',
    'https://projectaceuat.thestorywallcafe.com/api/state/',
    'https://projectaceuat.thestorywallcafe.com/api/city/',
    ];
    // if (skipUrl.indexOf(request.url) === -1) {
    //   this.authToken=sessionStorage.getItem('token');
    //    request = request.clone({
    //         setHeaders: {
    //             'Authorization': `ProjectAce ${this.authToken}`,
    //             // 'Content-Type': 'application/json'
    //         }
    //     });
    // }
    // return next.handle(request);

    if (!skipUrl.includes(request.url)) {
      const authToken = sessionStorage.getItem('token');

      if (authToken) {
          request = request.clone({
              setHeaders: {
                  Authorization: `VLP ${authToken}`
              }
          });
      } else {
          //console.warn('No authorization token found in sessionStorage.');
      }
  }

  return next.handle(request);
}
}
