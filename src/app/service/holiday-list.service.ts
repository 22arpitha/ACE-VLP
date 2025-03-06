import { Injectable } from '@angular/core';
import { ApiserviceService } from './apiservice.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HolidayListService {
  allData:any  = new BehaviorSubject({});
  totalCount ;
  
  constructor(private api:ApiserviceService) { 

  }
 public getAppliedLeaves(params,paginate){
    this.api.getLeaveData(params,paginate).subscribe(res=>{
      this.totalCount = res['result']['pagination'].number_of_pages
    })
    return this.totalCount
  }
}
