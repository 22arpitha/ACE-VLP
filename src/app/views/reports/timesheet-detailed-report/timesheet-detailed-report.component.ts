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
  tableSizes = [50,75,100,150,200];
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
  constructor(
    private common_service:CommonServiceService,
    private api:ApiserviceService
  ) {
    this.user_id = sessionStorage.getItem('user_id') || '' ;
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
    this.getJobList();
    this.getClienList();
    this.getTaskList();
    this.getEmployeeList();
  }

   ngOnInit() {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableData = getTableColumns(this.user_role_name);

    setTimeout(() => {
      this.getTableData()
    }, 3000);

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
      case 'filter':
      this.onApplyFilter(event.detail,event.key);
      break;
      case 'dateFilter':
        console.log(event.detail, event.key);
      this.onApplyDateFilter(event.detail,event.key);
      break;
    default:
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
}
onApplyFilter(filteredData: any[], filteredKey: string): void {
  console.log(filteredData, filteredKey);

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
onApplyDateFilter(filteredDate:string, filteredKey: string): void {
  console.log(filteredDate, filteredKey);

  if (filteredKey === 'date') {
    this.selectedDate = filteredDate;
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

exportCsvOrPdf(fileType) {
  let query = buildPaginationQuery({
    page: this.page,
    pageSize: this.tableSize
  });
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
      if (this.selectedEmployeeIds.length) {
        query += `&timesheet-employee-ids=[${this.selectedEmployeeIds.join(',')}]`;
      }if(this.term){
        query += `&search=${this.term}`
      }if(this.selectedDate){
        query += `&timesheet-dates=[${this.selectedDate}]`
      }
  const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=detailed`;
  downloadFileFromUrl({
    url,
    fileName: 'timesheet_details',
    fileType
  });
}
getClienList(){
  let query = `?status=True`
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
    let query = this.userRole ==='Admin' ? '':`?employee-id=${this.user_id}`;
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
    getTaskList(){
      this.api.getData(`${environment.live_url}/${environment.timesheet}/?get-tasks=True`).subscribe((res: any) => {
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
// Fetch table data from API with given params
async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?:any;job_ids?:any;task_ids?:any;employee_ids?:any,timesheet_dates?:any }) {

   const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });
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
        query += `&timesheet-dates=[${params.timesheet_dates}]`
      }
      await this.api.getData(`${environment.live_url}/${environment.timesheet}/${query}`).subscribe((res: any) => {
     if(res){
      const formattedData = res?.results?.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item
      }));

      this.tableConfig = {
        columns: this.tableData.map(col => {
          let filterOptions:any = [];

          if (col.filterable) {
            if (col.key === 'client_name') {
              filterOptions = this.clientName;
            }
            else if (col.key === 'job_name') {
              filterOptions = this.jobName;
            } else if (col.key === 'task_name') {
              filterOptions = this.taskName;
            }else if (col.key === 'employee_name') {
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
        timesheetDetailedReport:true
      };
    }
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
      task_ids: this.selectedTaskIds,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }

}
