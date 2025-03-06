import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { Subject, take } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  BreadCrumbsTitle:any='My timesheets ';
  timeSheetForm:FormGroup
  allDetails: any = [];
  params: any = {};
  pagination: { page_number: any; data_per_page: number; };
  page: any = 1;
  
  changes: boolean;
 
  selectedTab:string = 'Pending';
  userId:any;
  count: number;
  cardData: any = {};

  totalCount: any;
  term:string;
  showSearch=false;
  @ViewChild('tabset') tabset: TabsetComponent;
  orgId: any;
  // tableSize: any = 10;
  selectedTabId: number;
  submitted: boolean = false;
  page_size:number = 5;
  refresh: boolean = false;
  allDetailsExport = new Subject<any>();
  constructor(
    private _fb:FormBuilder,
    private api:ApiserviceService,
    private datepipe:DatePipe,
    private location:Location,private cdref: ChangeDetectorRef,
    private common_service:CommonServiceService,
) { }
  goBack(event)
  {
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  this.selectedTab = 'Pending'
  }
  get f(){
    return this.timeSheetForm.controls;
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id')
    this.userId = sessionStorage.getItem('user_id')
      this.initForm()
      
      this.getByStatus(`?organization=${this.orgId}&status=${1}&user=${this.userId}&page=${1}&page_size=${5}`)
      this.getStatusCount(`?user=${this.userId}&get-count=true&organization=${this.orgId}`)
  }
 initForm(){
  this.timeSheetForm = this._fb.group({
    from_date:['',Validators.required],
    to_date:['',Validators.required]
  })
 }
  
  getByStatus(params){

    this.api.getData(`${environment.live_url}/${environment.time_sheets}/${params}`).subscribe((res:any)=>{
     if(res?.['results']){
       this.allDetails = res?.['results'] 
       this.totalCount = { pageCount: res?.['total_pages'], currentPage: res?.['current_page'],itemsPerPage:5,totalCount:res?.['total_no_of_record'],reset:this.refresh};
     }else if(res){
      const processedRows = this.prepareRows(res);
      this.allDetailsExport.next(processedRows);
      
     }
    
    },(error)=>{
      this.api.showError(error?.error?.message)
    })
 }
