import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { environment } from 'src/environments/environment';
import { Subject, take } from 'rxjs';
import * as XLSX from 'xlsx';
import { SubModuleService } from 'src/app/service/sub-module.service';

@Component({
  selector: 'app-month-timesheet',
  templateUrl: './month-timesheet.component.html',
  styleUrls: ['./month-timesheet.component.scss']
})
export class MonthTimesheetComponent implements OnInit {
  monthForm: FormGroup;
  BreadCrumbsTitle: any = 'Month timesheets';
  term:any;
  showSearch:any;
  page: any = 1;
  selectedTab: string = 'Pending';
  allDetails: any = [];
  submited: boolean = false;
  openDropdown: boolean = false;
  allListDataids: any = [];
  totalCount: any;
  user_id: any;
  accessConfig: any = [];
  exebtn: boolean = false;
  acceptOption: boolean = false;
  rejectOption: boolean = false;
  c_params: {};
  itemPerPageCount: any = 10;
  userRole: String;
  accessPermissions = []
  @ViewChild('tabset') tabset: TabsetComponent;
  @ViewChild('tabsets') tabsets: TabsetComponent;

  monthNames = [
    {
      name:"January",
      id:1
    },
    {
      name:"February",
      id:2
    },
    {
      name:"March", 
      id:3
    },
    {
      name:"April",
      id:4
    },
    {
      name:"May",
      id:5
    },
    {
      name:"June",
      id:6
    },
    {
      name:"July",
      id:7
    },
    {
      name:"August",
      id:8
    },
    {
      name:"September",
      id:9
    },
    {
      name:"October",
      id:10
    },
    {
      name:"November",
      id:11
    },
    {
      name:"December",
      id:12
    }  
         
  ];
  
 
  
