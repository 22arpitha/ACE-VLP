import { Component, OnInit } from '@angular/core';
import { tableColumns } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from '../../../service/common-service.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { environment } from '../../../../environments/environment';
import { getUniqueValues, getUniqueValues2 } from '../../../shared/unique-values.utils';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Router } from '@angular/router';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-timesheet-summary-report',
  templateUrl: './timesheet-summary-report.component.html',
  styleUrls: ['./timesheet-summary-report.component.scss'],

})
export class TimesheetSummaryReportComponent implements OnInit {
  BreadCrumbsTitle: string = 'Timesheet Summary Report';
  term: string = '';
  tableSize: number = 5;
  page: number = 1;
  tableSizes = [5, 10, 25, 50, 100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 5,
    pagination: true,
    navigation:true
  };
  user_id: string | null;
  user_role_name: string;
  fromDate: string = '';
  selectedDate: any;
  time = {
    start_date: '',
    end_date: ''
  };

  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private router:Router,
    private dialog: MatDialog,
    private datePipe:DatePipe
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';


    this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term });
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.getFilterData();
  }

  onTableDataChange(event: number): void {
    this.page = event;

    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term });
  }

  onTableSizeChange(event: any): void {
    const newSize = Number(event.value || event);
    this.tableSize = newSize;
    this.page = 1;
    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term });
  }

  handleAction(event: { actionType: string; detail: any }): void {
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
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
        case 'filter':
          this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term , employee_ids: event.detail.value,fromdate: this.selectedDate['start_date'] });
          this.getFilterData(event.detail.value)
          break;
      case 'weekDate':
        this.fromDate = event.detail;
        this.filterByDate(this.fromDate);
        break;
      case 'navigate':
        this.getEmployeeDetails(event['row'])
        break;
      default:
        this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term, fromdate: this.selectedDate['start_date'] });
    }
  }
  getEmployeeDetails(employee): void {
    const filteredDate = this.fromDate || this.time
         this.dialog.open(EmployeeDetailsComponent, {
         width: '900px',
         data: { employee:employee,dateRange:filteredDate }
       });

  }
  exportCsvOrPdf(fileType: string): void {
    let query = buildPaginationQuery({ page: this.page, pageSize: this.tableSize });

    if (this.fromDate) {
      const date = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd');
      query += `&from-date=${date}`;
    }else{
      const date = this.datePipe.transform(this.time.start_date, 'yyyy-MM-dd');
      query += `&from-date=${date}`;
    }
    if (this.user_role_name !== 'Admin') {
      query += `&employee-id=${this.user_id}`;
    }

    const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=summary`;
    downloadFileFromUrl({ url, fileName: 'timesheet_summary', fileType: fileType as 'csv' | 'pdf' });
  }

  filterByDate(date: string): void {
    // console.log('Selected Date Range:', this.time);
    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term , fromdate: date });
  }
  getFilterData(filteredId?): void {
    let query = '';
    if (this.user_role_name !== 'Admin') {
      query += `?employee-id=${this.user_id}`;
    }
    if (this.fromDate) query += `&from-date=${this.fromDate}`;
    if (filteredId) query += `&employee-ids=[${filteredId}]`;

    this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}`)
      .subscribe((res: any) => {
        const employees = res;
        const filterOptions = getUniqueValues2(employees, 'employee_name', 'employee_id');

        // Only update filters, not full tableConfig
        this.tableConfig.columns = tableColumns?.map(col => {
          if (col.filterable && col.key === 'employee_name') {
            return { ...col, filterOptions };
          }
          return col;
        });
      });
  }


  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; fromdate?: string; employee_ids?: any; startDate?; endDate? }): void {
  const page = params?.page ?? this.page;
  const pageSize = params?.pageSize ?? this.tableSize;
  const searchTerm = params?.searchTerm ?? this.term;
  const employeeIds = params?.employee_ids ?? null;

  // Get current week's start and end date
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

  // Save the week range in 'time'
  this.time.start_date = startOfWeek.toISOString();
  this.time.end_date = endOfWeek.toISOString();
  this.selectedDate = this.fromDate ? { start_date: this.fromDate } : this.time;
  // Build query params
  let query = buildPaginationQuery({ page, pageSize, searchTerm });
  if (employeeIds) query += `&employee-ids=[${employeeIds}]`;
  if (this.user_role_name !== 'Admin') query += `&employee-id=${this.user_id}`;

    if(params?.fromdate){
      const date = this.datePipe.transform(params.fromdate['start_date'], 'yyyy-MM-dd');
      query += `&from-date=${date}`;
    }else{
      const date = this.datePipe.transform(this.time.start_date, 'yyyy-MM-dd');
      query += `&from-date=${date}`;
    }

  // API call
  this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}`).subscribe((res: any) => {
    const employees = res?.results;

    const formattedData = employees?.map((employee: any, index: number) => {
      const row: any = {
        sl: (page - 1) * pageSize + index + 1,
        employee_name: employee?.employee_name,
        employee_worked_hours: employee?.employee_worked_hours,
        short_fall: employee?.short_fall,
        keyId: employee?.employee_id
      };
      employee?.timesheet_data?.forEach((entry: any) => {
        row[entry.day] = entry?.total_time;
      });
      return row;
    });

    this.tableConfig = {
      columns: tableColumns.map(col => ({
        ...col,
        filterOptions: tableColumns
      })),
      data: formattedData,
      searchTerm: this.term,
      actions: [],
      accessConfig: [],
      tableSize: pageSize,
      pagination: true,
      searchable: true,
      currentPage: page,
      totalRecords: res.total_no_of_record,
      dateRangeFilter: true,
      navigation: true,
    };
  });
}


  onSearch(term: string): void {
    this.term = term;

    this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: term });
  }
  getCurrentWeekDates() {
    this.selectedDate = this.fromDate || JSON.stringify(this.time);
  }
}