reset(){
  this.timeSheetForm.reset()
  this.refresh = true
  const selectedTab = this.selectedTabId || 1
  this.getByStatus(`?organization=${this.orgId}&status=${selectedTab}&user=${this.userId}&page=${this.page}&page_size=${this.page_size}`)
}
  getStatusCount(params){ 
    this.api.getData(`${environment.live_url}/${environment.time_sheets}/${params}`).subscribe((res:any)=>{
      if( res){
        
        this.cardData = {
          approved_count:res.Approved,
          request_count:res.Pending,
          declined_count:res.Declined,
          total_count:res.total,
        }
      } 
    },(error)=>{
      this.api.showError(error?.error?.message)
    })

  }
  changeFormat(){
    // this.fromDate = this.timeSheetForm.value.from_date
    // this.toDate   = this.timeSheetForm.value.to_date
    this.changes  = true;
    //this.month    = this.timeSheetForm.value.to_date
    this.timeSheetForm.patchValue({
      to_date:''
    })
   }
   dateModified(){
    this.timeSheetForm.patchValue({
      to_date:''
    })
   }
   buttonClick(event){
    const selectedTab = this.selectedTabId || 1
    this.refresh = false

    if(event){
      this.getStatusCount(`?user=${this.userId}&get-count=true&organization=${this.orgId}`)
      //this.cdref.detectChanges();
      let query = `?organization=${this.orgId}&status=${selectedTab}&user=${this.userId}&page=${event.page}&page_size=${event.page_size}`
      let c_params = {
        status: this.selectedTab ? this.selectedTab : 'Pending',
        timesheets_to_date: this.datepipe.transform(this.timeSheetForm.value.to_date, 'yyyy-MM-dd'),
        timesheets_from_date: this.datepipe.transform(this.timeSheetForm.value.from_date, 'yyyy-MM-dd')
      };
      if(this.submitted && this.timeSheetForm.valid){
         query += `&from-date=${c_params['timesheets_from_date']}&to-date=${c_params['timesheets_to_date']}`
      }
    this.getByStatus(query)
    }else{
      this.getByStatus(`?organization=${this.orgId}&status=${selectedTab}&user=${this.userId}&page=${this.page}&page_size=${this.page_size}`)
    }
  }
  searchFiter(event){
   // console.log(event)
  }
  prepareRows(data: any[]): any[] {
    const selectedTab = this.selectedTabId || 1
    return data?.map((item: any, index: number) => {
      const tasks = item.tasks.map((task: any) => task.task__task_name).join(', ') || 'NA';
      const hours = item.tasks.map((task: any) => task.time_required_to_complete).join(', ') || 'NA';
       // Common columns
    const row = [
      index + 1,
      item.created_date ? new Date(item.created_date).toLocaleDateString() : 'NA',
      item.created_by_first_name || 'NA',
      tasks,
      hours,
      item.status_name || 'NA',
      item.updated_datetime ? new Date(item.updated_datetime).toLocaleDateString() : 'NA',
    ];

    // Add specific columns based on selectedTab
    if (selectedTab === 2) { // Approved Tab
      row.push(
        item.approved_on ? new Date(item.approved_on).toLocaleDateString() : 'NA',
        item.approved_by_name || 'NA'
      );
    } else if (selectedTab === 3) { // Rejected Tab
      row.push(
        item.rejected_on ? new Date(item.rejected_on).toLocaleDateString() : 'NA',
        item.rejected_by_name || 'NA',
        item.comment || 'NA'
      );
    }

    return row;
    });
  }
  
  
  exportToExcel() {
    const selectedTab = this.selectedTabId || 1
    this.getByStatus(`?organization=${this.orgId}&status=${selectedTab}&user=${this.userId}`)
    this.allDetailsExport.pipe(take(1)).subscribe({
      next: (rows: any[][]) => {
        if (!rows || rows.length === 0) {
          console.error('No data available for export.');
          return;
        }
    
        // Define column headers manually
        const headers = ['S.No', 'Created Date', 'Employee', 'Task', 'Hours', 'Status', 'Saved On'];
        if (selectedTab === 2) {
          headers.push('Approved On', 'Approved By');
        } else if (selectedTab === 3) {
          headers.push('Rejected On', 'Rejected By','Comments');
        }
        // Merge headers and data
        const data = [headers, ...rows];
    
        // Convert 2D array to worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data); // Converts array of arrays into a sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');
    
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, 'table-data.xlsx');
      },
      error: (err) => {
        console.error('Error fetching data for export:', err);
      },
    });
    
    
   
  
    
  }
  async submit() {
    let c_params = {};
    
    // Check if form is valid before proceeding
    if (this.timeSheetForm.invalid) {
      this.timeSheetForm.markAllAsTouched(); // Show validation only if form is invalid
      return; // Exit the function early if invalid
    }else{
      // If changes exist and form is valid
      
        c_params = {
          status: this.selectedTab ? this.selectedTab : 'Pending',
          timesheets_to_date: this.datepipe.transform(this.timeSheetForm.value.to_date, 'yyyy-MM-dd'),
          timesheets_from_date: this.datepipe.transform(this.timeSheetForm.value.from_date, 'yyyy-MM-dd')
        };

        this.allDetails = [];
        let query:string;
        if(this.selectedTabId){
         query = `?from-date=${c_params['timesheets_from_date']}&to-date=${c_params['timesheets_to_date']}&status=${this.selectedTabId}&organization=${this.orgId}&user=${this.userId}&page=${this.page}&page_size=${this.page_size}`
        }else{
          query = `?from-date=${c_params['timesheets_from_date']}&to-date=${c_params['timesheets_to_date']}&status=${1}&organization=${this.orgId}&user=${this.userId}&page=${this.page}&page_size=${this.page_size}`
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
     let query = `?organization=${this.orgId}&status=${this.selectedTabId}&user=${this.userId}`
     if(this.submitted && this.timeSheetForm.valid){
      const to_date = this.datepipe.transform(this.timeSheetForm.value.to_date, 'yyyy-MM-dd')
      const from_date =  this.datepipe.transform(this.timeSheetForm.value.from_date, 'yyyy-MM-dd')
      query=`?organization=${this.orgId}&status=${this.selectedTabId}&user=${this.userId}&from-date=${from_date}&to-date=${to_date}&page=${this.page}&page_size=${this.page_size}`
     }else{
      query=`?organization=${this.orgId}&status=${this.selectedTabId}&user=${this.userId}&page=${this.page}&page_size=${this.page_size}`
     }
      this.getByStatus(query)
    
   
    }
  
}
