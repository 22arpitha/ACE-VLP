import { Component, OnInit } from '@angular/core';
import { tableColumns } from './job-status-report-config'
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { getUniqueValues3 } from '../../../shared/unique-values.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-job-status-report',
  templateUrl: './job-status-report.component.html',
  styleUrls: ['./job-status-report.component.scss']
})
export class JobStatusReportComponent implements OnInit {

 BreadCrumbsTitle: any = 'Job Status Report';
   term: string = '';
   tableSize: number = 50;
   page: any = 1;
   tableSizes = [50,75,100];
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
  groupName: { id: any; name: string; }[];
  selectedClientIds: any = [];
  selectedJobIds: any = [];
  selectedGroupIds: any = [];
  selectedDate: string;
  jobAllocationDate: any;
  selectedStatusDate: any;
  formattedData: any = [];
 constructor(
     private common_service:CommonServiceService,
     private api:ApiserviceService
   ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getJobList();
    this.getGroupList();
    this.getClienList();
    }

   async ngOnInit() {
     this.common_service.setTitle(this.BreadCrumbsTitle)
     this.tableConfig = tableColumns;
     setTimeout(() => {
      this.getJobStatusList()
    },500)
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
     searchTerm: this.term,
     client_ids: this.selectedClientIds,
     job_ids: this.selectedJobIds,
     group_ids: this.selectedGroupIds,
     job_allocation_date: this.jobAllocationDate,
     job_status_date:this.selectedStatusDate
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
       group_ids: this.selectedGroupIds,
       job_allocation_date: this.jobAllocationDate,
       job_status_date:this.selectedStatusDate
     });
   }

 }

 // Called from <app-dynamic-table> via @Output actionEvent
 handleAction(event: { actionType: string; detail: any,key:string }) {
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
        this.getClienList();
        this.getJobList();
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
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
          group_ids: this.selectedGroupIds,
          job_allocation_date: this.jobAllocationDate,
          job_status_date:this.selectedStatusDate
        });
      break;
      case 'sendEmail':
      this.client_id = event['client_id'] ? event['client_id'] : null;
      this.sendEamils();
      break;
      case 'dateFilter':
      this.onApplyDateFilter(event.detail,event.key);
      break;
     default:
      this.getTableData({
        page: 1,
        pageSize: this.tableSize,
        searchTerm: this.term,
        client_ids: this.selectedClientIds,
        job_ids: this.selectedJobIds,
        group_ids: this.selectedGroupIds,
        job_allocation_date: this.jobAllocationDate,
        job_status_date:this.selectedStatusDate
      });
   }
 }

 onApplyFilter(filteredData: any[], filteredKey: string): void {
  if (filteredKey === 'client-ids') {
   this.selectedClientIds = filteredData;
    if(filteredData && filteredData.length===0 || filteredData.length>1){
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
  if (filteredKey === 'group-ids') {
    this.selectedGroupIds = filteredData;
  }
  if (filteredKey === 'job-status-ids') {
    this.selectedStatusDate = filteredData;
  }
  if (filteredKey === 'job_status_date') {
    this.jobAllocationDate = filteredData;
  }
  this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    group_ids: this.selectedGroupIds,
    job_allocation_date: this.jobAllocationDate,
    job_status_date:this.selectedStatusDate
  });
}
onApplyDateFilter(filteredDate:string, filteredKey: string): void {
 this.formattedData = [];
  if (filteredKey === 'job_allocation_date') {
    this.jobAllocationDate = filteredDate;
  }if (filteredKey === 'job_status_date') {
    this.selectedStatusDate = filteredDate;
  }
  this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    group_ids: this.selectedGroupIds,
    job_allocation_date: this.jobAllocationDate,
    job_status_date:this.selectedStatusDate
  });
}
 exportCsvOrPdf(fileType) {
   let query = buildPaginationQuery({
     page: this.page,
     pageSize: this.tableSize,
   });
   query += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
   query += this.client_id ? `&client=${this.client_id}` : '';
  let fileName:any = this.selectedClientIds.length === 1 ? `VLP - ${this.getClientNameById(this.selectedClientIds[0])} Status Report` : 'VLP - Job Status Report';
    if (this.selectedClientIds?.length) {
        query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
      }
      if (this.selectedJobIds?.length) {
        query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
      }
      if (this.selectedGroupIds?.length) {
        query += `&group-ids=[${this.selectedGroupIds.join(',')}]`;
      }
      if (this.selectedStatusDate?.length) {
        query += `&job-status-date=[${this.selectedStatusDate.join(',')}]`;
      }
      if(this.jobAllocationDate?.length){
        query += `&job-allocation-date=[${this.jobAllocationDate}]`;
      }
   const url = `${environment.live_url}/${environment.job_reports}/${query}&job-status=[${this.statusList}]&report-type=job-status-report&file-type=${fileType}`;
   downloadFileFromUrl({
     url,
     fileName: fileName,
     fileType
   });
 }
