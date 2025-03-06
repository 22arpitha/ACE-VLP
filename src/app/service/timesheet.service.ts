import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  baseurl = environment.live_url;
  token = sessionStorage.getItem('token')
  monthTimesheetAll = new BehaviorSubject([])
 
 
  constructor(private http:HttpClient ) {  }
  headers:any={'Authorization':this.token} 

  //TimeSheet
//   getTimeSheetAllDetails(params){
//   return this.http.get(`${this.baseurl}/time-sheets-monthly?approved_state=${params.status}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&timesheets_from_date=${params.timesheets_from_date}&timesheets_to_date=${params.timesheets_to_date}&module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}`)
// }
  getMonthTimeSheetDetails(params){
  return this.http.get(`${this.baseurl}/time-sheets-monthly?user_id=${params.user_id}&module=${params.module}&menu=${params.menu}&method=${params.method}&timesheets_from_date=${params.timesheets_from_date}&approved_state=${params.approved_state}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}`)
  }
  // getDeadLineCrossed(params){
  //   return this.http.get(`${this.baseurl}/time-sheets-deadline-crossed?user_id=${params.user_id}&organization_id=${params.organization_id}&module=${params.module}&menu=${params.menu}&method=${params.method}&timesheets_from_date=${params.timesheets_from_date}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}`)
  // }
  
  // getByStatusTimeSheets(params){
  //   return this.http.get(`${this.baseurl}/all-time-sheets/?status=${params.status}&user_id=${params.user_id}`)
  // }
  updateStatus(data:any){
    return this.http.post(`${this.baseurl}/time-sheets-status-update`, data,{headers:this.headers})
  }
  //TimeSheet 
  //Approval Config
  addApproval(data){
    return this.http.post(`${this.baseurl}/time-sheets-approval-config`,data,{headers:this.headers})
  }
  //Approval Config
  //Todays Approval
  getTodaysApprovalTimesheet(params){
  return this.http.get(`${this.baseurl}/time-sheets-todays-approval?user_id=${params.user_id}&search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&approved_state=${params.status}&organization_id=${params.organization_id}`,{headers:this.headers})
  }
  
 deleteTodaysApproval(id,params){
  return this.http.delete(`${this.baseurl}/todayapprovaltimesheet/?id=${id}?module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}`)
  
 }
 

}
