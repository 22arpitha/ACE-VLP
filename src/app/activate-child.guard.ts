import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { SubModuleService } from './service/sub-module.service';
import isOnline from 'is-online';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivateChildGuard implements CanActivateChild {
  constructor(private _router: Router, private subModuleService: SubModuleService) {}

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
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
      const access = await lastValueFrom(
        this.subModuleService.getAccessForActiveUrl(+userId, state.url).pipe(
          map((access: any[]) => {
            if (access && access.length > 0) {
              const hasViewPermission = Boolean(
                access[0].operations?.some((op: any) => op?.view === true)
              );

              if (hasViewPermission) {
                return true;
              }
            }

            this._router.navigate(['/unauthorized']);
            return false;
          })
        )
      );

      return access;
    } catch (error) {
      console.error('Error fetching access permissions:', error);
      this._router.navigate(['/unauthorized']);
      return false;
    }
  }
}
