import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-add-on-leave-request',
  templateUrl: './add-on-leave-request.component.html',
  styleUrls: ['./add-on-leave-request.component.scss']
})
export class AddOnLeaveRequestComponent implements OnInit {
  @ViewChild('tabset') tabset: TabsetComponent;
  @ViewChild('tabsets') tabsets: TabsetComponent;
  BreadCrumbsTitle:any='Add on leaves request';
  addOnLeaveForm:FormGroup;
  params:any={};
  AllCardData: any = [];
  selectedTab: any = '';
  currDate:any;
  AllListData: any = [];
  fromDate: any = '';
  toDate: any ='';
  changes: boolean = false;
  month: any;
  pagination: {};
  totalCount: any;
  user_id;
  
  constructor(
    private api:ApiserviceService,
    private datepipe:DatePipe,
    private _fb:FormBuilder,
    private location:Location,
    private common_service:CommonServiceService
    ) { 
    }
  
 goBack(event)
  {
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
}
  ngOnInit(): void { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
   this.user_id = sessionStorage.getItem('user_id')
   let c_params={
      module:"LEAVE/HOLIDAY_LIST",
      menu:"ADD_ON_LEAVE_REQUEST",
      method:"VIEW",
      approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
      user_id:this.user_id,
      page_number:1,
      data_per_page:10,
      pagination:'TRUE'
     }
    this.initForm();
    this.getByStatus(c_params)
   }
  get f(){
    return this.addOnLeaveForm.controls
  }
 
  initForm(){
  this.addOnLeaveForm = this._fb.group({
    from_date:[ '',Validators.required],
    to_date:['',Validators.required]
  })
  }
  buttonClick(event){
    if(event){
      if(this.changes){
        let params={
          module:"LEAVE/HOLIDAY_LIST",
          menu:"ADD_ON_LEAVE_REQUEST",
          method:"VIEW",
          approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.user_id,
          leaveApplication_from_date:this.fromDate,
          leaveApplication_to_date:this.toDate,
          page_number:event.page,
          data_per_page:event.tableSize,
          pagination:'TRUE'
         }
       this.getAppliedLeaves(params);
      }
      else{
        let params={
          module:"LEAVE/HOLIDAY_LIST",
          menu:"ADD_ON_LEAVE_REQUEST",
          method:"VIEW",
          approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.user_id,
          page_number:event.page,
          data_per_page:event.tableSize,
          pagination:'TRUE'
         }
         this.getByStatus(params)
      }
      
    }
  }
  getByStatus(params){
    this.api.getData(`${environment.live_url}/${environment.add_on_leave_request}?module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&params=${params.pagination}&approved_state=${params.approved_state}`).subscribe(res=>{
      if(res){ 
        this.AllCardData = res['result'].add_on_leave_dashboard
        this.AllListData = res['result'].data
        this.totalCount  = res['result']['pagination'].number_of_pages
        if(this.AllListData.length <= 0){
          this.api.showWarning('No records found')
        }
      }
      else{
        if(this.AllListData.length <= 0){
          this.api.showWarning('No records found')
        }
      }
      
    },((error:any)=>{
      this.api.showError(error.error.error.message)
    }))
  }
  getAppliedLeaves(params){
    this.api.getData(`${environment.live_url}/${environment.add_on_leave_request}?module=${params.module}&menu=${params.menu}&method=${params.method}&user_id=${params.user_id}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&params=${params.pagination}&approved_state=${params.approved_state}&leaveApplication_from_date=${params.leaveApplication_from_date}&leaveApplication_to_date=${params.leaveApplication_to_date}`).subscribe(res=>{
      if(res){ 
        this.AllCardData = res['result'].add_on_leave_dashboard
        this.AllListData = res['result'].data
        this.totalCount  = res['result']['pagination'].number_of_pages
      }
      else{
        if(this.AllListData.length <= 0){
          this.api.showWarning('No records found')
        }
      }
    },((error:any)=>{
      this.api.showError(error.error.error.message)
    }))
    
  }
 
   changeFormat(){
    this.fromDate = this.datepipe.transform(this.addOnLeaveForm.value.from_date,'dd/MM/yyyy')
    this.toDate   = this.datepipe.transform(this.addOnLeaveForm.value.to_date,'dd/MM/yyyy')
    this.changes = true;
    this.month = this.addOnLeaveForm.value.to_date
   }
    submit(){
      let c_params = {}
      if(this.changes){
        c_params={
          module:"LEAVE/HOLIDAY_LIST",
          menu:"ADD_ON_LEAVE_REQUEST",
          method:"VIEW",
          approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.user_id,
          leaveApplication_from_date:this.fromDate,
          leaveApplication_to_date:this.toDate,
          page_number:1,
          data_per_page:10,
          pagination:'TRUE'
         }
      }
    // else{
    //   c_params={
    //     module:"LEAVE/HOLIDAY_LIST",
    //     menu:"ADD_ON_LEAVE_REQUEST",
    //     method:"VIEW",
    //     approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
    //     user_id:this.user_id,
    //     leaveApplication_from_date:this.addOnLeaveForm.value.from_date,
    //     leaveApplication_to_date:this.addOnLeaveForm.value.to_date,
    //     page_number:1,
    //     data_per_page:10,
    //     pagination:'TRUE'
    //    }
    // }
    if(this.addOnLeaveForm.invalid){
      this.addOnLeaveForm.markAllAsTouched()
      this.api.showWarning('Please enter from date and to date')
    }
    else{
      this.tabset.tabs[0].active = true;
      this.tabsets.tabs[0].active = true;
      this.getAppliedLeaves(c_params)
      
    }
   
    }
    tabState(data){
      if(data.heading == 'Approved leaves'){
        this.selectedTab = 'APPROVED'
      }
      else if(data.heading == 'Yet to be approved' ){
        this.selectedTab = 'YET_TO_APPROVED' 
      }
      else if(data.heading == 'Declined leaves'){
        this.selectedTab = 'DECLINED'
      }
      else{
        this.selectedTab = 'YET_TO_APPROVED' 
      }
     let c_params:any = {}
      if(this.changes){
        c_params={
          module:"LEAVE/HOLIDAY_LIST",
          menu:"ADD_ON_LEAVE_REQUEST",
          method:"VIEW",
          approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
          user_id:this.user_id,
          leaveApplication_from_date:this.fromDate,
          leaveApplication_to_date:this.toDate,
          page_number:1,
          data_per_page:10,
          pagination:'TRUE'
         }
         if(this.addOnLeaveForm.invalid){
          this.addOnLeaveForm.markAllAsTouched()
        }
        else{
          this.tabset.tabs[0].active = true;
          this.tabsets.tabs[0].active = true;
          this.getAppliedLeaves(c_params)
        }
      }
    else{
      c_params={
        module:"LEAVE/HOLIDAY_LIST",
        menu:"ADD_ON_LEAVE_REQUEST",
        method:"VIEW",
        approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
        user_id:this.user_id,
        page_number:1,
        data_per_page:10,
        pagination:'TRUE'
       }
       this.getByStatus(c_params)
    }
    }
}
