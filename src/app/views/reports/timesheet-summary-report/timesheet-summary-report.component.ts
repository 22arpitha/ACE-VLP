import { Component, OnInit } from '@angular/core';
import { tableConfig } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-timesheet-summary-report',
  templateUrl: './timesheet-summary-report.component.html',
  styleUrls: ['./timesheet-summary-report.component.scss'],
})
export class TimesheetSummaryReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'Timesheet Summary Report';
  term: string = '';
  tableSize: number = 10;
  page: any = 1;
  tableSizes = [5, 10, 25, 50, 100];

  tableConfig:any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 12,
    pagination: true,
  };
  constructor(private common_service:CommonServiceService) {}

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableConfig;
  }

  handleAction(event: { actionType: string; row: any }) {}

  onTableDataChange(event: any) {
    this.page = event;
    const query = buildPaginationQuery({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term
    });

    console.log('Pagination Query:', query);
    // use this query in your API call
    // this.apiService.getData(`your-api-endpoint${query}`).subscribe(...)
  }
  onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.page = 1;
      const query = buildPaginationQuery({
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term
      });

      console.log('Page Size Change Query:', query);
      // use this query in your API call
    }

  }
}
