import { Component, OnInit } from '@angular/core';
import { tableColumns } from '../job-time-reports/job-time-reprots-config'
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { environment } from '../../../../environments/environment';
import { JobTimeSheetDetailsPopupComponent } from '../common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { FilterQueryService } from '../../../service/filter-query.service';
@Component({
  selector: 'app-job-time-reports',
  templateUrl: './job-time-reports.component.html',
  styleUrls: ['./job-time-reports.component.scss']
})
export class JobTimeReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Time Report';
  term: string = '';
  tableSize: number = 50;
  page: any = 1;
  tableSizes = [50, 75, 100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 50,
    pagination: true,
    headerTabs: true,
    showIncludeAllJobs: true,
    includeAllJobsEnable: false,
    includeAllJobsValue: false,
    selectedClientId: null,
    sendEmail: true,
    reportType:'job-time-report',
    showDownload: true,
  };
  tabStatus: any = 'True';
  allJobStatus: any = [];
  statusList: String[] = [];
  user_id: any;
  userRole: any;
  client_id:any = null;
  isIncludeAllJobEnable: boolean = true;
  isIncludeAllJobValue: boolean = false;
  clientName: { id: any; name: string; }[] = [];
  jobName: { id: any; name: string; }[] = [];
  statusName: { id: any; name: string; }[] = [];
  selectedClientIds: any = [];
  selectedJobIds: any = [];
  selectedStatusIds: any = [];
  primaryEmployees: any = [];
  formattedData: any = [];
  sortValue: string = '';
  directionValue: string = '';
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private dialog: MatDialog,
    private filterQueryService: FilterQueryService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableColumns(this.userRole);
    setTimeout(() => {
      this.getJobStatusList();
    }, 500);
  }

  getJobStatusList() {
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        if (resData) {
          this.allJobStatus = resData;
          this.getTableData({
            page: this.page,
            pageSize: this.tableSize,
            searchTerm: this.term
          });
        }
      },
      (error: any) => {
        this.api.showError(error?.error?.detail);
      }
    )
  }

  // Called when user changes page number from the dynamic table
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
        searchTerm: this.term,
        client_ids: this.selectedClientIds,
        job_ids: this.selectedJobIds,
        job_status: this.selectedStatusIds,
        prime_emp: this.primaryEmployees
      });
    }

  }

  // Called from <app-dynamic-table> via @Output actionEvent
  handleAction(event: { actionType: string; detail: any,key:string, fromFilter?: boolean  }) {
    switch (event.actionType) {
      case 'navigate_employee':
        this.viewtimesheetDetails(event);
        break;
      case 'navigate':
        this.viewtimesheetDetails(event);
        break;
      case 'tableDataChange':
        this.onTableDataChange(event.detail);
        break;
      case 'tableSizeChange':
        if (!event.fromFilter) this.onTableSizeChange(event.detail);
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
      case 'sorting':
        this.onSorting(event);
        break;
      case 'headerTabs':
        this.tabStatus = event['action'];
        this.page = 1;
        this.tableSize = 50;
         this.client_id = null;
        this.selectedClientIds = [];
        this.selectedJobIds = [];
        this.selectedStatusIds = [];
        this.primaryEmployees = [];
        this.filterDataCache = {};
        this.isIncludeAllJobEnable=true;
        this.isIncludeAllJobValue=false;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          job_status: this.selectedStatusIds,
          prime_emp: this.primaryEmployees
        });
        break;
      case 'filter':
        this.onApplyFilter(event.detail, event.key);
        break;
      case 'includeAllJobs':
        this.isIncludeAllJobValue = event['action'];
        this.client_id = event['action'] && event['client_id'] ? event['client_id'] : null;
        this.isIncludeAllJobEnable = event['action'] || (!event['action'] && event['client_id']) ? false : true;
        this.page = 1;
        this.filterDataCache = {};
        this.selectedJobIds = [];
        this.primaryEmployees = [];
        this.filterDataCache['job-ids'] = {data: [], page: 0, total: 0, searchTerm: ''};
        this.filterDataCache['is-primary-ids'] = {data: [], page: 0, total: 0, searchTerm: ''};
        // this.selectedJobIds = []
        // console.log(this.filterDataCache)
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          job_status: this.selectedStatusIds,
          prime_emp: this.primaryEmployees
        });
        break;
      case 'sendEmail':
        this.client_id = event['client_id'] ? event['client_id'] : null;
        this.sendEamils();
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
          job_status: this.selectedStatusIds,
          prime_emp: this.primaryEmployees
        });
    }
  }

  onSorting(data: any) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      job_status: this.selectedStatusIds,
      prime_emp: this.primaryEmployees
    });
  }
  onApplyFilter(filteredData: any, filteredKey: string): void {

    if (filteredKey === 'client-ids') {
      this.selectedClientIds = filteredData;
      const { count, singleId } = this.getEffectiveClientSelection(filteredData);
    if(count !== 1){
        this.filterDataCache = {};
        this.isIncludeAllJobEnable = true;
        this.isIncludeAllJobValue = false;
        this.client_id = null;
      } else {
        this.client_id = singleId;
    }
    // When selectAll=false with excludedIds, use includeAlljobsids to determine single client
    if (filteredData?.selectAllValue === false && filteredData?.excludedIds?.length > 0
        && filteredData?.includeAlljobsids?.length === 1) {
       this.client_id = filteredData.includeAlljobsids[0];
      this.isIncludeAllJobEnable = false;
    }else{
      this.client_id = null;
    }
    }
    if (filteredKey === 'job-ids') {
      this.selectedJobIds = filteredData;
    }
    if (filteredKey === 'job-status-ids') {
      this.selectedStatusIds = filteredData;
    }
    if (filteredKey === 'is-primary-ids') {
      this.primaryEmployees = filteredData;
    }

    this.formattedData = [];
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      job_status: this.selectedStatusIds,
      prime_emp: this.primaryEmployees
    });
  }

  private getEffectiveClientSelection(filterValue: any): { count: number; singleId: any } {
    // Old format: plain array of ids
    if (Array.isArray(filterValue)) {
      return { count: filterValue.length, singleId: filterValue.length === 1 ? filterValue[0] : null };
    }
    if (!filterValue) return { count: 0, singleId: null };

    const { selectAllValue, selectedOptions, excludedIds, selectedCount } = filterValue;

    if (selectAllValue === null || selectAllValue === undefined) {
      // null → use selectedOptions.length
      const count = selectedOptions?.length || 0;
      return { count, singleId: count === 1 ? selectedOptions[0].id : null };
    } else if (selectAllValue === true) {
      // true → use selectedCount (equals total)
      const count = selectedCount || 0;
      if (count === 1) {
        const cache = this.filterDataCache['client-ids'];
        return { count: 1, singleId: cache?.data?.[0]?.id || null };
      }
      return { count, singleId: null };
    } else if (selectAllValue === false) {
      // false → total minus excludedIds.length
      const cache = this.filterDataCache['client-ids'];
      const total = cache?.total || 0;
      const excludedCount = excludedIds?.length || 0;
      const count = total - excludedCount;

      if (count === 1 && cache?.data) {
        const excludedIdSet = new Set(excludedIds.map((e: any) => e.id ?? e));
        const singleClient = cache.data.find((c: any) => !excludedIdSet.has(c.id));
        return { count: 1, singleId: singleClient?.id || null };
      }
      return { count, singleId: null };
    }
    return { count: 0, singleId: null };
  }

