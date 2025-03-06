import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrgAuthGuard implements CanActivate {
  constructor(private _router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      const isLoggedIn: boolean = sessionStorage.getItem('user_id') !== null && sessionStorage.getItem('user_role_name') === 'SUPER ADMIN';
  
      if (!isLoggedIn) {
        this._router.navigate(['/login']);
        return false;
      }
  
      return true;
    }
  
}
