import { DatePipe } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-applied-approved-leaves',
  templateUrl: './applied-approved-leaves.component.html',
  styleUrls: ['./applied-approved-leaves.component.scss']
})
export class AppliedApprovedLeavesComponent implements OnInit {
  @ViewChild('tabset') tabset: TabsetComponent;
  appliedLeaveForm:FormGroup;
  BreadCrumbsTitle:any='Leave Status';
 
  selectedTab: any = 'Pending';
  currDate:any;
  AllListData:any = []
  // fromDate: any ;
  // toDate: any ;
  changes: boolean = false;
  month: any;
  params: {};
 
  tableSize: any;
  yetToApprove: any = [];
  approved: any = [];
  declined: any = {};
  totalCount: any;
  user_id =sessionStorage.getItem('user_id')
  permission: any;
  orgId: any;
  term:any;
  showSearch = false
  allCardData: Object;
  selectedTabId: number;
  submitted: boolean = false;
  page_size: number = 5;
  page: number = 1;
  refresh: boolean = false;
  constructor(
    private api:ApiserviceService,
    private datepipe:DatePipe,
    private _fb:FormBuilder,
    private location:Location,
    private common_service:CommonServiceService,
    private cdref: ChangeDetectorRef,
    ) {}
  goBack(event)
  {
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
  this.appliedLeaveForm = this._fb.group({
    from_date:['',Validators.required],
    to_date:['' ,Validators.required]
  })
  }
  ngOnInit(): void { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id')
    this.initForm();
    // this.getAppliedLeaves('')
    this.getCount()
    this.getByStatus(`?status=1&employee-id=${this.user_id}&organization=${this.orgId}&page=${this.page}&page_size=${this.page_size}`)
  }
  getCount(){
    this.api.getData(`${environment.live_url}/${environment.employee_leave_details}/?get-count=true&employee-id=${this.user_id}&organization=${this.orgId}`).subscribe(res=>{
      if(res){ 
      
      this.allCardData = res
      //this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page,itemsPerPage:10}; 
    }
  },(error:any)=>{
    this.api.showError(error?.error?.message)
  })
  
  }
  searchFiter(event){
    if(event){
      this.cdref.detectChanges();
      // if(this.changes){
      //   let params= {
      //     module:"LEAVE/HOLIDAY_LIST",
      //     menu:"APPLIED/APPROVIED_LEAVES",
      //     method:"VIEW",
      //     page_number:event.page,
      //     data_per_page:event.tableSize,
      //     search_key:event.search_key,
      //     user_id:this.user_id,
      //     pagination:"TRUE",
      //     approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
      //     leaveApplication_from_date:this.fromDate,
      //     leaveApplication_to_date:this.toDate
      //   }
      //  this.getAppliedLeaves(params);
      // }
      // else{
      //   let params= {
      //     module:"LEAVE/HOLIDAY_LIST",
      //     menu:"APPLIED/APPROVIED_LEAVES",
      //     method:"VIEW",
      //     page_number:event.page,
      //     data_per_page:event.tableSize,
      //     search_key:event.search_key,
      //     user_id:this.user_id,
      //     pagination:"TRUE",
      //     approved_state:this.selectedTab? this.selectedTab :'YET_TO_APPROVED',
      //   }
      //   this.getByStatus(`?status=${this.selectedTabId}&employee-id=${this.user_id}&organization=${this.orgId}`)
      // }  
    }
    
  }
  
  buttonClick(event){
    if(event){
      this.cdref.detectChanges();
      const status = this.selectedTabId || 1
      let query = `?organization=${this.orgId}&status=${status}&employee-id=${this.user_id}&page=${event.page}&page_size=${event.page_size}`;
      let c_params = {
        status: this.selectedTab ? this.selectedTab : 'Pending',
        leave_to_date: this.datepipe.transform(this.appliedLeaveForm.value.to_date, 'yyyy-MM-dd'),
        leave_from_date: this.datepipe.transform(this.appliedLeaveForm.value.from_date, 'yyyy-MM-dd')
      };
      if(this.appliedLeaveForm.valid && this.submitted){
       
        query +=`&from-date=${c_params['leave_from_date']}&to-date=${c_params['leave_to_date']}`
      }
      this.refresh = false
      this.getByStatus(query)
        this.getCount()
       
    }
  }
  get f(){
  return  this.appliedLeaveForm.controls 
  }
  getByStatus(params){
    // this.api.getData(`${environment.live_url}/${environment.employee_leave_details}/?status-id=${this.selectedTabId}&employee-id=${this.user_id}`).subscribe(res=>{
      this.api.getData(`${environment.live_url}/${environment.employee_leave_details}/${params}`).subscribe(res=>{
    if(res){ 
        this.AllListData = res?.['results']
       this.totalCount = { pageCount: res?.['total_pages'], currentPage: res?.['current_page'],itemsPerPage:5,totalCount:res?.['total_no_of_record'],reset:this.refresh};
    }
  },(error:any)=>{
    this.api.showError(error?.error?.message)
  })
  }
  // getAppliedLeaves(paginate){
  //   this.api.getData(`${environment.live_url}/${environment.employee_leave_details}/?status=1&employee-id=${this.user_id}&organization=${this.orgId}`).subscribe(res=>{
  //       if(res){ 
  //       this.AllListData = res
  //       //this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page,itemsPerPage:10}; 
  //     }
  //   },(error:any)=>{
  //     this.api.showError(error?.error?.message)
  //   })
    
