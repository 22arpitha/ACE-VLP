import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ApiserviceService } from '../service/apiservice.service';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _router: Router,private api: ApiserviceService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):Observable<boolean> {

      // const token = localStorage.getItem('token');
      // if (!token) {
      //   this._router.navigate(['/login'], {
      //     queryParams: { returnUrl: state.url }
      //   });
      //   return false;
      // }
      // return true; // old code

       let sessionUserId = sessionStorage.getItem('user_id');
      let token = sessionStorage.getItem('token');
      if (!sessionUserId) {
      const localToken = localStorage.getItem('token');
      if (localToken) {
        const decoded: any = jwtDecode(localToken);
        sessionStorage.setItem('token', localToken);
        sessionStorage.setItem('user_id', decoded.user_id);
        sessionUserId = decoded.user_id;
      }
    }

    // 🚨 Not logged in
    if (!sessionUserId) {
      this._router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }

    // 🧠 CHECK URL USER ID
    const urlUserId =
      route.queryParams['user_id'] ||
      route.params['user_id'];

    if (urlUserId && urlUserId != sessionUserId) {

      // different user trying to access
      sessionStorage.clear();
      localStorage.removeItem('token');

      this._router.navigate(['/login'], {
        queryParams: { returnUrl: state.url,forceUser: urlUserId  }
      });

      return of(false);
    }

    // return true;

    // if role already loaded allow
    if (sessionStorage.getItem('user_role_name')) {
      return of(true);
    }

    // otherwise call access api before opening page
    return this.api.getData(`${environment.live_url}/${environment.user_access}/${sessionUserId}/`).pipe(
      map((data: any) => {
        if (data.user_role === 'Employee') {
          sessionStorage.setItem('user_role_name', data.designation);
          sessionStorage.setItem('designation', data.sub_designation);
        } else {
          sessionStorage.setItem('user_role_name', data.user_role);
        }
        sessionStorage.setItem('user_name', data.user_info[0].first_name);
        return true;
      }),
      catchError(() => {
        sessionStorage.clear();
        localStorage.removeItem('token');
        this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );




      // let isLoggedIn: boolean = sessionStorage.getItem('user_id') !== null;
  
      // if (!isLoggedIn) {
      //   const localToken = localStorage.getItem('token');
      //   if (localToken) {
      //     sessionStorage.setItem('token', localToken);
      //     const decoded: any = jwtDecode(localToken);
      //     sessionStorage.setItem('user_id', decoded.user_id);
      //     isLoggedIn = decoded.user_id;
      //   }
      // }
      // if (!isLoggedIn) {
      //    this._router.navigate(['/login'], {
      //     queryParams: { returnUrl: state.url }
      //   });
      //   // this._router.navigate(['/login']);
      //   return false;
      // }
  
      // return true;
    }
}
