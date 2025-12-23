import { Component, OnInit } from '@angular/core';
import { getTableColumns } from './timesheet-detailed-config';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
@Component({
  selector: 'app-timesheet-detailed-report',
  templateUrl: './timesheet-detailed-report.component.html',
  styleUrls: ['./timesheet-detailed-report.component.scss']
})
export class TimesheetDetailedReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'Timesheet Detailed Report';
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
    showDownload:true,
  };
  userRole: string;
  user_role_name: string;
  user_id: string;
  tableData: ({ label: string; key: string; sortable: boolean; filterable?: undefined; filterType?: undefined; } | { label: string; key: string; sortable: boolean; filterable: boolean; filterType: string; })[];
  employees: any = [];
  clientName: { id: any; name: string; }[];
  jobName: { id: any; name: string; }[];
  taskName: { id: any; name: string; }[];
  employeeName: { id: any; name: string; }[];
  selectedClientIds: any = [];
  selectedJobIds: any = [];
  selectedTaskIds: any = [];
  selectedEmployeeIds: any = [];
  selectedDate: any;
  sortValue: string = '';
  directionValue: string = '';
  constructor(
    private common_service:CommonServiceService,
    private api:ApiserviceService
  ) {
    this.user_id = sessionStorage.getItem('user_id') || '' ;
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
  }

   ngOnInit() {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableData = getTableColumns(this.user_role_name);
    this.getTaskList();
        // this.getClienList();
        // this.getEmployeeList();
        // this.getTableData();
    // this.getJobList();
    // this.getTableData();
    if (
      !this.selectedClientIds.length &&
      !this.selectedJobIds.length &&
      !this.selectedTaskIds.length &&
      !this.selectedEmployeeIds.length
    ) {
     this.getTableData();
    }
  }
  

onTableDataChange(event: any) {
  const page = event;
  this.page = page;

  this.getTableData({
    page: page,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    task_ids: this.selectedTaskIds,
    employee_ids: this.selectedEmployeeIds,
    timesheet_dates: this.selectedDate
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
      task_ids: this.selectedTaskIds,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }

}

// Called from <app-dynamic-table> via @Output actionEvent
handleAction(event: { actionType: string; detail: any,key:string,fromFilter?: boolean }) {
  switch (event.actionType) {
    case 'tableDataChange':
      this.onTableDataChange(event.detail);
      break;
      case 'tableSizeChange':
        if (!event.fromFilter) this.onTableSizeChange(event.detail);
      // this.onTableSizeChange(event.detail);
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
      case 'filter':
      this.onApplyFilter(event.detail,event.key);
      break;
      case 'sorting':
        this.onSorting(event);
      break;
      case 'dateRange':
        // console.log(event.detail, event.key);
      this.onApplyDateFilter(event.detail);
      break;
      default:

    //   this.getTableData({
    //     page: 1,
    //     pageSize: this.tableSize,
    //     searchTerm: this.term,
    //     client_ids: this.selectedClientIds,
    //     job_ids: this.selectedJobIds,
    //     task_ids: this.selectedTaskIds,
    //     employee_ids: this.selectedEmployeeIds,
    //     timesheet_dates: this.selectedDate
    //   });
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
      task_ids: this.selectedTaskIds,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
}

onApplyFilter(filteredData: any[], filteredKey: string): void {
  if (filteredKey === 'client-ids') {
    this.selectedClientIds = filteredData;
  }
  if (filteredKey === 'job-ids') {
    this.selectedJobIds = filteredData;
  }
  if (filteredKey === 'timesheet-task-ids') {
    this.selectedTaskIds = filteredData;
  }
  if (filteredKey === 'timesheet-employee-ids') {
    this.selectedEmployeeIds = filteredData;
  }
  this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    task_ids: this.selectedTaskIds,
    employee_ids: this.selectedEmployeeIds,
    timesheet_dates: this.selectedDate
  });
}
onApplyDateFilter(filteredDate:string): void {
this.selectedDate = filteredDate;
this.getTableData({
    page: 1,
    pageSize: this.tableSize,
    searchTerm: this.term,
    client_ids: this.selectedClientIds,
    job_ids: this.selectedJobIds,
    task_ids: this.selectedTaskIds,
    employee_ids: this.selectedEmployeeIds,
    timesheet_dates: this.selectedDate
  });
}