// select all code
private buildQueryForFilter(filterValue: any, paramName: string): string {
    if (!filterValue) return '';
    // Old format: plain array of ids
    if (Array.isArray(filterValue)) {
      return filterValue.length ? `&${paramName}=[${filterValue.join(',')}]` : '';
    }
    // New format: FilterState object
    return this.filterQueryService.buildFilterSegment(filterValue, paramName);
  }
  exportCsvOrPdf(fileType: any) {
    const search = this.term?.trim().length >= 2 ? `search=${encodeURIComponent(this.term.trim())}&` : '';
    let query = `?${search}job-status=[${this.statusList}]&report-type=job-time-report&non-productive-jobs=false&file-type=${fileType}&download=true`
    query += this.client_id ? `&client=${this.client_id}` : '';
    // old code
    // if (this.userRole === 'Manager' && !this.client_id) {
    //   query += `&employee-id=${this.user_id}`;
    // } else if ((this.userRole != 'Manager' && this.userRole != 'Admin') && !this.client_id) {
    //   query += `&employee-id=${this.user_id}`;
    // }
    // if (this.primaryEmployees?.length > 0) {
      //   query += `&employee-ids=[${this.primaryEmployees}]`;
      // }
      // if (this.selectedClientIds?.length) {
    //   query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
    // }
    // if (this.selectedJobIds?.length) {
      //   query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
    // }
    // if (this.selectedStatusIds?.length) {
    //   query += `&job-status-ids=[${this.selectedStatusIds.join(',')}]`;
    
    // }
    if(this.userRole ==='Manager' && !(this.client_id && this.isIncludeAllJobValue)){
        query += `&employee-id=${this.user_id}`;
    } else if ((this.userRole !='Manager' && this.userRole !='Admin') && !(this.client_id && this.isIncludeAllJobValue)){
      query += `&employee-id=${this.user_id}`;
    }
     query += this.buildQueryForFilter(this.primaryEmployees, 'employee');
    query += this.buildQueryForFilter(this.selectedClientIds, 'client');
    query += this.buildQueryForFilter(this.selectedJobIds, 'job');
    query += this.buildQueryForFilter(this.selectedStatusIds, 'job-status');
    const url = `${environment.live_url}/${environment.all_jobs}/${query}`;
    window.open(url, '_blank');
  }

  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      job_status: this.selectedStatusIds,
      prime_emp: this.primaryEmployees
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
  // Send Email Action Button event
  public sendEamils() {
    let finalQuery = `?send_mail=True&file-type=csv&report-type=job-time-report`;
    finalQuery += this.client_id ? `&client-ids=[${this.client_id}]` : '';
    this.jobStatusList(this.tabStatus);
    finalQuery += `&job-status=[${this.statusList}]`;
    // Yet to integrate
    if (this.client_id) {
      this.api.getData(`${environment.live_url}/${environment.all_jobs}/${finalQuery}`).subscribe((respData: any) => {
        if (respData) {
          this.api.showSuccess(respData['message']);
        }
      },
        (error: any) => {
          this.api.showError(error?.error?.detail);

        }
      )
    }
  }
  public viewtimesheetDetails(item: any) {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    let data: any;
    if (item.actionType === 'navigate_employee') {
      data = { 'job_id': item.row?.id, 'job_name': item.row?.job_name, 'report_type': 'job-time-emp-report', 'table_api': `${environment.employee_actual_hours}`, 'download_api': `${environment.vlp_timesheets}`, 'download': false, showCsv: true }
    } else {
      data = { 'job_id': item.row?.id, 'job_name': item.row?.job_name, 'report_type': 'job-time-report', 'table_api': `${environment.vlp_timesheets}`, 'download_api': `${environment.vlp_timesheets}`, 'download': true, showCsv: true }
    }
    this.dialog.open(JobTimeSheetDetailsPopupComponent, {
      panelClass: 'custom-details-dialog',
      data: data
    });
  }

  private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map((col: any) =>
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
  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; client_ids?: any[]; job_ids?: any[]; job_status?: any[]; prime_emp?: any }) {
    let finalQuery;
    this.formattedData = [];
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;
    const query = buildPaginationQuery({ page, pageSize, searchTerm });
    this.jobStatusList(this.tabStatus);
    finalQuery = query + `&job-status=[${this.statusList}]`;
    // if (this.userRole === 'Manager' && !this.client_id) {
    //   finalQuery += `&employee-id=${this.user_id}`;
    // } else if ((this.userRole != 'Manager' && this.userRole != 'Admin') && !this.client_id) {
    //   finalQuery += `&employee-id=${this.user_id}`;
    // }
    // if (params?.prime_emp?.length > 0) {
    //   finalQuery += `&employee-ids=[${params?.prime_emp}]`;
    // }
    // finalQuery += this.client_id ? `&client=${this.client_id}` : '';
    // if (params?.client_ids?.length) {
    //   finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
    // }
    // if (params?.job_ids?.length) {
    //   finalQuery += `&job-ids=[${params.job_ids.join(',')}]`;
    // }
    // if (params?.job_status?.length) {
    //   finalQuery += `&job-status-ids=[${params.job_status.join(',')}]`;
    // }
    // select all code 
    finalQuery += `&report-type=job-time-report&non-productive-jobs=false`;
    if(this.userRole ==='Manager' && !(this.client_id && this.isIncludeAllJobValue)){
      finalQuery += `&employee-id=${this.user_id}`;
    } else if ((this.userRole !='Manager' && this.userRole !='Admin') && !(this.client_id && this.isIncludeAllJobValue)){
      finalQuery += `&employee-id=${this.user_id}`;
    }
    finalQuery += (this.client_id && this.isIncludeAllJobValue) ? `&client=${this.client_id}` : '';
    finalQuery += this.buildQueryForFilter(params?.prime_emp, 'employee');
    finalQuery += this.buildQueryForFilter(params?.client_ids, 'client');
    finalQuery += this.buildQueryForFilter(params?.job_ids, 'job');
    finalQuery += this.buildQueryForFilter(params?.job_status, 'job-status');
     if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    await this.api.getData(`${environment.live_url}/${environment.all_jobs}/${finalQuery}`).subscribe((res: any) => {
      if (res.results) {
        this.formattedData = res.results?.map((item: any, i: number) => ({
          sl: (page - 1) * pageSize + i + 1,
          ...item,
        }));
        this.tableConfig = {
          columns: tableColumns(this.userRole)?.map(col => {
            let filterOptions: any = [];
            const existingCol = this.tableConfig?.columns?.find((c: any) => c.key === col.key);
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            } else if (col.filterable) {
              // Fallback to initial options if none present
              if (col.key === 'client_name') {
                filterOptions = this.clientName;
              } else if (col.key === 'job_name') {
                filterOptions = this.jobName;
              } else if (col.key === 'job_status_name') {
                filterOptions = this.statusName;
              }
            }
            return {
              ...col,
              filterOptions,
                ...(existingCol?.totalCount   !== undefined && { totalCount:   existingCol.totalCount }),
              ...(existingCol?.currentPage  !== undefined && { currentPage:  existingCol.currentPage }),
              ...(existingCol?.totalPages   !== undefined && { totalPages:   existingCol.totalPages }),
            };
          }),
          data: this.formattedData,
          searchTerm: this.term,
          actions: [],
          accessConfig: [],
          tableSize: pageSize,
          pagination: true,
          searchable: true,
          headerTabs: true,
          showIncludeAllJobs: true,
          includeAllJobsEnable: this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
          includeAllJobsValue: this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
          selectedClientId: this.client_id ? this.client_id : null,
          sendEmail: true,
          reportType:'job-time-report',
          currentPage: page,
          totalRecords: res.total_no_of_record,
          showDownload: true,
          showCsv: true,
          showPdf: false,
          searchPlaceholder: 'Search by Client/Job/Status',
        };
      }
      else {
        const existingColumnsEmpty = this.tableConfig?.columns ?? [];
        this.tableConfig = {
          columns: tableColumns(this.userRole)?.map(col => {
                  const existingCol = existingColumnsEmpty.find((c: any) => c.key === col.key);
                  let filterOptions:any = existingCol?.filterOptions ?? [];
                  if (!filterOptions.length && col.filterable) {
                    if (col.key === 'client_name') { filterOptions = this.clientName; }
                    else if (col.key === 'job_name') { filterOptions = this.jobName; }
                      else if (col.key === 'job_status_name') {
                filterOptions = this.statusName;
              }
                
                  }
                  return {
                    ...col,
                    filterOptions,
                    ...(existingCol?.totalCount   !== undefined && { totalCount:   existingCol.totalCount }),
                    ...(existingCol?.currentPage  !== undefined && { currentPage:  existingCol.currentPage }),
                    ...(existingCol?.totalPages   !== undefined && { totalPages:   existingCol.totalPages }),
                  };
                }),
          data: [],
          searchTerm: this.term,
          actions: [],
          accessConfig: [],
          tableSize: pageSize,
          pagination: true,
          searchable: true,
          headerTabs: true,
          showIncludeAllJobs: true,
          includeAllJobsEnable: this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
          includeAllJobsValue: this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
          selectedClientId: this.client_id ? this.client_id : null,
          sendEmail: true,
          reportType:'job-time-report',
          currentPage: page,
          totalRecords: 0,
          showDownload: true,
          searchPlaceholder: 'Search by Client/Job/Status',
        };
      }

    }, (error: any) => {
      this.api.showError(error?.error?.detail);
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
    if (key === 'job-ids') {
      endpoint = environment.only_jobs
      query += `&non-productive-jobs=false&job-status=[${this.statusList}]`;
      if (this.isIncludeAllJobValue) {
        // old code
        // query += `&client-ids=[${this.selectedClientIds}]`
         query += `&client-ids=[${this.client_id}]`
      } else {
        query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
      }
    }
    if (key === 'job-status-ids') {
      endpoint = environment.settings_job_status;
    }
    if (key === 'is-primary-ids') {
      endpoint = environment.get_primary_employees;
      query += `&job-status=[${this.statusList}]`;
      if (this.isIncludeAllJobValue) {
        // old code
        // query += `&client-id=${this.selectedClientIds}`
        query += `&client-ids=[${this.client_id}]`;
      } else {
        query += this.userRole === 'Admin' ? '' : `&manager-id=${this.user_id}`
      }
    }

    this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
      .subscribe((res: any) => {
        if (!res) return;

        const fieldMap: any = {
          'client-ids': { id: 'id', name: 'client_name' },
          'job-ids': { id: 'id', name: 'job_name' },
          'job-status-ids': { id: 'id', name: 'status_name' },
          'is-primary-ids': { id: 'employee_id', name: 'employee__full_name' }
        };

        const newData = res.results?.map((item: any) => ({
          id: item[fieldMap[key]?.id] || '',
          name: item[fieldMap[key]?.name] || ''
        }));

        cache.data = [
          ...cache.data,
          ...newData.filter((opt: any) => !cache.data.some((existing: any) => existing.id === opt.id))
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
