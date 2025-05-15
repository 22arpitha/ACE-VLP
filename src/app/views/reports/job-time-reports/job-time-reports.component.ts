import { Component, OnInit } from '@angular/core';
import { tableColumns } from '../job-time-reports/job-time-reprots-config'
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { environment } from '../../../../environments/environment';
import { JobTimeSheetDetailsPopupComponent } from '../common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-job-time-reports',
  templateUrl: './job-time-reports.component.html',
  styleUrls: ['./job-time-reports.component.scss']
})
export class JobTimeReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Time Report';
term: string = '';
tableSize: number = 50;
   page: any = 1;
   tableSizes = [50,75,100,150,200];
   tableConfig:any = {
     columns: [],
     data: [],
     searchTerm: '',
     actions: [],
     accessConfig: [],
     tableSize: 50,
     pagination: true,
     headerTabs:true,
     showIncludeAllJobs:true,
     includeAllJobsEnable:false,
     includeAllJobsValue:false,
     selectedClientId:null,
     sendEmail:true,
     showDownload:true,
   };
   tabStatus:any='True';
   allJobStatus:any=[];
   statusList:String[]=[];
    user_id:any;
   userRole:any;
   client_id:any;
   isIncludeAllJobEnable:boolean=true;
   isIncludeAllJobValue:boolean=false;
  jobFilterList: any = [];
  clientName: { id: any; name: string; }[];
  jobName: { id: any; name: string; }[];
  statusName: { id: any; name: string; }[];
  selectedClientIds: any = [];
  selectedJobIds: any = [] ;
  selectedStatusIds: any = [];
  formattedData: any = [];
 constructor(
     private common_service:CommonServiceService,
     private api:ApiserviceService,
     private dialog:MatDialog,
   ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
      this.getJobList();
      this.getClientList();
      this.getStatusList();
    }

   ngOnInit(): void {
     this.common_service.setTitle(this.BreadCrumbsTitle)
     this.tableConfig = tableColumns;
     setTimeout(() => {
      this.getJobStatusList();
     }, 500);
   }

   getJobStatusList() {
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        if(resData){
          this.allJobStatus = resData;
          this.getTableData({
            page: this.page,
            pageSize: this.tableSize,
            searchTerm: this.term
          });
        }
      },
      (error:any)=>{
        this.api.showError(error?.error?.detail);
      }
    )
  }

   // Called when user changes page number from the dynamic table
 onTableDataChange(event: any) {
   const page = event;
   this.page = page;

   this.getTableData({
     page: page,
     pageSize: this.tableSize,
     searchTerm: this.term
   });
 }

 // Called when user changes page size from the dynamic table
 onTableSizeChange(event: any): void {
   if(event){
     const newSize = Number(event.value || event);
     this.tableSize = newSize;
     this.page = 1; // reset to first page
     this.getTableData({
       page: this.page,
       pageSize: this.tableSize,
       searchTerm: this.term,
       client_ids: this.selectedClientIds,
       job_ids: this.selectedJobIds,
       job_status: this.selectedStatusIds,
     });
   }

 }

 // Called from <app-dynamic-table> via @Output actionEvent
 handleAction(event: { actionType: string; detail: any,key:any}) {
   switch (event.actionType) {
      case 'navigate':
        this.viewtimesheetDetails(event['row']);
       break;
      case 'tableDataChange':
       this.onTableDataChange(event.detail);
       break;
       case 'tableSizeChange':
       this.onTableSizeChange(event.detail);
       break;
       case 'search':
       this.onSearch(event.detail);
       break;
       case 'export_csv':
       this.exportCsvOrPdf(event.detail);
       break;
       case 'export_pdf':
       this.exportCsvOrPdf(event.detail);
       break;
       case 'headerTabs':
        this.tabStatus = event['action'];
        this.getClientList();
        this.getJobList();
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          job_status: this.selectedStatusIds,
        });
       break;
       case 'filter':
        this.onApplyFilter(event.detail,event.key);
        break;
       case 'includeAllJobs':
        this.isIncludeAllJobValue= event['action'];
        this.client_id = event['action'] && event['client_id'] ? event['client_id'] : null;
        this.isIncludeAllJobEnable = event['action']  || (!event['action'] && event['client_id'])  ? false : true;
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          job_status: this.selectedStatusIds,
        });
      break;
      case 'sendEmail':
      this.client_id = event['client_id'] ? event['client_id'] : null;
      this.sendEamils();
      break;
     default:
      this.getTableData({
        page: 1,
        pageSize: this.tableSize,
        searchTerm: this.term,
        client_ids: this.selectedClientIds,
        job_ids: this.selectedJobIds,
        job_status: this.selectedStatusIds,
      });
   }
 }
