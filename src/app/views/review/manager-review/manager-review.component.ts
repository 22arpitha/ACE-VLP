import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';
import { DatePipe, Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { Subject, take } from 'rxjs';
import * as XLSX from 'xlsx';
import { SubModuleService } from 'src/app/service/sub-module.service';
@Component({
  selector: 'app-manager-review',
  templateUrl: './manager-review.component.html',
  styleUrls: ['./manager-review.component.scss']
})
export class ManagerReviewComponent implements OnInit {
  BreadCrumbsTitle: any = 'Approvals';
  panelOpenState = true;
  user_id: any;
  user_role_id: number;
  empInfoList: any = [];
  empLeaveList: any = [];
  matchingEmpInfo: any;
  manger_info: any = [];
  emptimesheet: any = [];
  timesheetAccess: any;
  leaveAccess: any;
  orgId: any;
  selectedSection = 'lists';
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  // employeeList = [
  //   { name: 'Surya', id: 149, role: 'Designer', email: 'Surya@ekfrazon.in', contact: '62695723681' },
  //   { name: 'Manoj', id: 150, role: 'Tester', email: 'Manoj@ekfrazon.in', contact: '98792036781' }
  // ];

  leaveList:any = []

  timesheetList:any = []

  selectedTimesheetTabId: number;
  selectedTimesheetTab: string;
  page = 1;
  count:any= 0;
  selectedLeaveTab: string;
  selectedLeaveTabId: number;
  allDetailsExport = new Subject<any>();
  userRole: String;
  accessPermissions = []
  
  constructor(
    private api: ApiserviceService,
    private modalService: NgbModal,
    private _timesheet: TimesheetService,
    private location: Location,
    private common_service: CommonServiceService,
    private datepipe:DatePipe,
    private accessControlService: SubModuleService
  ) { }
  data = []

  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id')
    this.user_id = sessionStorage.getItem('user_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getEmployeeData(`page=${this.page}&page_size=${this.tableSize}`)
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
 
  getEmployeeData(params) {
    this.api.getData(`${environment.live_url}/${environment.all_employee}/?organization_id=${this.orgId}&${params}`).subscribe(response => {
      if (response) {
        this.empInfoList = response?.['results'];
        const noOfPages:number = response?.['total_pages']
        this.count  = noOfPages * this.tableSize;
        this.page=response?.['current_page'];
      }
    }, (error => {
      this.api.showError(error?.error?.message)
    }))
  }
  selectedTab(event){
    this.getModuleAccess();
    if(event){
      this.selectedSection = event
    }
    if(event === 'lists'){
      this.count = 0;
      this.page = 1
      this.getEmployeeData(`page=${this.page}&page_size=${this.tableSize}`)
    }else if(event === 'leaves'){
      this.count = 0;
      this.page = 1
      this.getAllLeaves(`?status=1&organization=${this.orgId}&page=${this.page}&page_size=${this.tableSize}`)
    }else if(event === 'timesheets'){
      this.count = 0;
      this.page = 1
      this.getAllTimesheets(`?organization=${this.orgId}&status=1&page=${this.page}&page_size=${this.tableSize}`)
    }
    
  }
  getAllTimesheets(params){
    this.api.getData(`${environment.live_url}/${environment.time_sheets}/${params}`).subscribe((response:any) => {
      if (response?.['results']) {
        this.timesheetList = response?.['results']
        const noOfPages:number = response?.['total_pages']
        this.count  = noOfPages * this.tableSize;
        this.page= response?.['current_page']; 
    }else if(response){
      const processedRows = this.prepareRows(response);
      this.allDetailsExport.next(processedRows);
     }
  },(error)=>{
    this.api.showError(error?.error?.message)
  })
  }
  getAllLeaves(params){
    this.api.getData(`${environment.live_url}/${environment.employee_leave_details}/${params}`).subscribe((res:any)=>{
      if(res){
        this.leaveList = res?.['results']
        const noOfPages:number = res?.['total_pages']
        this.count  = noOfPages * this.tableSize;
        this.page=res?.['current_page'];
      }
    },(error)=>{
      this.api.showError(error?.error?.message)
    })
  }
  tabTimesheet(data){
    if(data.tab.textLabel === 'Approved'){
      this.selectedTimesheetTab = 'Approved'
      this.selectedTimesheetTabId = 2
    }
    else if(data.tab.textLabel === 'Pending' ){
      this.selectedTimesheetTab = 'Pending' 
      this.selectedTimesheetTabId = 1
    }
    else if(data.tab.textLabel === 'Declined'){
      this.selectedTimesheetTab = 'Declined'
      this.selectedTimesheetTabId = 3
    }
    let query:string = `?organization=${this.orgId}&status=${this.selectedTimesheetTabId}&page=${1}&page_size=${this.tableSize}`;
   
    this.getAllTimesheets(query)
  }
  tabLeaveSection(data){
    if(data.tab.textLabel === 'Pending' ){
      this.selectedLeaveTab = 'Pending' 
      this.selectedLeaveTabId = 1
      
    }
    else if(data.tab.textLabel === 'Approved'){
      this.selectedLeaveTab = 'Approved'
      this.selectedLeaveTabId = 2
    }
   
    else if(data.tab.textLabel === 'Declined'){
      this.selectedLeaveTab = 'Declined'
      this.selectedLeaveTabId = 3
    }
    let query = `?organization=${this.orgId}&status=${this.selectedLeaveTabId}&page=${1}&page_size=${this.tableSize}`;
    this.getAllLeaves(query)
  }
  
  onTableDataChange(event:any){
    this.page = event;
    let leaveStatusId = this.selectedLeaveTabId || 1
    let timesheetTabId = this.selectedTimesheetTabId || 1
    if(this.selectedSection === 'lists'){
      this.count = 0;
      this.getEmployeeData(`page=${this.page}&page_size=${this.tableSize}`)
    }else if(this.selectedSection === 'leaves'){
      this.count = 0;
      this.getAllLeaves(`?status=${leaveStatusId}&organization=${this.orgId}&page=${this.page}&page_size=${this.tableSize}`)
    }else if(this.selectedSection === 'timesheets'){
      this.count = 0;
      this.getAllTimesheets(`?organization=${this.orgId}&status=${timesheetTabId}&page=${this.page}&page_size=${this.tableSize}`)
    }
  }  
  onTableSizeChange(event:any): void {
    if(event){
     
    this.tableSize = Number(event.value);
   
    let leaveStatusId = this.selectedLeaveTabId || 1
    let timesheetTabId = this.selectedTimesheetTabId || 1
    if(this.selectedSection === 'lists'){
      this.count = 0;
      this.getEmployeeData(`page=${1}&page_size=${this.tableSize}`)
    }else if(this.selectedSection === 'leaves'){
      this.count = 0;
      this.getAllLeaves(`?status=${leaveStatusId}&organization=${this.orgId}&page=${1}&page_size=${this.tableSize}`)
    }else if(this.selectedSection === 'timesheets'){
      this.count = 0;
      this.getAllTimesheets(`?organization=${this.orgId}&status=${timesheetTabId}&page=${1}&page_size=${this.tableSize}`)
    }
    }
  } 
  
  open(content, status: string) {
    const title = status.toLowerCase();
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: status === 'Decline' ? 'md' : 'sm',
        backdrop: true,
        centered: true
      });
  
      modelRef.componentInstance.title = `Are you sure you want to ${title}`;
      modelRef.componentInstance.message = `${status}`;
  
      // Subscribe to comments first
      if (status === 'Decline') {
        modelRef.componentInstance.comments?.subscribe(async comments => {
          if (comments) {
            await this.updateStatus(content, status, comments);
          }
          modelRef.close(); // Close only after handling comments
        });
      }
  
      // Subscribe to status separately
      modelRef.componentInstance.status.subscribe(async resp => {
        if (resp === "ok" && status !== 'Decline') {
          await this.updateStatus(content, status);
          modelRef.close(); // Close only for non-Decline actions
        } else if (resp !== "ok") {
          modelRef.close(); // Close modal if action is cancelled
        }
      });
    }
  }
  

  openDialogue(content, status) {
    const title = status.toLowerCase();
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: status === 'Decline' ? 'md' : 'sm',
        backdrop: true,
        centered: true
      });
  
      modelRef.componentInstance.title = `Are you sure you want to ${title}`;
      modelRef.componentInstance.message = `${status}`;
  
      if (status === 'Decline') {
        // Subscribe to comments before handling status
        modelRef.componentInstance.comments?.subscribe(async comments => {
          if (comments) {
            await this.updateTimesheetStatus(content, status, comments);
          }
          modelRef.close(); // Close only after processing comments
        });
      }
  
      // Now handle status change
      modelRef.componentInstance.status.subscribe(async resp => {
        if (resp === "ok" && status !== 'Decline') {
          await this.updateTimesheetStatus(content, status);
          modelRef.close(); // Close immediately if not Decline
        } else if (resp !== "ok") {
          modelRef.close(); // Close if status is not 'ok'
        }
      });
    }
  }
  
  
  updateTimesheetStatus(content, status,comments?) {
    const confirmText = status === 'Approve' ? 'approved' : 'declined'
    let date = new Date()
    let formattedDate = this.datepipe.transform(date,'yyyy-MM-dd')
    
  if(status === 'Approve'){
    let data =   {
      id: content.id,
      status: 2 ,
      organization: this.orgId,
      employee: content.created_by,
      approved_by: this.user_id || null,
      approved_on: formattedDate || null,
      rejected_by: null,
      rejected_on: null 
  }
    this.api.postData(`${environment.live_url}/${environment.update_timesheet_status}/`,data).subscribe(res => {
      if (res) {
        this.api.showSuccess(`Timesheet ${confirmText} successfully`)
        this.getAllTimesheets(`?organization=${this.orgId}&status=1&page=${1}&page_size=${10}`)
      }
    }, (error => {
      this.api.showError(error?.error?.message)
    }))
  }if(status === 'Decline'){
    const declined = {
      timesheet_id: content.id,
      comment: comments,
      status:3,
     rejected_by: this.user_id || null
    }
  this.api.postData(`${environment.live_url}/${environment.timesheet_comment}/`,declined).subscribe(res => {
    if (res) {
      this.api.showSuccess(`Timesheet ${confirmText} successfully`)
      this.getAllTimesheets(`?organization=${this.orgId}&status=1&page=${1}&page_size=${10}`)
    }
  }, (error => {
    this.api.showError(error?.error?.message)
  }))
  }
   
  }
  prepareRows(data: any[]): any[] {
    const selectedTab = this.selectedTimesheetTabId || 1
    return data?.map((item: any, index: number) => {
      const tasks = item.tasks.map((task: any) => task.task__task_name).join(', ') || 'NA';
      const hours = item.tasks.map((task: any) => task.time_required_to_complete).join(', ') || 'NA';
       // Common columns
    const row = [
      index + 1,
      item.created_date ? new Date(item.created_date).toLocaleDateString() : 'NA',
      item.created_by_first_name || 'NA',
      item.client_name,
      item.project_name,
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
    const timesheetTabId = this.selectedTimesheetTabId || 1
    this.getAllTimesheets(`?organization=${this.orgId}&status=${timesheetTabId}`)
    this.allDetailsExport.pipe(take(1)).subscribe({
      next: (rows: any[][]) => {
        if (!rows || rows.length === 0) {
          console.error('No data available for export.');
          return;
        }
    
        // Define column headers manually
        const headers = ['S.No', 'Created Date', 'Employee','Client Name','Project Name', 'Task', 'Hours', 'Status', 'Saved On'];
        if (timesheetTabId === 2) {
          headers.push('Approved On', 'Approved By');
        } else if (timesheetTabId === 3) {
          headers.push('Rejected On', 'Rejected By','Comments');
        }
        // Merge headers and data
        const data = [headers, ...rows];
    
        // Convert 2D array to worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data); // Converts array of arrays into a sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');
    
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, 'Timesheet.xlsx');
      },
      error: (err) => {
        console.error('Error fetching data for export:', err);
      },
    });
    
    
   
  
    
  }
  
  updateStatus(content, status,comments?) {
    this.user_id = JSON.parse(sessionStorage.getItem('user_id') || '')
    let date = new Date()
    let formattedDate = this.datepipe.transform(date,'yyyy-MM-dd')
    const confirmText = status === 'Approve' ? 'approved' : 'declined'
   
   if(status === 'Approve'){
    let data = {
      id: content.id,
      status:  2 ,
      organization: this.orgId,
      employee: content.employee,
      leave_type:content.leave_type,
      approved_by: this.user_id || null,
      approved_on: formattedDate || null
  }
    this.api.updateData(`${environment.live_url}/${environment.update_leave_details}/`,data).subscribe(res => {

      if (res) {
        this.api.showSuccess(`Leave ${confirmText} successfully`)
        this.getAllLeaves(`?status=1&organization=${this.orgId}&page=${1}&page_size=${10}`)
      }

    }, ((error: any) => {
      this.api.showError(error?.error?.message)
    }))
   }else if(status === 'Decline'){
   const data ={
    comment: comments,
    leave_id: content.id,
    status:3,
    rejected_by:this.user_id || null,
    rejected_on:formattedDate || null
    }
    this.api.postData(`${environment.live_url}/${environment.leave_comment}/`,data).subscribe(res => {
      if (res) {
        this.api.showSuccess(`Leave ${confirmText} successfully`)
        this.getAllLeaves(`?status=1&organization=${this.orgId}&page=${1}&page_size=${10}`)
      }

    }, ((error: any) => {
      this.api.showError(error?.error?.message)
    }))
   }
   
  }
}
