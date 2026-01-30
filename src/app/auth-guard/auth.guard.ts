import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private _router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

      // const token = localStorage.getItem('token');
      // if (!token) {
      //   this._router.navigate(['/login'], {
      //     queryParams: { returnUrl: state.url }
      //   });
      //   return false;
      // }
      // return true;

      const isLoggedIn: boolean = sessionStorage.getItem('user_id') !== null;
  
      if (!isLoggedIn) {
        this._router.navigate(['/login']);
        return false;
      }
  
      return true;
    }
}
