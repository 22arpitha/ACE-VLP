import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { SubModuleService } from '../service/sub-module.service';
import isOnline from 'is-online';
import { lastValueFrom } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class ActivateChildGuard implements CanActivateChild {
  constructor(private _router: Router, private subModuleService: SubModuleService) {}

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    let hasViewPermission = false;
    // const online = await isOnline();
    const online = navigator.onLine;

    if (!online) {
      this._router.navigate(['/no-internet']);
      return false;
    }
    // const token = localStorage.getItem('token');
    const userId = sessionStorage.getItem('user_id');
    // let userId :any = sessionStorage.getItem('user_id');
    const roleName = sessionStorage.getItem('user_role_name')?.toLowerCase();

    // if (!token) {
    //   this._router.navigate(['/login'], {
    //     queryParams: { returnUrl: state.url }
    //   });
    //   return false;
    // }
    // if (!userId) {
    //   try {
    //     const decoded: any = jwtDecode(token);
    //     userId = decoded.user_id;
    //     sessionStorage.setItem('user_id', userId);
    //   } catch {
    //     localStorage.removeItem('token');
    //     this._router.navigate(['/login']);
    //     return false;
    //   }
    // }
    if (!userId) {
      this._router.navigate(['/login']);
      return false;
    }
    if (state.url.includes('/changePasswords')) {
        return true;
      }
    if (state.url.includes('/performance/dashboard')) {
        return true;
      }
    // if(state.url.includes('/approvals/leave-requests')) {
    //   return true;
    // }
    if (roleName === 'admin') {
      return true;
    }

    try {
      const access = await lastValueFrom(this.subModuleService.getAccessForActiveUrl(+userId, state.url));
      if(access !== null && access.length > 0) {
        hasViewPermission = access.some((item: any) =>
          item.operations?.some((op: any) => op.view || op.create || op.update || op.delete)
        );
      }else{
        hasViewPermission = false;
      }

      return hasViewPermission;
    } catch (error: any) {

      if (error.status === 404 || error.message?.includes('not found')) {
        this._router.navigate(['/404']);
      } else {
        this._router.navigate(['/404']);
      }

      return false;
    }

  }

}
