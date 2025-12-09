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
  statusName: { id: any; name: string; }[];
  selectedClientIds: any = [];
  selectedJobIds: any = [];
  selectedGroupIds: any = [];
  selectedDate: string;
  jobAllocationDate: any;
  selectedStatusIds: any = [];
  selectedStatusDate: any;
  formattedData: any = [];
  sortValue: string = '';
  directionValue: string = '';
  primaryEmployees:any= [];
 constructor(
     private common_service:CommonServiceService,
     private api:ApiserviceService
   ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    // this.getJobList();
    // this.getGroupList();
    // this.getClienList();
    // this.getStatusList();
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

  getStatusList(){
  this.api.getData(`${environment.live_url}/${environment.settings_status_group}/`).subscribe((res: any) => {
    if(res){
      // console.log(res)
      this.statusName = res?.map((item: any) => ({
        id: item.id,
        // name: item.status_name // for job status 
        name: item.group_name // for status group
      }));
    }
  })
  // console.log('statusName',this.statusName);
  return this.statusName;
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
     job_allocation_date: this.selectedDate,
     job_status_date:this.selectedStatusDate,
     job_status: this.selectedStatusIds,
     prime_emp: this.primaryEmployees
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
       job_allocation_date: this.selectedDate,
       job_status_date:this.selectedStatusDate,
       job_status: this.selectedStatusIds,
       prime_emp: this.primaryEmployees
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
        this.page= 1;
        this.tableSize = 50;  
        this.selectedClientIds = [];
        this.selectedJobIds= [];
        this.selectedGroupIds = [];
        this.selectedDate = '';
        this.selectedStatusDate= '';
        this.selectedStatusIds= [];
        this.primaryEmployees = [];
        this.filterDataCache={};
        // this.getClienList();
        // this.getJobList();
        this.page=1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          job_status: this.selectedStatusIds
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
         this.filterDataCache={};
        // this.filterDataCache['job_name']={data: [], page: 1, total: 0, searchTerm: ''};
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          group_ids: this.selectedGroupIds,
          job_allocation_date: this.selectedDate,
          job_status_date:this.selectedStatusDate,
          job_status: this.selectedStatusIds,
          prime_emp: this.primaryEmployees
        });
      break;
      case 'sendEmail':
      this.client_id = event['client_id'] ? event['client_id'] : null;
      this.sendEamils();
      break;
      case 'dateRange':
        // console.log(event.detail, event.key);
      this.onApplyDateFilter(event.detail,event.key);
      break;
      case 'sorting':
        this.onSorting(event);
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
        job_status_date:this.selectedStatusDate,
        job_status: this.selectedStatusIds,
      });
   }
 }

 onSorting(data){
  this.directionValue = data.detail.directionValue;
  this.sortValue = data.detail.sortValue;
  this.getTableData({
    page: this.page,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    group_ids: this.selectedGroupIds,
    job_allocation_date: this.selectedDate,
    job_status_date:this.selectedStatusDate,
    job_status: this.selectedStatusIds,
  });
 }

 onApplyFilter(filteredData: any[], filteredKey: string): void {
  // console.log('filteredKey',filteredKey)
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
  if (filteredKey === 'job_status_date') {
    this.selectedStatusDate = filteredData;
  }
  if (filteredKey === 'job_allocation_date') {
    this.jobAllocationDate = filteredData;
  }
  if (filteredKey === 'job-status-ids') {
    this.selectedStatusIds = filteredData;
  }
  if(filteredKey==='is-primary-ids'){
    this.primaryEmployees = filteredData;
  }
  this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    group_ids: this.selectedGroupIds,
    job_allocation_date: this.selectedDate,
    job_status_date:this.selectedStatusDate,
    job_status: this.selectedStatusIds,
    prime_emp: this.primaryEmployees
  });
}
onApplyDateFilter(filteredDate:string, filteredKey: string): void {
  this.selectedDate = filteredDate
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
    job_allocation_date: this.selectedDate,
    job_status_date:this.selectedStatusDate,
    prime_emp: this.primaryEmployees
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
      if(this.selectedDate){
         query += `&start-date=${this.selectedDate['startDate']}&end-date=${this.selectedDate['endDate']}`
      }
      // if(this.jobAllocationDate?.length){
      //   query += `&job-allocation-date=[${this.jobAllocationDate}]`;
      // }
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
    let clientIds = this.clientName.map((client: any) => client.id);
        if (clientIds && clientIds.length >= 1) {

          this.getGroupList(clientIds);
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
  getGroupList(clientIds){
    let query = this.userRole === 'Admin' ? '' : `?client-ids=[${clientIds}]`
    this.groupName = [];
    this.api.getData(`${environment.live_url}/${environment.clients_group}/${query}`).subscribe((respData: any) => {
      this.groupName = respData?.map((group: any) => ({
        id: group?.id,
        name: group?.group_name
      }))
    }, (error => {
      this.api.showError(error?.error?.detail)
    }));
    // this.api.getData(`${environment.live_url}/${environment.settings_status_group}/`).subscribe((res: any) => {
    //   if(res){
    //     this.groupName = res?.map((item: any) => ({
    //       id: item.id,
    //       name: item.group_name
    //     }));
    //   }
    // })
  }
 // Fetch table data from API with given params
//  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;group_ids?:any;job_allocation_date?:any;job_status_date?:any,job_status?: any[]; }) {
//   let finalQuery;
//   this.formattedData = []; // Initialize/clear
//    const page = params?.page ?? this.page;
//    const pageSize = params?.pageSize ?? this.tableSize;
//    const searchTerm = params?.searchTerm ?? this.term;
//    const query = buildPaginationQuery({ page, pageSize, searchTerm });
//    this.jobStatusList(this.tabStatus);
//     // console.log(this.groupName,'groupName');
//        finalQuery = query + `&job-status=[${this.statusList}]`;
//        finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
//        finalQuery += this.client_id ? `&client=${this.client_id}` : '';
//        finalQuery += `&report-type=job-status-report`;
//         if (params?.client_ids?.length) {
//             finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
//           }if (params?.job_ids?.length) {
//             finalQuery += `&job-ids=[${params?.job_ids.join(',')}]`;
//           }if (params?.group_ids?.length) {
//             finalQuery += `&group-ids=[${params.group_ids.join(',')}]`;
//           }if (params?.job_allocation_date?.startDate && params?.job_allocation_date?.endDate) {
//             // console.log(params.job_allocation_date)
//              finalQuery += `&start-date=${params?.job_allocation_date?.startDate}&end-date=${params?.job_allocation_date?.endDate}`
//           }if (params?.job_status_date) {
//             finalQuery += `&job-status-date=[${params?.job_status_date}]`;
//           }if (params?.job_status?.length) {
//             finalQuery += `&job-status-ids=[${params?.job_status.join(',')}]`;
//           }

//       // Inner API call for actual table data
//       await this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((response: any) => {
//         if(response && response.results && Array.isArray(response.results) && response.results.length >=1){
//           this.formattedData = response.results.map((item: any, i: number) => ({
//             sl: (page - 1) * pageSize + i + 1,
//             ...item,
//             is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
//           }));
//           //console.log(this.formattedData);
//           this.tableConfig = {
//            columns: tableColumns?.map(col => {
//               let filterOptions:any = [];
//               if (col.filterable) {
//                 if (col.key === 'client_name') {
//                   filterOptions = this.clientName;
//                 }else if (col.key === 'job_name') {
//                   filterOptions = this.jobName;
//                 }else if (col.key === 'group_name') {
//                   filterOptions = this.groupName;
//                 }else if (col.key === 'job_status_name') {
//                    filterOptions = this.statusName;
//                  }
//               }
//               return { ...col, filterOptions };
//             }),
//            data: this.formattedData,
//            searchTerm: this.term,
//            actions: [],
//            accessConfig: [],
//            tableSize: pageSize,
//            pagination: true,
//            searchable: true,
//            headerTabs:true,
//            showIncludeAllJobs:true,
//            includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
//            includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
//            selectedClientId:this.client_id ? this.client_id:null,
//            sendEmail:true,
//            currentPage:page,
//            totalRecords: response.total_no_of_record, // Correctly use 'response' from inner call
//            showDownload:true,
//            searchPlaceholder:'Search by Client/Group/Job',
//           };
//         }else{
//           this.tableConfig = {
//               columns: tableColumns?.map(col => {
//                       let filterOptions:any = [];
//                       if (col.filterable) {
//                         if (col.key === 'client_name') { filterOptions = this.clientName; }
//                         else if (col.key === 'job_name') { filterOptions = this.jobName; }
//                          else if (col.key === 'job_status_name') {
//                    filterOptions = this.statusName;
//                  }
//                         else if (col.key === 'group_name') {
//                   filterOptions = this.groupName;
//                 }
//                       }
//                       return { ...col, filterOptions };
//                     }),
//                 data: [],
//                 searchTerm: this.term,
//                 actions: [],
//                 accessConfig: [],
//                 tableSize: pageSize,
//                 pagination: true,
//                 searchable: true,
//                 headerTabs:true,
//                 showIncludeAllJobs:true,
//                 includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
//                 includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
//                 selectedClientId:this.client_id ? this.client_id:null,
//                 sendEmail:true,
//                 currentPage:page,
//                 totalRecords: 0,
//                 showDownload:true,
//                 searchPlaceholder:'Search by Client/Group/Job',
//               };
//         }
//       }, (error: any) => { // Error handling for inner API call
//         this.api.showError(error?.error?.detail);
//         this.formattedData = [];
//         this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page };
//       });
//  }

   onSearch(term: string): void {
     this.term = term;
     this.getTableData({
       page: 1,
       pageSize: this.tableSize,
       searchTerm: term,
       client_ids: this.selectedClientIds,
       job_ids: this.selectedJobIds,
       group_ids: this.selectedGroupIds,
       job_allocation_date: this.selectedDate,
       job_status_date:this.selectedStatusDate,
       job_status: this.selectedStatusIds,
       prime_emp: this.primaryEmployees
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
  // console.log(this.filterDataCache['client-ids'])
    // const client = this.clientName.find(c => c.id === clientId);
     const client = this.filterDataCache['client-ids'].data.find(c => c.id === clientId);
    return client ? client.name : 'NA';
  }



  
// new code
private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map(col =>
      col.paramskeyId === key
        ? {
            ...col,
            filterOptions: cache.data,
            currentPage: cache.page,
            totalPages: Math.ceil(cache.total / 20)
          }
        : col
    );
  }

async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;group_ids?:any;job_allocation_date?:any;job_status_date?:any,job_status?: any[]; prime_emp?:any}) {
    let finalQuery;
   const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;
    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    this.jobStatusList(this.tabStatus);
       finalQuery = query + `&job-status=[${this.statusList}]`;
       let emp_ids:any= [];
       if(this.userRole!='Admin' && params?.prime_emp?.length>0){
        emp_ids = [...params?.prime_emp, Number(this.user_id)];
       } else  if(this.userRole!='Admin'){
         emp_ids = [Number(this.user_id)];
       } else if(this.userRole==='Admin' && params?.prime_emp?.length>0){
        emp_ids = [params?.prime_emp];
       }

       let emp_query
       if(this.client_id && this.userRole!='Admin' && !params?.prime_emp){
        emp_query = ''
       } else if(this.client_id && this.userRole!='Admin' && params?.prime_emp.length>0){
        if(this.userRole==='Manager'){
          emp_ids = [params?.prime_emp];
          emp_query = `&employee-ids=[${emp_ids}]`;
        } 
       } else if(this.userRole==='Admin' && params?.prime_emp?.length>0){
          emp_query = `&employee-ids=[${emp_ids}]`;
       } else if(this.userRole!='Admin' && !this.client_id){
          emp_query = `&employee-ids=[${emp_ids}]`
       }
       finalQuery += emp_query || '';
      //  if(emp_query){
      //    finalQuery += emp_query;
      //  }
      //  finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-ids=[${emp_ids}]`;
       finalQuery += this.client_id ? `&client=${this.client_id}` : '';
       finalQuery += `&report-type=job-status-report`;
        if (params?.client_ids?.length) {
            finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
          }if (params?.job_ids?.length) {
            finalQuery += `&job-ids=[${params?.job_ids.join(',')}]`;
          }if (params?.group_ids?.length) {
            finalQuery += `&group-ids=[${params.group_ids.join(',')}]`;
          }if (params?.job_allocation_date?.startDate && params?.job_allocation_date?.endDate) {
            // console.log(params.job_allocation_date)
             finalQuery += `&start-date=${params?.job_allocation_date?.startDate}&end-date=${params?.job_allocation_date?.endDate}`
          }if (params?.job_status_date) {
            finalQuery += `&job-status-date=[${params?.job_status_date}]`;
          }if (params?.job_status?.length) {
            finalQuery += `&status-group-ids=[${params?.job_status.join(',')}]`;
          }
          if(this.directionValue && this.sortValue){
            finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
          }
          // if(params?.prime_emp?.length){
          //   finalQuery += `&employee-ids=${params?.prime_emp}`;
          // }
      await this.api.getData(`${environment.live_url}/${environment.all_jobs}/${finalQuery}`).subscribe((res: any) => {
     if(res?.results){
      this.formattedData = res?.results?.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item,
         is_primary:item?.unassigned === true && item?.employees?.length === 0
            ? 'Unassigned'
            : item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
        //  is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
        //  diff_days:item.tat_days
      }));
      this.tableConfig = {
          columns: tableColumns.map(col => {
            let filterOptions: any = [];

            // Try to retain old filterOptions
            const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            } else if (col.filterable) {
              // Fallback to initial options if none present
              if (col.key === 'client_name') {
                  filterOptions = this.clientName;
                }else if (col.key === 'job_name') {
                  filterOptions = this.jobName;
                }else if (col.key === 'group_name') {
                  filterOptions = this.groupName;
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
           totalRecords: res.total_no_of_record, // Correctly use 'response' from inner call
           showDownload:true,
           disableDownload: this.tabStatus === "True" ? false : true,
           searchPlaceholder:'Search by Client/Group/Job',
    }
  }else{
          this.tableConfig = {
              columns: tableColumns?.map(col => {
                      let filterOptions:any = [];
                      if (col.filterable) {
                        if (col.key === 'client_name') { filterOptions = this.clientName; }
                        else if (col.key === 'job_name') { filterOptions = this.jobName; }
                         else if (col.key === 'job_status_name') {
                   filterOptions = this.statusName;
                 }
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
    },(error: any) => { // Error handling for inner API call
        this.api.showError(error?.error?.detail);
        this.formattedData = [];
        this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page };
      });
    
}


  filterDataCache: {
  [key: string]: { data: any[], page: number, total: number, searchTerm: string }
} = {};

getFilterOptions(event: { detail: any; key: string }) {
  const { detail, key } = event;
  let cache = this.filterDataCache[key];
  const searchTerm = detail.search || '';

  if (!cache || detail.reset || cache.searchTerm !== searchTerm) {
  cache = this.filterDataCache[key] = {
    data: [],
    page: 0,
    total: 0,
    searchTerm
  };
}

  // If already loaded all records, don’t fetch again
  if (cache.data.length >= cache.total && cache.total > 0) {
    this.updateFilterColumn(key, cache);
    return;
  }

  const nextPage = cache.page + 1;
  let query = `?page=${nextPage}&page_size=${detail.pageSize}`;
  if (searchTerm) query += `&search=${searchTerm}`;

  let endpoint = '';
  if (key === 'client-ids') {
    endpoint = environment.all_clients;
    query += `&status=True`;
    query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
  }
  if (key === 'job-ids'){
    endpoint = environment.only_jobs
    if(this.isIncludeAllJobValue){
      query += `&client-ids=[${this.selectedClientIds}]&job-status=[${this.statusList}]`
    } else{
      query +=  this.userRole ==='Admin' ? '': `&employee-id=${this.user_id}`;
    }
  } ;
  if (key === 'job-status-ids'){
    endpoint = environment.settings_status_group;
  } 
  if (key === 'group-ids'){
    endpoint = environment.clients_group;
    query += this.userRole === 'Admin' ? '' : `&employee_id=${this.user_id}`
  }
   if (key === 'is-primary-ids') {
    endpoint = environment.get_primary_employees;
    query += `&job-status=[${this.statusList}]`;
    if(this.isIncludeAllJobValue){
      query += `&client-id=${this.selectedClientIds}`
    } else{
      query += this.userRole === 'Admin' ? '' : `&manager-id=${this.user_id}`
    }
   }
 
  // if (key === 'timesheet-task-ids') {
  //   // Task filter static
  //   this.updateFilterColumn(key, { data: this.taskName, page: 1, total: this.taskName.length, searchTerm: '' });
  //   return;
  // }

  this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
    .subscribe((res: any) => {
      if (!res) return;

      const fieldMap: any = {
        'client-ids': { id: 'id', name: 'client_name' },
        'job-ids': { id: 'id', name: 'job_name' },
        'job-status-ids': { id: 'id', name: 'group_name' },
        'group-ids':{ id: 'id', name: 'group_name' },
        'is-primary-ids':{id:'employee_id',name:'employee__full_name'}
      };

      const newData = res.results?.map((item: any) => ({
        id: item[fieldMap[key]?.id] || '',
        name: item[fieldMap[key]?.name] || ''
      }));

      cache.data = [
        ...cache.data,
        ...newData.filter(opt => !cache.data.some(existing => existing.id === opt.id))
      ];
      cache.page = nextPage;
      cache.total = res.total_no_of_record || cache.total;
      
      this.updateFilterColumn(key, cache);
    });
}

// when filter opens or checkboxes selected
onFilterOpened(event: any) {
  this.getFilterOptions({ detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, key: event.column.paramskeyId });
}

// when user scrolls
onFilterScrolled(event: any) {
  this.getFilterOptions({ detail: { page: event.page, pageSize: 10, search: event.search }, key: event.column.paramskeyId });
}
onFilterSearched(event: any) {
  this.getFilterOptions({ 
    detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, 
    key: event.column.paramskeyId 
  });
}
            }
