import { Component, OnInit } from '@angular/core';
import { tableColumns } from './it-issue-report-config';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { environment } from '../../../../environments/environment';
import { FilterQueryService } from '../../../service/filter-query.service';

@Component({
  selector: 'app-it-issue-reports',
  templateUrl: './it-issue-reports.component.html',
  styleUrls: ['./it-issue-reports.component.scss']
})
export class ItIssueReportsComponent implements OnInit {

  BreadCrumbsTitle: any = 'IT Issue Reports';
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
    showDownload: false,
  };
  user_id: any;
  userRole: any;
  it_status = [{ id: 'open', name: 'Open' }, { id: 'close_request_sent', name: "Close Request Sent" }, { id: 'closed', name: "Closed" }];
  selectedDate: string;
  raisedDate: any;
  selectedStatusDate: any;
  formattedData: any = [];
  sortValue: string = '';
  directionValue: string = '';
  primaryEmployees: any = [];
  selectedStatus: any = [];
  selectedIssues: any = [];
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private filterQueryService: FilterQueryService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  async ngOnInit() {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableColumns;
    this.getTableData();
  }

  // Called when user changes page number from the dynamic table
  onTableDataChange(event: any) {
    const page = event;
    this.page = page;

    this.getTableData({
      page: page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      raised_date: this.raisedDate,
      status_date: this.selectedStatusDate,
      prime_emp: this.primaryEmployees,
      ticket_status: this.selectedStatus,
      issues: this.selectedIssues
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
        raised_date: this.raisedDate,
        status_date: this.selectedStatusDate,
        prime_emp: this.primaryEmployees,
        ticket_status: this.selectedStatus,
        issues: this.selectedIssues
      });
    }

  }

  // Called from <app-dynamic-table> via @Output actionEvent
  handleAction(event: { actionType: string; detail: any, key: string, fromFilter?: boolean }) {
   switch (event.actionType) {
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
      case 'filter':
        this.onApplyFilter(event.detail, event.key);
        break;
      case 'dateRange':
        this.onApplyDateFilter(event.detail, event.detail?.key || event.key);
        break;
      case 'sorting':
        this.onSorting(event);
        break;
      case 'dateFilter':
        this.onApplyDateFilter(event.detail, event.key);
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          raised_date: this.raisedDate,
          status_date: this.selectedStatusDate,
          prime_emp: this.primaryEmployees,
          ticket_status: this.selectedStatus,
          issues: this.selectedIssues
        });
    }
  }

  onSorting(data) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      raised_date: this.raisedDate,
      status_date: this.selectedStatusDate,
      prime_emp: this.primaryEmployees,
      ticket_status: this.selectedStatus,
      issues: this.selectedIssues
    });
  }

  onApplyFilter(filteredData: any[], filteredKey: string): void {
    console.log(filteredKey)
    if (filteredKey === 'status_date') {
      this.selectedStatusDate = filteredData;
    }
    if (filteredKey === 'raised_date') {
      this.raisedDate = filteredData;
    }
    if (filteredKey === 'is-primary-ids') {
      this.primaryEmployees = filteredData;
    }
    if(filteredKey === 'status-ids') {
      this.selectedStatus = filteredData;
    }
    if(filteredKey === 'issue-ids') {
      this.selectedIssues = filteredData;
    }
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      raised_date: this.raisedDate,
      status_date: this.selectedStatusDate,
      prime_emp: this.primaryEmployees,
      ticket_status: this.selectedStatus,
      issues: this.selectedIssues
    });
  }
  onApplyDateFilter(filteredDate: string, filteredKey: string): void {
    this.selectedDate = filteredDate
    this.formattedData = [];
    if (filteredKey === 'ticket_raised_date') {
      this.raisedDate = filteredDate;
    } if (filteredKey === 'status_date') {
      this.selectedStatusDate = filteredDate;
    }
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      raised_date: this.raisedDate,
      status_date: this.selectedStatusDate,
      prime_emp: this.primaryEmployees,
      ticket_status: this.selectedStatus,
      issues: this.selectedIssues

    });
  }


  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term,
      raised_date: this.raisedDate,
      status_date: this.selectedStatusDate,
      prime_emp: this.primaryEmployees,
      ticket_status: this.selectedStatus,
      issues: this.selectedIssues
    });
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

  // new code
  private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map(col =>
      col.paramskeyId === key
        ? {
          ...col,
          filterOptions: cache.data,
          currentPage: cache.page,
          totalPages: Math.ceil(cache.total / 20),
          totalCount: cache.total
        }
        : col
    );
  }

  exportCsvOrPdf(fileType) {
    const search = this.term?.trim().length >= 2 ? `search=${encodeURIComponent(this.term.trim())}&` : '';
    let finalQuery = `?${search}&file-type=${fileType}&download=true`;

    // Old filter query building (simple array join)
    // if (this.primaryEmployees?.length > 0) {
    //   finalQuery += `&employee-ids=[${this.primaryEmployees}]`;
    // }
    // New: FilterState-aware (handles select-all three-state logic)
    finalQuery += this.buildQueryForFilter(this.primaryEmployees, 'ticket-employee');
    if (this.raisedDate) {
      finalQuery += `&ticket_raised_date=${this.raisedDate}`
    }
    if (this.selectedStatusDate) {
      finalQuery += `&status_date=${this.selectedStatusDate}`;
    }
    // Old filter query building (simple array join)
    // if(this.selectedStatus?.length > 0){
    //    finalQuery += `&status=[${this.selectedStatus}]`;
    // }
    // New: FilterState-aware (handles select-all three-state logic)
    if (this.selectedStatus?.selectAllValue === true) {
      finalQuery += `&status=[${this.it_status.map(s => s.name).join(',')}]`;
    } else if (this.selectedStatus?.selectAllValue === false) {
      const excludedIds = this.selectedStatus?.excludedIds?.map((e: any) => e.name) || [];
      const remaining = this.it_status.filter(s => !excludedIds.includes(s.name)).map(s => s.name);
      finalQuery += `&status=[${remaining.join(',')}]`;
    } else if (this.selectedStatus?.selectedOptions?.length) {
      finalQuery += `&status=[${this.selectedStatus.selectedOptions.map((s: any) => s.name).join(',')}]`;
    }
    finalQuery += this.buildQueryForFilter(this.selectedIssues, 'issue');
    if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    const url = `${environment.live_url}/${environment.all_jobs}/${finalQuery}`;
    window.open(url, '_blank');
  }

  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; raised_date?: any; status_date?: any, ticket_status?: any; prime_emp?: any,issues?: any[] }) {
    let finalQuery;
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;
    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    finalQuery = query
    // Old filter query building (simple array join)
    // if (params?.prime_emp?.length > 0) {
    //   finalQuery += `&employee-ids=[${params?.prime_emp}]`;
    // }
    // New: FilterState-aware (handles select-all three-state logic)
    finalQuery += this.buildQueryForFilter(params?.prime_emp, 'ticket-employee');
    finalQuery += this.buildQueryForFilter(params?.issues, 'issue');

    if (params?.ticket_status?.selectAllValue === true) {
      finalQuery += `&status=[${this.it_status.map(s => s.name).join(',')}]`;
    } else if (params?.ticket_status?.selectAllValue === false) {
      const excludedIds = params?.ticket_status?.excludedIds?.map((e: any) => e.name) || [];
      const remaining = this.it_status.filter(s => !excludedIds.includes(s.name)).map(s => s.name);
      finalQuery += `&status=[${remaining.join(',')}]`;
    } else if (params?.ticket_status?.selectedOptions?.length) {
      finalQuery += `&status=[${params?.ticket_status.selectedOptions.map((s: any) => s.name).join(',')}]`;
    }

    if (params?.raised_date?.startDate && params?.raised_date?.endDate) {
      finalQuery += `&ticket_raised_start-date=${params?.raised_date.startDate}&ticket_raised_end-date=${params?.raised_date.endDate}`;
    } if (params?.status_date?.startDate && params?.status_date?.endDate) {
      finalQuery += `&status_start-date=${params?.status_date.startDate}&status_end-date=${params?.status_date.endDate}`;
    }
    // if (params?.issues?.length > 0) {
    //   finalQuery += `&issue=[${params?.issues}]`;
    // }

    if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    // Old filter query building (simple array join)
    // if(this.selectedStatus?.length > 0){
    //    finalQuery += `&status=[${this.selectedStatus}]`;
    // }
    await this.api.getData(`${environment.live_url}/${environment.it_ticket}/${finalQuery}`).subscribe((res: any) => {
      if (res && Array.isArray(res.results)) {
        this.formattedData = res?.results?.map((item: any, i: number) => ({
          sl: (page - 1) * pageSize + i + 1,
          ...item,
        }));
        this.tableConfig = {
          columns: tableColumns.map(col => {
            let filterOptions: any = [];

            // Try to retain old filterOptions
            const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            }

            return {
              ...col,
              filterOptions,
              // Preserve totalCount/currentPage/totalPages set by updateFilterColumn
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
          currentPage: page,
          totalRecords: res.total_no_of_record,
          showDownload: false,
          searchPlaceholder: 'Search by employee name',
        }
      } else {
        const existingColumnsEmpty = this.tableConfig?.columns ?? [];
        this.tableConfig = {
          columns: tableColumns?.map(col => {
            const existingCol = existingColumnsEmpty.find((c: any) => c.key === col.key);
            return {
              ...col,
              filterOptions: existingCol?.filterOptions ?? [],
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
          currentPage: page,
          totalRecords: 0,
          showDownload: false,
          searchPlaceholder: 'Search by employee name',
        };
      }
    }, (error: any) => {
      this.api.showError(error?.error?.detail);
      this.formattedData = [];
      this.tableConfig = { ...this.tableConfig, data: [], totalRecords: 0, currentPage: page };
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

    // If already loaded all records, don't fetch again
    if (cache.data.length >= cache.total && cache.total > 0) {
      this.updateFilterColumn(key, cache);
      return;
    }

    const nextPage = cache.page + 1;
    let query = `?page=${nextPage}&page_size=${detail.pageSize}`;
    if (searchTerm) query += `&search=${searchTerm}`;

    let endpoint = '';

    if (key === 'issue-ids') {
      endpoint = environment.issue_list;
    } 
    if(key === 'status-ids') {
       this.updateFilterColumn(key, { data: this.it_status, page: 1, total: this.it_status.length, searchTerm: '' });
      return;
    }
    if (key === 'is-primary-ids'){
    endpoint = environment.employee;
    query +=  `&is_active=True&employee=True`
  }

    this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
      .subscribe((res: any) => {
        if (!res) return;

        const fieldMap: any = {
          'issue-ids': { id: 'issue_id', name: 'issue' }
          , 'is-primary-ids': { id: 'user_id', name: 'user__full_name' }
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