exportCsvOrPdf(fileType) {
  // let query = buildPaginationQuery({
  //   page: this.page,
  //   pageSize: this.tableSize
  // });
  let query =   `?download=true`
  const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
  if(this.user_role_name !== 'Admin'){
    query +=`&timesheet-employee=${this.user_id}`
    }if (this.selectedClientIds.length) {
        query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
      }
      if (this.selectedJobIds.length) {
        query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
      }
      if ( this.selectedTaskIds.length) {
        query += `&timesheet-task-ids=[${this.selectedTaskIds.join(',')}]`;
      }
      if (this.selectedEmployeeIds?.length) {
        query += `&timesheet-employee-ids=[${this.selectedEmployeeIds.join(',')}]`;
      }if(this.term){
        query += `&search=${searchParam}`
      }if(this.selectedDate){
         query += `&start-date=${this.selectedDate.startDate}&end-date=${this.selectedDate.endDate}`
      }
      const url = `${environment.live_url}/${environment.vlp_timesheets}/${query}&file-type=${fileType}&timesheet-report-type=detailed`;
      window.open(url, '_blank');

  // downloadFileFromUrl({
  //   url,
  //   fileName: 'VLP - Timesheet Detail Report',
  //   fileType
  // });
}
getClienList(){
  let query = `?status=True`
  query += this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
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
    let query = this.user_role_name ==='Admin' ? '':`?employee-id=${this.user_id}`;
    this.api.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
      if(res){
        this.jobName = res?.map((item: any) => ({
          id: item.id,
          name: item.job_name
        }));
        // this.getTaskList();
        // this.getClienList();
        // this.getEmployeeList();
        // this.getTableData();
      }
    })
    return this.jobName;
  }
    getTaskList(){
      this.api.getData(`${environment.live_url}/${environment.vlp_timesheets}/?get-tasks=True`).subscribe((res: any) => {
        if(res){
          this.taskName = res?.map((item: any) => ({
            id: item.id,
            name: item.value
          }));
        }
      })
      return this.taskName;
    }
      getEmployeeList(){
        this.api.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((res: any) => {
          if(res){
            this.employeeName = res?.map((item: any) => ({
              id: item.user_id,
              name: item.user__full_name
            }));
          }
        })
        return this.employeeName;
      }
// Fetch table data from API with given params vignesh code 
// async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;task_ids?:any;employee_ids?:any,timesheet_dates?:any }) {

//    const page = params?.page ?? this.page;
//     const pageSize = params?.pageSize ?? this.tableSize;
//     const searchTerm = params?.searchTerm ?? this.term;

//     let query = buildPaginationQuery({ page, pageSize, searchTerm });
//     query +=`&timesheet-report-type=detailed`;
//     if(this.user_role_name !== 'Admin'){
//       query +=`&timesheet-employee=${this.user_id}`
//       }if (params?.client_ids?.length) {
//         query += `&client-ids=[${params.client_ids.join(',')}]`;
//       }
//       if (params?.job_ids?.length) {
//         query += `&job-ids=[${params.job_ids.join(',')}]`;
//       }
//       if (params?.task_ids?.length) {
//         query += `&timesheet-task-ids=[${params.task_ids.join(',')}]`;
//       }
//       if (params?.employee_ids?.length) {
//         query += `&timesheet-employee-ids=[${params.employee_ids.join(',')}]`;
//       }
//       if(params?.timesheet_dates){
//         query += `&start-date=${params.timesheet_dates.startDate}&end-date=${params.timesheet_dates.endDate}`
//       }
//       await this.api.getData(`${environment.live_url}/${environment.timesheet}/${query}`).subscribe((res: any) => {
//      if(res){
//       const formattedData = res?.results?.map((item: any, i: number) => ({
//         sl: (page - 1) * pageSize + i + 1,
//         ...item
//       }));


//       this.tableConfig = {
//         columns: this.tableData.map(col => {
//           let filterOptions:any = [];

