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
    }

   ngOnInit(): void {
    this.getJobStatusList()
    this.formattedData = [];
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
        this.tableConfig['']=
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
  console.log(filteredData, filteredKey);

  if (filteredKey === 'client-ids') {
    this.selectedClientIds = filteredData;
    if(this.selectedClientIds && this.selectedClientIds.length===0){
      console.log(this.selectedClientIds);
      this.isIncludeAllJobEnable=true;
      this.isIncludeAllJobValue=false;
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
  console.log(filteredDate, filteredKey);

 this.formattedData = [];
 console.log('onApplyDateFilter',this.formattedData);
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
   query += this.client_id ? `&client=${this.client_id}` : '';
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
      if(this.jobAllocationDate.length){
        query += `&job-allocation-date=[${this.jobAllocationDate}]`;
      }
   const url = `${environment.live_url}/${environment.job_reports}/${query}&job-status=[${this.statusList}]&type=job-status-report&file-type=${fileType}`;
   downloadFileFromUrl({
     url,
     fileName: 'job_status_report',
     fileType
   });
 }

 // Fetch table data from API with given params
 async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;group_ids?:any;job_allocation_date?:any;job_status_date?:any }) {
  let finalQuery;
  let filterQuery;
  this.formattedData = []; // Initialize/clear formattedData for the new fetch
   const page = params?.page ?? this.page;
   const pageSize = params?.pageSize ?? this.tableSize;
   const searchTerm = params?.searchTerm ?? this.term;
   const query = buildPaginationQuery({ page, pageSize, searchTerm });
   this.jobStatusList(this.tabStatus);
   filterQuery = `?job-status=[${this.statusList}]`;
   filterQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
   filterQuery += this.client_id ? `&client=${this.client_id}` : '';

  // Outer API call for filter options
  await this.api.getData(`${environment.live_url}/${environment.jobs}/${filterQuery}`).subscribe(async (filterRes: any) => {
   if(filterRes){ // Assuming filterRes is the data for filters

    this.jobFilterList = filterRes; // Assuming filterRes is an array
    this.clientName = getUniqueValues3(this.jobFilterList, 'client_name', 'client')
    this.jobName = getUniqueValues3(this.jobFilterList, 'job_name', 'id')
    this.groupName = getUniqueValues3(this.jobFilterList, 'group_name', 'group')


    if(this.jobFilterList && this.jobFilterList?.length>=1){
       finalQuery = query + `&job-status=[${this.statusList}]`;
       finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
       finalQuery += this.client_id ? `&client=${this.client_id}` : '';
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
          };
        } else {
          // Handle empty or invalid response for table data
          this.formattedData = []; // Ensure it's empty
          this.tableConfig = {
            ...this.tableConfig, // Preserve other config like columns, search term etc.
            data: [],
            currentPage: page,
            totalRecords: 0,
            // Update filter options in columns, as they might have been populated
            columns: tableColumns?.map(col => {
              let filterOptions:any = [];
              if (col.filterable) {
                if (col.key === 'client_name') { filterOptions = this.clientName; }
                else if (col.key === 'job_name') { filterOptions = this.jobName; }
                else if (col.key === 'group_name') { filterOptions = this.groupName; }
              }
              return { ...col, filterOptions };
            }),
          };
        }
      }, (error: any) => { // Error handling for inner API call
        this.api.showError(error?.error?.detail);
        this.formattedData = [];
        this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page };
      });
   }else{ // This 'else' is for: if(this.jobFilterList && this.jobFilterList?.length>=1)
    // No job filter list, so no data to show
    this.formattedData = [];
    this.tableConfig = {
       columns:tableColumns, // Use default columns
       data: [], // Explicitly empty
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
       totalRecords: 0, // No records if filter list is empty
       showDownload:true,
    };
   }
  } else { // This 'else' is for: if(filterRes)
    // Handle case where initial filter data fetch fails or returns nothing
    this.jobFilterList = []; this.clientName = []; this.jobName = []; this.groupName = [];
    this.formattedData = [];
    this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page, columns: tableColumns.map(c => ({...c, filterOptions: []})) };
  }
   },(error:any)=>{  // Error handling for outer API call
    this.api.showError(error?.error?.detail);
    this.jobFilterList = []; this.clientName = []; this.jobName = []; this.groupName = [];
    this.formattedData = [];
    this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page, columns: tableColumns.map(c => ({...c, filterOptions: []})) };
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
               }
                },
                (error:any)=>{
                  this.api.showError(error?.error?.detail);

            }
            )
            }
            }
            }
