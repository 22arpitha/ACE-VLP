import { Component, OnInit } from '@angular/core';
import { tableColumns } from '../job-status-report/job-status-report-config'
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { getUniqueValues } from '../../../shared/unique-values.utils';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-job-status-report',
  templateUrl: './job-status-report.component.html',
  styleUrls: ['./job-status-report.component.scss']
})
export class JobStatusReportComponent implements OnInit {

 BreadCrumbsTitle: any = 'Job Status Report';
   term: string = '';
   tableSize: number = 5;
   page: any = 1;
   tableSizes = [5,10,25,50,100];
   tableConfig:any = {
     columns: [],
     data: [],
     searchTerm: '',
     actions: [],
     accessConfig: [],
     tableSize: 5,
     pagination: true,
     headerTabs:true,
     showIncludeAllJobs:true,
     includeAllJobsEnable:false,
     includeAllJobsValue:false,
     selectedClientId:null,
     sendEmail:true,
   };
   tabStatus:any='True';
   allJobStatus:any=[];
   statusList:String[]=[];
    user_id:any;
   userRole:any;
   client_id:any;
   isIncludeAllJobEnable:boolean=true;
   isIncludeAllJobValue:boolean=false;
 constructor(
     private common_service:CommonServiceService,
     private api:ApiserviceService
   ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    }

   ngOnInit(): void {
    this.getJobStatusList()
     this.common_service.setTitle(this.BreadCrumbsTitle)
     this.tableConfig = tableColumns;
   }

   getJobStatusList() {
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        if(resData){
          this.allJobStatus = resData;
          this.getTableData();
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
       searchTerm: this.term
     });
   }

 }

 // Called from <app-dynamic-table> via @Output actionEvent
 handleAction(event: { actionType: string; detail: any, }) {
   switch (event.actionType) {
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
        this.tableConfig['']=
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
       break;
       case 'includeAllJobs':
        this.isIncludeAllJobValue= event['action'];
        this.client_id = event['action'] && event['client_id'] ? event['client_id'] : null;
        this.isIncludeAllJobEnable = event['action']  || (!event['action'] && event['client_id'])  ? false : true;
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
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
        searchTerm: this.term
      });
   }
 }

 exportCsvOrPdf(fileType) {
   let query = buildPaginationQuery({
     page: this.page,
     pageSize: this.tableSize,
   });
   query += this.client_id ? `&client=${this.client_id}` : '';
   const url = `${environment.live_url}/${environment.job_reports}/${query}&job-status=[${this.statusList}]&type=job-status-report&file-type=${fileType}`;
   downloadFileFromUrl({
     url,
     fileName: 'job_status_report',
     fileType
   });
 }

 // Fetch table data from API with given params
 getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
  let finalQuery;
   const page = params?.page ?? this.page;
   const pageSize = params?.pageSize ?? this.tableSize;
   const searchTerm = params?.searchTerm ?? this.term;
   const query = buildPaginationQuery({ page, pageSize, searchTerm });
   this.jobStatusList(this.tabStatus);
   finalQuery = query + `&job-status=[${this.statusList}]`;
   finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
   finalQuery += this.client_id ? `&client=${this.client_id}` : '';
   this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((res: any) => {
    if(res.results && res.results?.length>=1){
      const formattedData = res.results.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item,
        is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
      }));
      console.log('B this.tableConfig',this.tableConfig);
      this.tableConfig = {
        columns: tableColumns.map(col => ({
          ...col,
          filterOptions: col.filterable ? getUniqueValues(formattedData, col.key) : tableColumns
        })),
       data: formattedData,
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
       totalRecords: res.total_no_of_record
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
       searchTerm: term
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
   let finalQuery = `?send_mail=True&file-type=pdf&report-type=job-status-report`;
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
}
