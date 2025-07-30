// import { Injectable } from '@angular/core';
// import { map, catchError } from 'rxjs/operators';
// import { firstValueFrom, of } from 'rxjs';
// import { environment } from '../../environments/environment';
// import { ApiserviceService } from './apiservice.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class DropDownPaginationService {

//   constructor(private apiService: ApiserviceService) { }
 
//   fetchDropdownData = async (
//     endpoint: string,
//     page: number,
//     search: string,
//     mapItem: (item: any) => { id: any; name: string },
//     extraParams: Record<string, any> = {}
//   ): Promise<{ results: any[]; hasMore: boolean; totalCount: number }> => {
//     const pageSize = 10;
//     const params = new URLSearchParams();

//     params.set('page', page.toString());
//     params.set('page_size', pageSize.toString());

//     if (search) {
//       params.set('search', search);
//     }
//     console.log('service=====>',search)
//     Object.entries(extraParams).forEach(([key, value]) => {
//       if (value !== undefined && value !== null) {
//         params.set(key, value);
//       }
//     });

//     const url = `${environment.live_url}/${endpoint}/?${params}`;
//     console.log('url===>',url)
//     try {
//       const response: any = await firstValueFrom(this.apiService.getData(url));

//       const mapped = response.results?.map(mapItem) || [];

//       return {
//         results: mapped,
//         hasMore: response.next_page !== null,
//         totalCount: response.total_no_of_record || mapped.length
//       };
//     } catch (error) {
//       this.apiService.showError(error?.error?.detail || 'Failed to fetch data');
//       return {
//         results: [],
//         hasMore: false,
//         totalCount: 0
//       };
//     }
//   };
// }





import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiserviceService } from './apiservice.service';

@Injectable({
  providedIn: 'root'
})
export class DropDownPaginationService {

  constructor(private apiService: ApiserviceService) { }

  fetchDropdownData$(
    endpoint: string,
    page: number,
    search: string,
    mapItem: (item: any) => { id: any; name: string },
    extraParams: Record<string, any> = {}
  ): Observable<{ results: any[]; hasMore: boolean; totalCount: number }> {
    const pageSize = 10;
    const params = new URLSearchParams();

    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());

    if (search) {
      params.set('search', search);
    }
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, value);
      }
    });

    const url = `${environment.live_url}/${endpoint}/?${params}`;
    // console.log('url ===>', url);

    return this.apiService.getData(url).pipe(
      map((response: any) => {
        const mapped = response.results?.map(mapItem) || [];
        return {
          results: mapped,
          hasMore: response.next_page !== null,
          totalCount: response.total_no_of_record || mapped.length
        };
      }),
      catchError((error) => {
        this.apiService.showError(error?.error?.detail || 'Failed to fetch data');
        return of({
          results: [],
          hasMore: false,
          totalCount: 0
        });
      })
    );
  }
}
