import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { SubModuleService } from '../service/sub-module.service';
import isOnline from 'is-online';
import { lastValueFrom } from 'rxjs';

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
    const online = await isOnline();

    if (!online) {
      this._router.navigate(['/no-internet']);
      return false; 
    }

    const userId = sessionStorage.getItem('user_id');
    const roleName = sessionStorage.getItem('user_role_name')?.toLowerCase();

    if (!userId) {
      this._router.navigate(['/login']);
      return false;
    }

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
