import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import isOnline from 'is-online';

@Injectable({
  providedIn: 'root'
})
export class ActivateChildGuard implements CanActivateChild {
  constructor(private _router: Router) {}

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Check internet connection first using is-online
    const online = await isOnline();
    if (!online) {
      this._router.navigate(['/no-internet']);
      return false;
    }

    // Then check authentication
    const isLoggedIn: boolean = sessionStorage.getItem('user_id') !== null;
    if (!isLoggedIn) {
      this._router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}