//           if (col.filterable) {
//             if (col.key === 'client_name') {
//               filterOptions = this.clientName;
//             }
//             else if (col.key === 'job_name') {
//               filterOptions = this.jobName;
//             } else if (col.key === 'task_name') {
//               filterOptions = this.taskName;
//             }else if (col.key === 'employee_name') {
//               filterOptions = this.employeeName;
//             }
//           }

//           return {
//             ...col,
//             filterOptions
//           };
//         }),

//         data: formattedData,
//         searchTerm: this.term,
//         actions: [],
//         accessConfig: [],
//         tableSize: pageSize,
//         pagination: true,
//         searchable: true,
//         currentPage:page,
//         totalRecords: res.total_no_of_record,
//         showDownload:true,
//         timesheetDetailedReport:true,
//         searchPlaceholder:'Search by Client/Job',
//       };
//     }
//     });
// }






  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      task_ids: this.selectedTaskIds,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
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
async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;task_ids?:any;employee_ids?:any,timesheet_dates?:any }) {

   const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    let disableFlag = true;
    query +=`&timesheet-report-type=detailed`;
    if(this.user_role_name !== 'Admin'){
      query +=`&timesheet-employee=${this.user_id}`
      }if (params?.client_ids?.length) {
        query += `&client-ids=[${params.client_ids.join(',')}]`;
      }
      if (params?.job_ids?.length) {
        query += `&job-ids=[${params.job_ids.join(',')}]`;
      }
      if (params?.task_ids?.length) {
        query += `&timesheet-task-ids=[${params.task_ids.join(',')}]`;
      }
      if (params?.employee_ids?.length) {
        query += `&timesheet-employee-ids=[${params.employee_ids.join(',')}]`;
      }
      if(params?.timesheet_dates){
        // disableFlag=this.getDisableDownload(params.timesheet_dates.startDate, params.timesheet_dates.endDate);
        query += `&start-date=${params.timesheet_dates.startDate}&end-date=${params.timesheet_dates.endDate}`
      }
      if(this.directionValue && this.sortValue){
        query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
      }
      await this.api.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe((res: any) => {
     if(res){
      const formattedData = res?.results?.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item
      }));
      this.tableConfig = {
          columns: this.tableData.map(col => {
            let filterOptions: any = [];

            // Try to retain old filterOptions
            const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            } else if (col.filterable) {
              // Fallback to initial options if none present
              if (col.key === 'client_name') {
                filterOptions = this.clientName;
              } else if (col.key === 'job_name') {
                filterOptions = this.jobName;
              } else if (col.key === 'task_name') {
                filterOptions = this.taskName;
              } else if (col.key === 'employee_name') {
                filterOptions = this.employeeName;
              }
            }

            return {
              ...col,
              filterOptions
            };
          }),
        data: formattedData,
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        currentPage:page,
        totalRecords: res.total_no_of_record,
        showDownload:true,
        showCsv:true,
        showPdf:false,
        // disableDownload: disableFlag,
        timesheetDetailedReport:true,
        searchPlaceholder:'Search by Client/Job',
    }
  }
    });
    
}
containsLeapYear(start: Date, end: Date): boolean {
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
    if (this.isLeapYear(y)) return true;
  }
  return false;
}

isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

getDisableDownload(startStr: string, endStr: string): boolean {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000);

  const hasLeap = this.containsLeapYear(start, end);
  const limit = hasLeap ? 366 : 365;
  return diffDays > limit;
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
    query += this.user_role_name === 'Admin' ? '' : `&employee-id=${this.user_id}`;
  }
  if (key === 'job-ids'){
    endpoint = environment.only_jobs
    query +=  this.user_role_name ==='Admin' ? '': `&employee-id=${this.user_id}`;
  } ;
  if (key === 'timesheet-employee-ids'){
    endpoint = environment.employee;
    query +=  `&is_active=True&employee=True`
  } 
  if (key === 'timesheet-task-ids') {
    // Task filter static
    this.updateFilterColumn(key, { data: this.taskName, page: 1, total: this.taskName.length, searchTerm: '' });
    return;
  }

  this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
    .subscribe((res: any) => {
      if (!res) return;

      const fieldMap: any = {
        'client-ids': { id: 'id', name: 'client_name' },
        'job-ids': { id: 'id', name: 'job_name' },
        'timesheet-employee-ids': { id: 'user_id', name: 'user__full_name' },
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
