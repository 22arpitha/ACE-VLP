import { Component, OnInit } from '@angular/core';
import { getTableColumns } from './missed-timeshet-reports.config';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { FilterQueryService } from '../../../service/filter-query.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-missed-timesheet-reports',
  templateUrl: './missed-timesheet-reports.component.html',
  styleUrls: ['./missed-timesheet-reports.component.scss']
})
export class MissedTimesheetReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Missed Timesheet Report';
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
    showDownload: true,
  };
  userRole: string = '';
  user_role_name: string = '';
  user_id: string = '';
  tableData: (
    {
      label: string;
      key: string;
      sortable: boolean;
      sortKey?: string;
      type?: string;
      keyId?: string;
      paramskeyId?: string;
      leftAlign?: boolean;
      filterable?: undefined;
      filterType?: undefined;
    }
    |
    {
      label: string;
      key: string;
      sortable: boolean;
      sortKey?: string;
      type?: string;
      keyId?: string;
      paramskeyId?: string;
      leftAlign?: boolean;
      filterable: boolean;
      filterType: string;
    }
  )[];
  // tableData: ({ label: string; key: string; sortable: boolean; filterable?: undefined; filterType?: undefined; } | { label: string; key: string; sortable: boolean; filterable: boolean; filterType: string; })[];
  selectedEmployeeIds: any = [];
  selectedDate: any;
  sortValue: string = '';
  directionValue: string = '';
  employeeName: { id: any; name: string; }[] = [];
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private filterQueryService: FilterQueryService,
    private datePipe: DatePipe
  ) {
    this.user_id = sessionStorage.getItem('user_id') || '';
    this.user_role_name = sessionStorage.getItem('user_role_name')?.toLowerCase() || '';
  }

  ngOnInit() {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableData = getTableColumns(this.user_role_name);
    if (
      !this.selectedEmployeeIds.length
    ) {
      this.getTableData();
    }
  }


  onTableDataChange(event: any) {
    const page = event;
    this.page = page;

    this.getTableData({
      page: page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
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
        employee_ids: this.selectedEmployeeIds,
        timesheet_dates: this.selectedDate
      });
    }

  }

  // Called from <app-dynamic-table> via @Output actionEvent
  handleAction(event: { actionType: string; detail: any, key: string, fromFilter?: boolean }) {
    // console.log(event)
    switch (event.actionType) {
      case 'tableDataChange':
        this.onTableDataChange(event.detail);
        break;
      case 'tableSizeChange':
        if (!event.fromFilter) this.onTableSizeChange(event.detail);
        // this.onTableSizeChange(event.detail);
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
      case 'sorting':
        this.onSorting(event);
        break;
      case 'dateRange':
        // console.log(event.detail, event.key);
        this.onApplyDateFilter(event.detail);
        break;
      default:
    }
  }

  onSorting(data: any) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }

  onApplyFilter(filteredData: any, filteredKey: string): void {
    if (filteredKey === 'timesheet-employee-ids') {
      this.selectedEmployeeIds = filteredData;
    }
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }
  onApplyDateFilter(filteredDate: string): void {
    this.selectedDate = filteredDate;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }

  exportCsvOrPdf(fileType:any) {
    let query = `?download=true`
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    query += this.user_role_name === 'manager' ? `&manager_id=${this.user_id}` : '';
    query += this.user_role_name === 'accountant' ? `&emp_id=${this.user_id}` : '';
    query += this.buildQueryForFilter(this.selectedEmployeeIds, 'timesheet-employee'); if (this.term) {
      query += `&search=${searchParam}`
    } if (this.selectedDate) {
      let from_date = this.datePipe.transform(this.selectedDate.startDate, 'yyyy-MM-dd');
      let to_date = this.datePipe.transform(this.selectedDate.endDate, 'yyyy-MM-dd');
      query += `&from_date=${from_date}&to_date=${to_date}`
    }
    const url = `${environment.live_url}/${environment.vlp_timesheets}/${query}&file-type=${fileType}`;
    window.open(url, '_blank');
  }


  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term,
      employee_ids: this.selectedEmployeeIds,
      timesheet_dates: this.selectedDate
    });
  }



  //  select all code
  private buildQueryForFilter(filterValue: any, paramName: string): string {
    if (!filterValue) return '';
    // Old format: plain array of ids
    if (Array.isArray(filterValue)) {
      return filterValue.length ? `&${paramName}-ids=[${filterValue.join(',')}]` : '';
    }
    // New format: FilterState object
    return this.filterQueryService.buildFilterSegment(filterValue, paramName);
  }

  private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map((col: any) =>
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
  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; client_ids?: any; job_ids?: any; task_ids?: any; employee_ids?: any, timesheet_dates?: any }) {
    // console.log(params)
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    query += this.user_role_name === 'manager' ? `&manager_id=${this.user_id}` : '';
    query += this.user_role_name === 'accountant' ? `&emp_id=${this.user_id}` : '';

    query += this.buildQueryForFilter(params?.employee_ids, 'missing-report-employee');
    if (params?.timesheet_dates) {
      let from_date = this.datePipe.transform(params.timesheet_dates.startDate, 'yyyy-MM-dd');
      let to_date = this.datePipe.transform(params.timesheet_dates.endDate, 'yyyy-MM-dd');
      query += `&from_date=${from_date}&to_date=${to_date}`
    }
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    await this.api.getData(`${environment.live_url}/${environment.missed_timesheets}/${query}`).subscribe((res: any) => {
      if (res) {
        const formattedData = res?.results?.map((item: any, i: number) => ({
          sl: (page - 1) * pageSize + i + 1,
          ...item
        }));
        this.tableConfig = {
          columns: this.tableData.map((col: any) => {
            let filterOptions: any = [];
            const existingCol = this.tableConfig?.columns?.find((c: any) => c.key === col.key);
            // console.log(existingCol)
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            } else if (col.filterable) {
              // Fallback to initial options if none present
              if (col.key === 'employee_name') {
                filterOptions = this.employeeName;
              }
            }

            return {
              ...col,
              filterOptions,
              ...(existingCol?.totalCount !== undefined && { totalCount: existingCol.totalCount }),
              ...(existingCol?.currentPage !== undefined && { currentPage: existingCol.currentPage }),
              ...(existingCol?.totalPages !== undefined && { totalPages: existingCol.totalPages }),
            };
          }),
          data: formattedData,
          searchTerm: this.term,
          actions: [],
          accessConfig: [],
          tableSize: pageSize,
          pagination: true,
          searchable: true,
          currentPage: page,
          totalRecords: res.total_no_of_record,
          showDownload: false,
          showCsv: false,
          showPdf: false,
          // disableDownload: disableFlag,
          searchPlaceholder: 'Employee',
        }
      }
    });

  }
  containsLeapYear(start: Date, end: Date): boolean {
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      if (this.isLeapYear(y)) return true;
    }
    return false;
  }

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  getDisableDownload(startStr: string, endStr: string): boolean {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000);

    const hasLeap = this.containsLeapYear(start, end);
    const limit = hasLeap ? 366 : 365;
    return diffDays > limit;
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

    if (key === 'timesheet-employee-ids') {
      endpoint = environment.employee;
      query += `&is_active=True&employee=True`
       if (this.user_role_name === 'manager') {
        query += `&reporting_manager_id=${this.user_id}`;
      }
    }


    this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
      .subscribe((res: any) => {
        if (!res) return;

        const fieldMap: any = {
          'timesheet-employee-ids': { id: 'user_id', name: 'user__full_name' },
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