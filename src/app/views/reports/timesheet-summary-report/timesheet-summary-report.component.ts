import { Component, OnInit } from '@angular/core';
import { tableColumns } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from '../../../service/common-service.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util'
import { environment } from '../../../../environments/environment';
import { getUniqueValues } from '../../../shared/unique-values.utils';
import { ApiserviceService } from '../../../service/apiservice.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-timesheet-summary-report',
  templateUrl: './timesheet-summary-report.component.html',
  styleUrls: ['./timesheet-summary-report.component.scss'],
})
export class TimesheetSummaryReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'Timesheet Summary Report';
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
    };
  user_id: string | null;
  user_role_name: string;
  fromDate: string;
    constructor(
      private common_service:CommonServiceService,
      private api:ApiserviceService
    ) {
      this.user_id = sessionStorage.getItem('user_id')
      this.user_role_name = sessionStorage.getItem('user_role_name') || ''
    }

    ngOnInit(): void {
      this.common_service.setTitle(this.BreadCrumbsTitle);
      this.tableConfig = tableColumns;
      this.getTableData({
        page: 1,
        pageSize: this.tableSize,
        searchTerm: this.term
      });
    }

    // Called when user changes page number from the dynamic table
  onTableDataChange(event: any) {
    console.log('Page changed to:', event);
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
  handleAction(event: { actionType: string; detail: any }) {
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
        case 'date_range':
        this.fromDate = event.detail;
        this.filterByDate(event.detail);
        break
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
    if(this.fromDate){
      query += `&from-date=${this.fromDate}`
    }if(this.user_role_name !== 'Admin'){
      query += `&employee-id=${this.user_id}`
      }
    const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=summary`;
    downloadFileFromUrl({
      url,
      fileName: 'timesheet_summary',
      fileType
    });
  }
  filterByDate(date){
    this.getTableData({
      page:this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      fromdate:date
    });
  }
  // Fetch table data from API with given params
  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string, fromdate?: string }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });

    if (this.user_role_name !== 'Admin') {
      query += `&employee-id=${this.user_id}`;
    }
    if (params?.fromdate) {
      query += `&from-date=${params.fromdate}`;
    }

    this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}`).subscribe((res: any) => {
      const employees = res.results;

      const formattedData = employees.map((employee: any, index: number) => {
        const row: any = {
          sl: (page - 1) * pageSize + index + 1,
          employee_name: employee.employee_name,
          employee_worked_hours: employee.employee_worked_hours,
          short_fall: employee.short_fall
        };

        employee.timesheet_data.forEach((entry: any) => {
          row[entry.day] = entry.total_time;
        });

        return row;
      });

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
        currentPage: page,
        totalRecords: res.total_no_of_record,
        dateRangeFilter: true
      };
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

}
