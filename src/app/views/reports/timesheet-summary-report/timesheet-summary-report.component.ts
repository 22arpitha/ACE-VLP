import { Component, OnInit } from '@angular/core';
import { tableConfig } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from '../../../service/common-service.service';
import { Router } from '@angular/router';
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
  tableSizes = [5, 10, 25, 50, 100];

  tableConfig:any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 5,
    pagination: true,
  };
  constructor(private common_service:CommonServiceService,private router:Router) {}

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableConfig;
  }

  handleAction(event: { actionType: string; row: any }) {
    switch (event.actionType) {
      case 'navigate':
        console.log('View action triggered for row:', event.row);
        this.router.navigate(['/reports/employee-details'])
        break;
    }
  }

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
  triggerAction(event: any) {
    this.handleAction(event);
  }
}