getClienList(){
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
  getGroupList(){
    this.api.getData(`${environment.live_url}/${environment.settings_status_group}/`).subscribe((res: any) => {
      if(res){
        this.groupName = res?.map((item: any) => ({
          id: item.id,
          name: item.group_name
        }));
      }
    })}
 // Fetch table data from API with given params
 async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;group_ids?:any;job_allocation_date?:any;job_status_date?:any }) {
  let finalQuery;
  this.formattedData = []; // Initialize/clear
   const page = params?.page ?? this.page;
   const pageSize = params?.pageSize ?? this.tableSize;
   const searchTerm = params?.searchTerm ?? this.term;
   const query = buildPaginationQuery({ page, pageSize, searchTerm });
   this.jobStatusList(this.tabStatus);
    // console.log(this.groupName,'groupName');
       finalQuery = query + `&job-status=[${this.statusList}]`;
       finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
       finalQuery += this.client_id ? `&client=${this.client_id}` : '';
       finalQuery += `&report-type=job-status-report`;
        if (params?.client_ids?.length) {
            finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
          }if (params?.job_ids?.length) {
            finalQuery += `&job-ids=[${params.job_ids.join(',')}]`;
          }if (params?.group_ids?.length) {
            finalQuery += `&group-ids=[${params.group_ids.join(',')}]`;
          }if (params?.job_allocation_date) {
            finalQuery += `&job-allocation-date=[${params.job_allocation_date}]`;
          }if (params?.job_status_date) {
            finalQuery += `&job-status-date=[${params.job_status_date}]`;
          }

      // Inner API call for actual table data
      await this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((response: any) => {
        if(response && response.results && Array.isArray(response.results) && response.results.length >=1){
          this.formattedData = response.results.map((item: any, i: number) => ({
            sl: (page - 1) * pageSize + i + 1,
            ...item,
            is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
          }));
          //console.log(this.formattedData);
          this.tableConfig = {
           columns: tableColumns?.map(col => {
              let filterOptions:any = [];
              if (col.filterable) {
                if (col.key === 'client_name') {
                  filterOptions = this.clientName;
                }else if (col.key === 'job_name') {
                  filterOptions = this.jobName;
                }else if (col.key === 'group_name') {
                  filterOptions = this.groupName;
                }
              }
              return { ...col, filterOptions };
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
           totalRecords: response.total_no_of_record, // Correctly use 'response' from inner call
           showDownload:true,
           searchPlaceholder:'Search by Client/Group/Job',
          };
        }else{
          this.tableConfig = {
              columns: tableColumns?.map(col => {
                      let filterOptions:any = [];
                      if (col.filterable) {
                        if (col.key === 'client_name') { filterOptions = this.clientName; }
                        else if (col.key === 'job_name') { filterOptions = this.jobName; }
                        else if (col.key === 'group_name') {
                  filterOptions = this.groupName;
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
                searchPlaceholder:'Search by Client/Group/Job',
              };
        }
      }, (error: any) => { // Error handling for inner API call
        this.api.showError(error?.error?.detail);
        this.formattedData = [];
        this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page };
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
       group_ids: this.selectedGroupIds,
       job_allocation_date: this.jobAllocationDate,
       job_status_date:this.selectedStatusDate
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
    //           this.resetValues();
    //     setTimeout(() => {
    //     this.getTableData({
    //    page: 1,
    //    pageSize: this.tableSize,
    //    searchTerm: this.term,
    //    client_ids: this.selectedClientIds,
    //    job_ids: this.selectedJobIds,
    //    group_ids: this.selectedGroupIds,
    //    job_allocation_date: this.jobAllocationDate,
    //    job_status_date:this.selectedStatusDate
    //  });
    //     }, 200);
               }
                },
                (error:any)=>{
                  this.api.showError(error?.error?.detail);

            }
            )
            }
            }
// public resetValues(){
//   this.client_id=null;
//     this.selectedDate='';
//     this.term='';
//     this.selectedStatusDate='';
//     this.selectedClientIds=[];
//     this.selectedGroupIds=[];
//     this.selectedJobIds=[];
//     this.isIncludeAllJobEnable=true;
//     this.isIncludeAllJobValue=false;
//     this.getGroupList();
//     this.getClienList();
//     this.getJobList();
// }

getClientNameById(clientId: number): string {
    const client = this.clientName.find(c => c.id === clientId);
    return client ? client.name : 'NA';
  }
            }
