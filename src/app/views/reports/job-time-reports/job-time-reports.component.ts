import { Component, OnInit } from '@angular/core';
import { tableConfig } from '../job-time-reports/job-time-reprots-config'
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { getUniqueValues } from '../../../shared/unique-values.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-job-time-reports',
  templateUrl: './job-time-reports.component.html',
  styleUrls: ['./job-time-reports.component.scss']
})
export class JobTimeReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Time Report';
  term: string = '';
  tableSize: number = 10;
  page: any = 1;
  tableSizes = [5, 10, 25, 50, 100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 10,
    pagination: true,
    headerTabs: true,
    showIncludeAllJobs: true,
    includeAllJobsEnable: false,
    includeAllJobsValue: false,
    sendEmail: true,
  };
  tabStatus: any = 'True';
  allJobStatus: any = [];
  statusList: String[] = [];
  user_id: any;
  userRole: any;
  isIncludeAllJobEnable: boolean = true;
  isIncludeAllJobValue: boolean = false;
  client_id: any;
  selectedJobIds: any = [];
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.getJobStatusList()
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableConfig;
  }

  getJobStatusList() {
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        if (resData) {
          this.allJobStatus = resData;
          this.getTableData();
        }
      }
    )
  }


  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
    let finalQuery;
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;
    const query = buildPaginationQuery({ page, pageSize, searchTerm });
    this.jobStatusList(this.tabStatus);
    finalQuery = query;
    finalQuery = query + `&job-status=[${this.statusList}]`;
     finalQuery += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
     finalQuery += this.client_id ? `&client=${this.client_id}` : '';
    this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((res: any) => {
      const formattedData = res?.results.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item,
        is_primary: item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
      }));
      this.tableConfig = {
        columns: tableConfig.map(col => ({
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
        headerTabs: true,
        showIncludeAllJobs: true,
        includeAllJobsEnable: this.isIncludeAllJobEnable,
        includeAllJobsValue: this.isIncludeAllJobValue,
        sendEmail: true,
        currentPage: page,
        totalRecords: res.total_no_of_record
      };
    });
  }

  jobStatusList(status: any) {
    const isActive = status === 'True';
    this.statusList = this.allJobStatus
      ?.filter((jobstatus: any) => isActive
        ? jobstatus?.status_name !== "Cancelled" && jobstatus?.status_name !== "Completed"
        : jobstatus?.status_name === "Cancelled" || jobstatus?.status_name === "Completed")
      .map((status: any) => status?.status_name);
  }


  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term
    });
  }
  handleAction(event: { actionType: string; detail: any, }) {
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
        // this.exportCsvOrPdf(event.detail);
        break;
      case 'export_pdf':
        // this.exportCsvOrPdf(event.detail);
        break;
      case 'headerTabs':
        this.tabStatus = event['action'];
        this.tableConfig[''] =
          this.page = 1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
        break;
      case 'includeAllJobs':
        this.isIncludeAllJobEnable = !event['action'];
        this.isIncludeAllJobValue = event['action'];
        this.tableConfig['includeAllJobsValue'] = this.isIncludeAllJobValue;
        this.tableConfig['includeAllJobsEnable'] = this.isIncludeAllJobEnable;
        this.client_id = event['client_id'];
        this.page = 1;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
        break;
      case 'sendEmail':
        console.log('Filtered Data:', event['action']);
        //  this.sendEamils();
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
    }
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
    if (event) {
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

}