  formattedDate: any;
  changes: boolean = false;
  orgId: any;
  currentMonth: number;
  selectedTabId: number;
  refresh: boolean = false;
  page_size: number = 5;
  allDetailsExport = new Subject<any>();
  constructor(
    private fb: FormBuilder,
    private api: ApiserviceService,
    private location: Location,
    private _timesheet: TimesheetService, 
    private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,) {
    this.currentMonth = new Date().getMonth() + 1;
     }
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.initForm()
    this.user_id = sessionStorage.getItem('user_id')
    this.orgId = sessionStorage.getItem('organization_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getMonthApprovals(`?status=1&organization=${this.orgId}&month=${this.currentMonth}&page=${this.page}&page_size=${this.page_size}`)
   
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  getMonthApprovals(params) {
   // this.timesheetService.getTodaysApprovalTimesheet(params).subscribe(res => {
      this.api.getData(`${environment.live_url}/${environment.timesheets}/${params}`).subscribe((res:any) =>{
      if (res?.['results']) {
        this.allDetails = res?.['results'];
        this.totalCount = { pageCount: res?.['total_pages'], currentPage: res?.['current_page'],itemsPerPage:5,totalCount:res?.['total_no_of_record'],reset:this.refresh};
      }else if(res){
        const processedRows = this.prepareRows(res);
        this.allDetailsExport.next(processedRows);
       }
    })
  }
  get f() {
    return this.monthForm.controls;
  }
  initForm() {
    this.monthForm = this.fb.group({
      fromMonth: [this.currentMonth, Validators.required],
    })
  }


  handleMonthSelection(selectedMonth) {
    //console.log(selectedMonth,"MONTHNAME");
    const currentYear = new Date().getFullYear();
    const monthIndex = new Date(Date.parse(selectedMonth + ' 1, ' + currentYear)).getMonth() + 1;
    const formattedMonth = ('0' + monthIndex).slice(-2); // Add leading zero if needed
    this.formattedDate = formattedMonth 
  }
  onChanges() {
    this.changes = true
  }
  

  submit() {
    if (this.monthForm.invalid) {
      this.monthForm.markAllAsTouched()
      this.api.showWarning('Please select month')
    }
    else {
      this.allDetails = []
      this.submited = true;
     
      const selectedTabId = this.selectedTabId || 1
        let query= `?status=${selectedTabId}&organization=${this.orgId}&month=${this.monthForm.value.fromMonth}&page=${this.page}&page_size=${this.page_size}`
     
      this.getMonthApprovals(query)
    }
  }
  // getByStatus(params) {
  //   this.allListDataids = [];
  //   this.allDetails = [];
  //   this.exebtn = false;
  // //  this.api.getData(`${environment.live_url}/${environment.time_sheets_monthly}?user_id=${params.user_id}&module=${params.module}&menu=${params.menu}&method=${params.method}&approved_state=${params.approved_state}&search_key=${params.search_key}&page_number=${params.page_number}&data_per_page=${params.data_per_page}&pagination=${params.pagination}&organization_id=${this.orgId}`).subscribe(res => {
  //     this.api.getData(`${environment.live_url}/${environment.timesheets}/${params}`).subscribe(res =>{
  //     if (res ) {
        
  //         this.allDetails = res?.['timesheets']
  //         this.totalCount = { pageCount: res?.['total_pages'], currentPage: res?.['current_page'],itemsPerPage:5,totalCount:res?.['total_no_of_record'],reset:this.refresh};
  //     }
  //   }, ((error: any) => {
  //     this.api.showError(error.error.error.message)
  //   })
  //   )
  // }
  // getAllTimeSheet(params) {
  //   this.allListDataids = []
  //   this.allDetails = [];
  //   this.exebtn = false;
 
  //     this.api.getData(`${environment.live_url}/${environment.timesheets}/?status=${params.status}&month=${params.month}`).subscribe(res =>{
  //     if (res) {
  //       // if (res['result']['data'].length > 1) {
  //       //   res['result']['data'].forEach(element => {
  //       //     // console.log(element.id)
  //       //     this.allListDataids.push(element.id)
  //       //     this.exebtn = true;
  //       //   });
  //         this.allDetails = res?.['timesheets']
  //       //  this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page, itemsPerPage: this.itemPerPageCount };
  //     //   }
  //     //   else {
  //     //     if (res['result']['data'].length === 1) {
  //     //       this.allListDataids.push(res['result']['data'][0].id)
  //     //       this.exebtn = true;
  //     //       this.allDetails = res['result']['data']
  //     //       this.totalCount = { pageCount: res['result']['pagination'].number_of_pages, currentPage: res['result']['pagination'].current_page, itemsPerPage: this.itemPerPageCount };
  //     //     }
  //     //   }
  //     // } else {
  //     //   this.api.showWarning('No records found !')
  //      }

  //   }, ((error: any) => {
  //     this.api.showError(error.error.error.message)
  //   }))

  // }


  tabState(data) {
    //console.log(data,"REEE")
    if(data.tab.textLabel == 'Approved'){
      this.selectedTab = 'Approved'
      this.selectedTabId = 2
    }
    else if(data.tab.textLabel == 'Pending' ){
      this.selectedTab = 'Pending' 
      this.selectedTabId = 1
    }
    else if(data.tab.textLabel == 'Declined'){
      this.selectedTab = 'Declined'
      this.selectedTabId = 3
    }
    let query:string = `?status=${this.selectedTabId}&organization=${this.orgId}&month=${this.currentMonth}&page=${this.page}&page_size=${this.page_size}`;
    if(this.submited && this.monthForm.valid){
      query= `?status=${this.selectedTabId}&organization=${this.orgId}&month=${this.monthForm.value.fromMonth}&page=${this.page}&page_size=${this.page_size}`
    }
    this.getMonthApprovals(query)
    

  }

  buttonClick(event) {
    const selectedTab = this.selectedTabId || 1
    this.refresh = false
    if(event){
      this.getMonthApprovals(`?status=${selectedTab}&organization=${this.orgId}&month=${this.monthForm.value.fromMonth}&page=${event.page}&page_size=${event.page_size}`)
    }else{
      this.getMonthApprovals(`?status=${selectedTab}&organization=${this.orgId}&month=${this.currentMonth}&page=${this.page}&page_size=${this.page_size}`)
    }
    
  }

  searchFiter(event) {
  //console.log(event)
  }
  exeDropdown() {
    this.openDropdown = !this.openDropdown
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
    this.getMonthApprovals(`?status=${selectedTab}&organization=${this.orgId}&month=${this.monthForm.value.fromMonth}`)
    
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
  
  
  reset(){
    this.monthForm.reset()
    const selectedTab = this.selectedTabId || 1
    this.refresh = true
    this.getMonthApprovals(`?status=${selectedTab}&organization=${this.orgId}&month=${this.currentMonth}&page=${this.page}&page_size=${this.page_size}`)
   
  }
}