  // }

   changeFormat(){
    //console.log(this.appliedLeaveForm.value.from_date,"CHANGE")
    // this.fromDate = this.datepipe.transform(this.appliedLeaveForm.value.from_date,'dd/MM/yyyy')
    // this.toDate   = this.datepipe.transform(this.appliedLeaveForm.value.to_date,'dd/MM/yyyy')
    this.changes  = true;
    // if(this.appliedLeaveForm.value.to_date){
    //   this.month    = this.appliedLeaveForm.value.to_date
    // }
    this.appliedLeaveForm.patchValue({
      to_date:''
   })
   }
   reset(){
    this.appliedLeaveForm.reset()
    this.AllListData = []
    const selectedTab = this.selectedTabId || 1
    this.refresh = true
    this.getByStatus(`?status=${selectedTab}&employee-id=${this.user_id}&organization=${this.orgId}&page=${this.page}&page_size=${this.page_size}`)
  }
    async submit() {
      let c_params = {};
      
      // Check if form is valid before proceeding
      if (this.appliedLeaveForm.invalid) {
        this.appliedLeaveForm.markAllAsTouched(); // Show validation only if form is invalid
        return; // Exit the function early if invalid
      }else{
        // If changes exist and form is valid
        
          c_params = {
            status: this.selectedTab ? this.selectedTab : 'Pending',
            leave_to_date: this.datepipe.transform(this.appliedLeaveForm.value.to_date, 'yyyy-MM-dd'),
            leave_from_date: this.datepipe.transform(this.appliedLeaveForm.value.from_date, 'yyyy-MM-dd')
          };
  
          this.AllListData = [];
          let query:string;
          if(this.selectedTabId){
           query = `?from-date=${c_params['leave_from_date']}&to-date=${c_params['leave_to_date']}&status=${this.selectedTabId}&employee-id=${this.user_id}&organization=${this.orgId}&page=${1}&page_size=${5}`
          }else{
            query = `?from-date=${c_params['leave_from_date']}&to-date=${c_params['leave_to_date']}&status=${1}&employee-id=${this.user_id}&organization=${this.orgId}&page=${1}&page_size=${5}`
          }
          this.getByStatus(query);  
          this.submitted = true
        
      }
    
     
    }
    tabState(data){
      if(data.tab.textLabel === 'Approved'){
        this.selectedTab = 'Approved'
        this.selectedTabId = 2
      }
      else if(data.tab.textLabel === 'Pending' ){
        this.selectedTab = 'Pending' 
        this.selectedTabId = 1
      }
      else if(data.tab.textLabel === 'Declined'){
        this.selectedTab = 'Declined'
        this.selectedTabId = 3
      }
      let query:string = `?organization=${this.orgId}&status=${this.selectedTabId}&employee-id=${this.user_id}`;
      if(this.submitted && this.appliedLeaveForm.valid){
        const to_date = this.datepipe.transform(this.appliedLeaveForm.value.to_date, 'yyyy-MM-dd')
        const from_date =  this.datepipe.transform(this.appliedLeaveForm.value.from_date, 'yyyy-MM-dd')
        query=`?organization=${this.orgId}&status=${this.selectedTabId}&employee-id=${this.user_id}&from-date=${from_date}&to-date=${to_date}&page=${1}&page_size=${5}`
       }else{
        query=`?organization=${this.orgId}&status=${this.selectedTabId}&employee-id=${this.user_id}&page=${1}&page_size=${5}`
       }
      this.getByStatus(query)
 
   
    
    }
    
}
