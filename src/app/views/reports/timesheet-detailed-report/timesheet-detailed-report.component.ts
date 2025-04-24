import { Component, OnInit } from '@angular/core';
import { getTableColumns } from './timesheet-detailed-config';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { getUniqueValues } from '../../../shared/unique-values.utils';
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
  userRole: string;
  user_role_name: string;
  user_id: string;
  tableData: ({ label: string; key: string; sortable: boolean; filterable?: undefined; filterType?: undefined; } | { label: string; key: string; sortable: boolean; filterable: boolean; filterType: string; })[];
  constructor(
    private common_service:CommonServiceService,
    private api:ApiserviceService
  ) {
    this.user_id = sessionStorage.getItem('user_id') || '' ;
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableData = getTableColumns(this.user_role_name);
    this.getTableData()
  }


onTableDataChange(event: any) {
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
    default:
      console.warn('Unhandled action type:', event.actionType);
  }
}
exportCsvOrPdf(fileType) {
  let query = buildPaginationQuery({
    page: this.page,
    pageSize: this.tableSize,
  });

  const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=detailed`;
  downloadFileFromUrl({
    url,
    fileName: 'timesheet_details',
    fileType
  });
}

// Fetch table data from API with given params
getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
  const page = params?.page ?? this.page;
  const pageSize = params?.pageSize ?? this.tableSize;
  const searchTerm = params?.searchTerm ?? this.term;

  let query = buildPaginationQuery({ page, pageSize, searchTerm });
  if(this.user_role_name !== 'Admin'){
    query +=`&employee-id=${this.user_id}`
    }
  this.api.getData(`${environment.live_url}/${environment.timesheet}/${query}`).subscribe((res: any) => {
    const formattedData = res.results.map((item: any, i: number) => ({
      sl: (page - 1) * pageSize + i + 1,
      ...item
    }));
    this.tableConfig = {
      columns:  this.tableData?.map(col => ({
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
      totalRecords: res.total_no_of_record
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
