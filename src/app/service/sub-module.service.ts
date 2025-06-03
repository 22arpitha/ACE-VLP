import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubModuleService {
  baseurl = environment.live_url;
  constructor(private http: HttpClient, private router: Router) { }

  getAccessList(user_id): Observable<any> {
    return this.http.get(`${this.baseurl}/${environment.user_access}/${user_id}/`);
  }

  getAccessForActiveUrl(id: number, url?: string): Observable<any> {
    let activeUrl = url || this.router.url;
    return this.getAccessList(id).pipe(
      map((response: any) => {
        // console.log('response', response)
        const accessList = response?.access_list || [];
        let matchedAccess = null;
        for (const module of accessList) {
          // console.log(module.url != activeUrl)
          if (module?.url && module.url === activeUrl) {
            // console.log( 'first', module.access)
            return module.access;
          }
          else if (module?.url && module.url != activeUrl) {
            const moduleUrl = module.url.split('/')
            const activeUrlParts = activeUrl.split('/');
            // console.log(activeUrlParts[1],moduleUrl[1],'activeUrlParts')
            if(activeUrlParts[1] && moduleUrl[1] === activeUrlParts[1]) {
              return module.access;
              // if (module.access?.[0]?.operations?.[0].view || module.access?.[0]?.operations?.[0].create || module.access?.[0]?.operations?.[0]?.update || module.access?.[0]?.operations?.[0]?.delete) {
              //   console.log(module.access, 'module.access')
              //   return module.access;
              // }
            }
          }

          if (!module.url && module.children && module.children.length > 0) {
            for (const child of module.children) {
              const childUrlParts = child.url?.split('/');
              const activeUrlParts = activeUrl.split('/');
              if (childUrlParts && childUrlParts[1] === activeUrlParts[1]) {
                const matchedChild = module.children.find((child: any) =>
                  child.url === activeUrl);
                if (matchedChild) {
                  matchedAccess = module.access.find((subAccess: any) => subAccess.name === matchedChild.name);
                  return matchedAccess ? [matchedAccess] : null;
                } else{
                  return module.access;
                }
              }
            }
            // const matchedChild = module.children.find((child: any) =>
            //   child.url === activeUrl);
            // console.log('eeeeeeeeeee')
            // if (matchedChild) {
            //   matchedAccess = module.access.find((subAccess: any) => subAccess.name === matchedChild.name);
            //   return matchedAccess ? [matchedAccess] : null;
            // }
          }
        }
        let firstIndexData = response?.access_list[0]
        if (!matchedAccess) {
          if (firstIndexData.url) {
            activeUrl = firstIndexData.url
          } else if (firstIndexData.children && firstIndexData.children.length > 0) {
            activeUrl = firstIndexData.children[0].url
          }
          this.router.navigateByUrl(activeUrl);
        }
        return null;
      })
    );
  }


}