import { Component, Input, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { FilterQueryService } from '../../../service/filter-query.service';
import { getPendingColumns } from './pending-timesheet-reports-config';
@Component({
  selector: 'app-pending-timesheet-reports',
  templateUrl: './pending-timesheet-reports.component.html',
  styleUrls: ['./pending-timesheet-reports.component.scss']
})
export class PendingTimesheetReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Pending Timesheet Reports';
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
    tableSize: this.tableSize,
    pagination: true,
    showDownload: true,
    total_hours: false,
  };
  tableColumns: any = [];
  user_id: string;
  user_role_name: string;
  sortValue: string = '';
  primaryEmployees: any = [];
  directionValue: string = '';
  weekDateRange: { from_date: string; to_date: string };
  currentReferenceDate: Date = new Date();
  monday: Date;
  sunday: Date;
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService, private datePipe: DatePipe,
    private dialog: MatDialog,
    private filterQueryService: FilterQueryService

  ) {
    this.user_id = sessionStorage.getItem('user_id') || '';
    this.user_role_name = sessionStorage.getItem('user_role_name')?.toLowerCase() || '';
  }


  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.tableColumns = getPendingColumns(this.user_role_name);
    this.calculateWeek();
    // this.getTableData();
  }

  onTableDataChange(event: any) {
    const page = event;
    this.page = page;
    this.getTableData({
      page: page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      weekDateRange: this.weekDateRange,
      prime_emp: this.primaryEmployees

    });
  }

  onTableSizeChange(event: any): void {
    if (event) {
      const newSize = Number(event.value || event);
      this.tableSize = newSize;
      this.page = 1;
      this.getTableData({
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term,
        weekDateRange: this.weekDateRange,
        prime_emp: this.primaryEmployees

      });
    }
  }

  handleAction(event:  { actionType: string; detail: any,key:string, fromFilter?: boolean  }) {
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
      case 'sorting':
        this.onSorting(event);
        break;
      case 'export_csv':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'weekChange':
        this.filterWeeks(event.detail);
        break;
      case 'filter':
        this.onApplyFilter(event.detail, event.key);
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          weekDateRange: this.weekDateRange,
          prime_emp: this.primaryEmployees
        });
    }
  }

  filterWeeks(detail: any) {
    if (detail?.value === 'next-week-change') {
      this.currentReferenceDate.setDate(this.currentReferenceDate.getDate() + 7);
    } else if (detail?.value === 'previous-week-change') {
      this.currentReferenceDate.setDate(this.currentReferenceDate.getDate() - 7);
    }
    this.calculateWeek();
  }

  calculateWeek() {
    const dayOfWeek = this.currentReferenceDate.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = this.currentReferenceDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    this.monday = new Date(this.currentReferenceDate.setDate(diffToMonday));
    this.sunday = new Date(this.monday);
    this.sunday.setDate(this.monday.getDate() + 6);

    this.currentReferenceDate = new Date(this.monday);
    this.weekDateRange = {
      from_date: this.datePipe.transform(this.monday, 'yyyy-MM-dd') || '',
      to_date: this.datePipe.transform(this.sunday, 'yyyy-MM-dd') || ''
    };
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      weekDateRange: this.weekDateRange,
      prime_emp: this.primaryEmployees
    });
  }
   onApplyFilter(filteredData: any, filteredKey: string): void {
    if (filteredKey === 'is-primary-ids') {
      this.primaryEmployees = filteredData;
    }
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      weekDateRange: this.weekDateRange,
       prime_emp: this.primaryEmployees
    });
   }

  onSorting(data) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      weekDateRange: this.weekDateRange,
      prime_emp: this.primaryEmployees
    });
  }

  exportCsvOrPdf(fileType) {
    const search = this.term?.trim().length >= 2 ? `search=${encodeURIComponent(this.term.trim())}&` : '';
    let query = `?${search}download=true&file-type=${fileType}`;
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }

    const url = `${environment.live_url}/${environment.pending_timesheets}/${query}`;
    window.open(url, '_blank');
  }

  private buildQueryForFilter(filterValue: any, paramName: string): string {
    if (!filterValue) return '';
    // Old format: plain array of ids
    if (Array.isArray(filterValue)) {
      return filterValue.length ? `&${paramName}=[${filterValue.join(',')}]` : '';
    }
    // New format: FilterState object
    return this.filterQueryService.buildFilterSegment(filterValue, paramName);
  }
  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string,prime_emp?: any, weekDateRange?: { from_date: string; to_date: string } }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    let finalQuery = query;
    finalQuery += this.user_role_name === 'manager' ? `&manager_id=${this.user_id}` : '';
    finalQuery += this.user_role_name === 'accountant' ? `&emp_id=${this.user_id}` : '';
    finalQuery += this.buildQueryForFilter(params?.prime_emp, 'pending-report-employee');
    if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    if (this.weekDateRange?.from_date && this.weekDateRange?.to_date) {
      finalQuery += `&from_date=${this.weekDateRange.from_date}&to_date=${this.weekDateRange.to_date}`;
    }
    this.api.getData(`${environment.live_url}/${environment.pending_timesheets}/${finalQuery}`).subscribe((res: any) => {
      // Collect all unique job names across all employees
      const dateSet = new Set<string>();
      (res.results || []).forEach((item: any) => {
        (item.data || []).forEach((data: any) => {
          dateSet.add(this.datePipe.transform(data.date, 'dd/MM/yyyy') || '');
        });
      });
      const dates = Array.from(dateSet);

      const dynamicColumns: any[] = [
        { label: 'Sl No', key: 'sl' },
        { label: 'Employee', sortKey: 'full_name', key: 'full_name', keyId: 'employee_id', sortable: this.user_role_name !=='accountant', 
          filterable: this.user_role_name !=='accountant', filterType: 'multi-select',  paramskeyId: 'is-primary-ids', },
      ];
      dates.forEach((date, index) => {
        dynamicColumns.push({ label: date, key: `date_${index}` });
      });
      const formattedData = (res.results || []).map((item: any, i: number) => {
        const row: any = {
          sl: (page - 1) * pageSize + i + 1,
          employee_id: item.employee_id,
          full_name: item.full_name,
          total_time: item.total_time,
        };
        // Map each colour to the corresponding column key
        const dateColorMap: { [key: string]: string } = {};
        (item.data || []).forEach((d: any) => {
          dateColorMap[this.datePipe.transform(d.date, 'dd/MM/yyyy') || ''] = d.color;
        });
        dates.forEach((date, index) => {
          row[`date_${index}`] = dateColorMap[date] || '';
        });
        return row;
      });

      const tableFooterContent = { 'total_actual_time': res?.total_actual_time };
      this.tableConfig = {
        columns: dynamicColumns.map(col => {
          const existingCol = this.tableConfig?.columns?.find((c: any) => c.key === col.key);

          return {
            ...col,
            filterOptions: existingCol?.filterOptions || [],
            ...(existingCol?.totalCount !== undefined && { totalCount: existingCol.totalCount }),
            ...(existingCol?.currentPage !== undefined && { currentPage: existingCol.currentPage }),
            ...(existingCol?.totalPages !== undefined && { totalPages: existingCol.totalPages }),
          };
        }),
        data: formattedData ? formattedData : [],
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        currentPage: page,
        totalRecords: res.total_no_of_record,
        hideDownload: true,
        showDownload: false,
        total_hours: false,
        tableFooterContent: tableFooterContent,
        showCsv: false,
        showPdf: false,
        weekLeftAndRightArrows: true,
        searchPlaceholder: 'Search by employee name',
      };
    });
  }

  onSearch(term: string): void {
    this.term = term;
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: term,
      weekDateRange: this.weekDateRange,
      prime_emp: this.primaryEmployees

    });
  }



  ngOnDestroy(): void {
    this.tableConfig = null;
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
    
    if (key === 'is-primary-ids') {
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
          'is-primary-ids': { id: 'user_id', name: 'user__full_name' }
        };

        const newData = res.results?.map((item: any) => ({
          id: item[fieldMap[key]?.id] || '',
          name: item[fieldMap[key]?.name] || ''
        }));

        cache.data = [
          ...cache.data,
          ...newData.filter((opt: any) => !cache.data.some((existing) => existing.id === opt.id))
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
}