onApplyFilter(filteredData: any[], filteredKey: string): void {

  if (filteredKey === 'client-ids') {
    this.selectedClientIds = filteredData;
    if(filteredData && filteredData?.length===0){
      this.isIncludeAllJobEnable=true;
      this.isIncludeAllJobValue=false;
      this.client_id=null;
    }else if(filteredData && filteredData?.length>1){
      this.isIncludeAllJobEnable=true;
      this.isIncludeAllJobValue=false;
      this.client_id=null;
    }else{
      this.isIncludeAllJobEnable=false;
    }
  }
  if (filteredKey === 'job-ids') {
    this.selectedJobIds = filteredData;
  }
  if (filteredKey === 'job-status-ids') {
    this.selectedStatusIds = filteredData;
  }

this.formattedData = [];
  this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    job_status: this.selectedStatusIds,
  });
}
 exportCsvOrPdf(fileType) {
   let query = buildPaginationQuery({
     page: this.page,
     pageSize: this.tableSize,
   });
   query += this.client_id ? `&client=${this.client_id}` : '';
   query += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
      if (this.selectedClientIds?.length) {
        query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
      }
      if (this.selectedJobIds?.length) {
        query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
      }
      if (this.selectedStatusIds?.length) {
        query += `&job-status-ids=[${this.selectedStatusIds.join(',')}]`;
      }
   const url = `${environment.live_url}/${environment.job_reports}/${query}&job-status=[${this.statusList}]&report-type=job-time-report&file-type=${fileType}`;
   downloadFileFromUrl({
     url,
     fileName: 'job_time_report',
     fileType
   });
 }
 getClientList(){
let query = `?status=True`;
 query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
  this.api.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe((res: any) => {
    if(res){
      this.clientName = res?.map((item: any) => ({
        id: item.id,
        name: item.client_name
      }));
    }
  })
  return this.clientName;
}
  getJobList(){
    let query = `?status=${this.tabStatus}`;
    query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
    this.api.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
      if(res){
        this.jobName = res?.map((item: any) => ({
          id: item.id,
          name: item.job_name
        }));
      }
    })
    return this.jobName;
  }
