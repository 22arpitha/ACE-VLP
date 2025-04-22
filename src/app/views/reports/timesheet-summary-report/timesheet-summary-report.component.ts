import { Component, OnInit } from '@angular/core';
import { tableColumns } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from '../../../service/common-service.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util'
import { environment } from '../../../../environments/environment';
import { getUniqueValues } from '../../../shared/unique-values.utils';
import { ApiserviceService } from '../../../service/apiservice.service';
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
    constructor(
      private common_service:CommonServiceService,
      private api:ApiserviceService
    ) {
      this.user_id = sessionStorage.getItem('user_id')
      console.log(this.user_id,"this.user_id")
    }

    ngOnInit(): void {
      this.common_service.setTitle(this.BreadCrumbsTitle);
      this.tableConfig = tableColumns;
      this.getTableData()
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
        this.filterByDate(event.detail);
        break
      default:
        console.warn('Unhandled action type:', event.actionType);
    }
  }
  exportCsvOrPdf(fileType) {
    const query = buildPaginationQuery({
      page: this.page,
      pageSize: this.tableSize,
    });

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
  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string,fromdate?:string }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    const query = buildPaginationQuery({ page, pageSize, searchTerm });

    this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}&employee-id=${152}`).subscribe((res: any) => {
      const formattedData = res.results[0].timesheet_data.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item
      }));
      this.tableConfig = {
        columns: tableColumns.map(col => ({
          ...col,
          filterOptions: col.filterable ? getUniqueValues(formattedData, col.key) : []
        })),

        data: formattedData,
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        currentPage:page,
        totalRecords: res.total_no_of_record,
        dateRangeFilter:true
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