getStatusList(){
  this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((res: any) => {
    if(res){
      this.statusName = res?.map((item: any) => ({
        id: item.id,
        name: item.status_name
      }));
    }
  })
  console.log('statusName',this.statusName);
  return this.statusName;
}
getJobTypeList(){
  this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((res: any) => {
    if(res){
      this.statusName = res?.map((item: any) => ({
        id: item.id,
        name: item.status_name
      }));
    }
  })
  console.log('statusName',this.statusName);
  return this.statusName;
}
 // Fetch table data from API with given params
  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?: any[]; job_ids?: any[]; job_status?: any[]; }) {
  let finalQuery;
   this.formattedData = [];
   const page = params?.page ?? this.page;
   const pageSize = params?.pageSize ?? this.tableSize;
   const searchTerm = params?.searchTerm ?? this.term;
   const query = buildPaginationQuery({ page, pageSize, searchTerm });
   this.jobStatusList(this.tabStatus);
    finalQuery = query + `&job-status=[${this.statusList}]`;
    finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
    finalQuery += this.client_id ? `&client=${this.client_id}` : '';
    finalQuery += `&report-type=job-time-report`;
      if (params?.client_ids?.length) {
        finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
      }
      if (params?.job_ids?.length) {
        finalQuery += `&job-ids=[${params.job_ids.join(',')}]`;
      }
      if (params?.job_status?.length) {
        finalQuery += `&job-status-ids=[${params.job_status.join(',')}]`;
      }
    await this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((res: any) => {
      if(res && res.results && Array.isArray(res.results) && res.results.length >=1){
      this.formattedData = res.results?.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item,
        is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
      }));
        this.tableConfig = {
            columns: tableColumns?.map(col => {
               let filterOptions:any = [];
               if (col.filterable) {
                 if (col.key === 'client_name') {
                   filterOptions = this.clientName;
                 }else if (col.key === 'job_name') {
                   filterOptions = this.jobName;
                 }else if (col.key === 'job_status_name') {
                   filterOptions = this.statusName;
                 }
               }
               return {
                 ...col,
                 filterOptions
               };
             }),
       data: this.formattedData,
       searchTerm: this.term,
       actions: [],
       accessConfig: [],
       tableSize: pageSize,
       pagination: true,
       searchable: true,
       headerTabs:true,
       showIncludeAllJobs:true,
       includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
       includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
       selectedClientId:this.client_id ? this.client_id:null,
       sendEmail:true,
       currentPage:page,
       totalRecords: res.total_no_of_record,
       showDownload:true,
      };
    }
    else{
      this.tableConfig = {
      columns: tableColumns?.map(col => {
              let filterOptions:any = [];
              if (col.filterable) {
                if (col.key === 'client_name') { filterOptions = this.clientName; }
                else if (col.key === 'job_name') { filterOptions = this.jobName; }
                else if (col.key === 'job_status_name') {
                   filterOptions = this.statusName;
                 }
              }
              return { ...col, filterOptions };
            }),
        data: [],
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        headerTabs:true,
        showIncludeAllJobs:true,
        includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
        includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
        selectedClientId:this.client_id ? this.client_id:null,
        sendEmail:true,
        currentPage:page,
        totalRecords: 0,
        showDownload:true,
      };
    }

   },(error:any)=>{  this.api.showError(error?.error?.detail);
   });
  }

   onSearch(term: string): void {
     this.term = term;
     this.getTableData({
       page: 1,
       pageSize: this.tableSize,
       searchTerm: term,
       client_ids: this.selectedClientIds,
       job_ids: this.selectedJobIds,
       job_status: this.selectedStatusIds,
     });
   }


jobStatusList(status:any){
  const isActive = status === 'True';
  this.statusList = this.allJobStatus
    ?.filter((jobstatus: any) => isActive
      ? jobstatus?.status_name !== "Cancelled" && jobstatus?.status_name !== "Completed"
      : jobstatus?.status_name === "Cancelled" || jobstatus?.status_name === "Completed")
    .map((status: any) => status?.status_name);
}
// Send Email Action Button event
public sendEamils(){
   let finalQuery = `?send_mail=True&file-type=pdf&report-type=job-time-report`;
   finalQuery += this.client_id ? `&client=${this.client_id}` : '';
   this.jobStatusList(this.tabStatus);
   finalQuery += `&job-status=[${this.statusList}]`;
    // Yet to integrate
      if(this.client_id){
              this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((respData: any) => {
                  if (respData) {
              this.api.showSuccess(respData['message']);
               }
                },
                (error:any)=>{
                  this.api.showError(error?.error?.detail);

}
)
}
}
public viewtimesheetDetails(item:any){
      this.dialog.open(JobTimeSheetDetailsPopupComponent, {
      width: '900px',
      data: { 'job_id': item?.id,'job_name':item?.job_name}
    });
    }
}
