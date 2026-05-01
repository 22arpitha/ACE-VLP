import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, forkJoin, map, Subject } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { FilterQueryService } from '../../../service/filter-query.service';

export interface IdNamePair {
  id: any;
  name: string;
}

export interface FilterState {
  selectAllValue: boolean | null;
  selectedOptions: IdNamePair[];
  excludedIds: IdNamePair[];
  selectedCount: number;
}

@Component({
  selector: 'app-jobs-of-clients',
  templateUrl: './jobs-of-clients.component.html',
  styleUrls: ['./jobs-of-clients.component.scss']
})
export class JobsOfClientsComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  @ViewChild('jobTypeFilter') jobTypeFilter!: GenericTableFilterComponent;
  @ViewChild('groupClientFilter') groupClientFilter!: GenericTableFilterComponent;
  @ViewChild('managerFilter') managerFilter!: GenericTableFilterComponent;
  @ViewChild('satusGroupFilter') satusGroupFilter!: GenericTableFilterComponent;

  BreadCrumbsTitle: any;
  allJobs: any = [];
  private searchSubject = new Subject<string>();
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    group_name: false,
    job_number: false,
    job_name: false,
    job_type__job_type_name: false,
    primary_employee_name: false,
    job_status__status_name: false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  term: any = '';
  client_id: any;
  user_id: any;
  userRole: any;
  accessPermissions: any = [];
  access_name: any;

  filters: { [key: string]: FilterState } = {
    group_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    job_type_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    employees: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    manager: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    status_group_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  };

  allJobStatus: any = [];
  groupList: any = [];
  allStatuGroupNames: IdNamePair[] = [];
  internalReviewOneIndex: any;
  statusList: String[] = [];
  dateFilterValue: any = null;
  statusDateFilterValue: any = null;
  filteredList: any = [];
  filterQuery: string = '';
  jobList: any = [];
  jobAllocationDate: string | null = null;
  statusDate: any;
  dateRange: any = {
    start: '',
    end: ''
  };

  columns = [
    { key: 'sl_no', label: 'Sl No', visible: true },
    { key: 'job_number', label: 'Job Id', visible: true },
    { key: 'job_name', label: 'Job', visible: true },
    { key: 'job_type_name', label: 'Job Type', visible: true },
    { key: 'group_name', label: 'Group', visible: false },
    { key: 'job_allocation_date', label: 'Allocated On', visible: false },
    { key: 'employees', label: 'Employees', visible: true },
    { key: 'manager', label: 'Manager', visible: true },
    { key: 'status_name', label: 'Status', visible: true },
    { key: 'percentage_of_completion', label: 'Percentage Of Completion', visible: true },
    { key: 'job_status_date', label: 'Status Date', visible: true },
    { key: 'tat_days', label: 'Tat Days', visible: true },
  ];

  constructor(
    private datePipe: DatePipe,
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private api: ApiserviceService,
    private dropdownService: DropDownPaginationService,
    private filterQueryService: FilterQueryService,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.client_id = this.activateRoute.snapshot.paramMap.get('id');
    this.getModuleAccess();
    this.loadInitialData();
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((term: string) => term === '' || term.length >= 2)
    ).subscribe((search: string) => {
      this.term = search;
      this.filterData();
    });
  }

  loadInitialData() {
    this.allJobStatus = [];
    this.allStatuGroupNames = [];
    forkJoin({
      _res_status_group: this.api.getData(`${environment.live_url}/${environment.settings_status_group}/`),
      _res_job_status: this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`),
    }).subscribe((data: any) => {
      if (data._res_status_group && data._res_status_group?.length >= 1) {
        this.groupList = data._res_status_group;
      }
      if (data._res_job_status && data._res_job_status?.length >= 1) {
        data._res_job_status.forEach((element: any) => {
          element['valueChanged'] = false;
        });
        this.allJobStatus = data._res_job_status;
        this.internalReviewOneIndex = this.allJobStatus.findIndex((status: any) => status?.status_name.toLowerCase() === 'internal review 1');
      }
      this.filterData();
    }, (error) => {
      this.api.showError(error?.error?.detail);
    });
  }

  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
         let temp = access.find((item: any) => item.name === 'Jobs');
          this.access_name = temp;
          this.accessPermissions = temp?.operations;
      }
    });
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.filterData();
  }

  filterSearch(event: any) {
    const value = event?.target?.value || '';
    if (value && value.length >= 2) {
      this.page = 1;
    }
    this.searchSubject.next(value);
  }

  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}&non-productive-jobs=true`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    const clientParam = `&client=${this.client_id}`;
    const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

    return `${base}${searchParam}${clientParam}${employeeParam}`;
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.filterData();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.filterData();
  }

  private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'job_type_name': 'job-type',
      'group_name': 'group',
      'employees': 'employee',
      'manager': 'manager',
      'status_group_name': 'status-group'
    };
    return mapping[filterType] || filterType;
  }

  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }

  filterData() {
    this.filterQuery = this.getFilterBaseUrl();
    
    // Apply new filter logic for all filter types
    this.filterQuery += this.buildFilterQuery('job_type_name');
    this.filterQuery += this.buildFilterQuery('group_name');
    this.filterQuery += this.buildFilterQuery('employees');
    this.filterQuery += this.buildFilterQuery('manager');
    
    if (this.dateRange.start && this.dateRange.end) {
      this.filterQuery += `&start-date=${this.dateRange.start}&end-date=${this.dateRange.end}`;
    }
    if (this.directionValue && this.sortValue) {
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    if (this.statusDate) {
      this.filterQuery += `&job-status-date=[${this.statusDate}]`;
    }
    
    this.filterQuery += this.buildFilterQuery('status_group_name');
    
    this.api.getData(`${environment.live_url}/${environment.only_jobs}/${this.filterQuery}`).subscribe(
      (res: any) => {
        this.allJobs = res?.results;
        this.filteredList = res?.results;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      }, (error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }

  setDateFilterColumn(event: any) {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  onStatusDateSelected(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  clearStatusDateFilter() {
    this.statusDate = null;
    this.statusDateFilterValue = null;
    this.filterData();
  }

  allocationStartDate(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.start = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
  }

  allocationEndDate(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  clearDateFilter() {
    this.jobAllocationDate = null;
    this.dateRange.start = '';
    this.dateRange.end = '';
    this.filterData();
  }

  getEmployeeName(employees: any): string {
    if (!employees || employees.length === 0) {
      return '-';
    }
    const employee = employees.find((emp: any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }

  getManagerName(employees: any): string {
    const manager = employees.find((man: any) => man?.is_primary === true);
    return manager ? manager?.manager_name : '';
  }

  changedStatusName: any;
  onStatusChange(item: any, event: any) {
    const selectedStatusId = event.value;
    const selectedStatus = this.allJobStatus.find((status: any) => status.id == selectedStatusId);
    this.changedStatusName = selectedStatus.status_name;
    if (selectedStatus) {
      item.job_status = event.value;
      item.percentage_of_completion = selectedStatus.percentage_of_completion;
      item.isInvalid = false;
    }
    this.saveJobStausPercentage(item);
  }

  validateKeyPress(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
    }
  }

  validatePercentage(item: any) {
    const percentage = item.percentage_of_completion;
    if (percentage === null || percentage === undefined || percentage === '') {
      item.isInvalid = true;
      item.errorType = 'required';
    } else if (!/^(100|[1-9]?\d?)$/.test(percentage.toString())) {
      item.isInvalid = true;
      item.errorType = 'pattern';
    } else if (Number(percentage) > 100) {
      item.isInvalid = true;
      item.errorType = 'max';
    } else if (Number(percentage) < 0) {
      item.isInvalid = true;
      item.errorType = 'min';
    } else {
      item.isInvalid = false;
      item.valueChanged = true;
      item.errorType = null;
    }
  }

  saveJobStausPercentage(item: any) {
    if (!item.isInvalid) {
      if (!this.changedStatusName) {
        this.changedStatusName = item.job_status_name;
      }
      let temp_status = this.changedStatusName?.toLowerCase();
      let formData: any = {
        'job_status': item?.job_status, 'percentage_of_completion': item.percentage_of_completion,
        status: (temp_status === 'cancelled' || temp_status === 'completed') ? false : true,
        update_by: Number(this.user_id)
      };
      this.api.updateData(`${environment.live_url}/${environment.jobs_percetage}/${item.id}/`, formData).subscribe((respData: any) => {
        if (respData) {
          this.api.showSuccess(respData['message']);
          this.filterData();
        }
      }, (error: any) => {
        this.api.showError(error?.error?.detail);
      });
    }
  }

  async edit(item: any) {
    sessionStorage.setItem('access-name', this.access_name?.name);
    this.router.navigate(['/jobs/update-job', item?.id], { queryParams: { 'jobs': false, 'client': item?.client_id } });
  }

  removePagination(url: string) {
    const params = new URLSearchParams(url);
    params.delete('page');
    params.delete('page_size');
    return params.toString();
  }

  downloadOption(type: any) {
    let cleanedFilterQuery = this.filterQuery;
    const updated_query = this.removePagination(cleanedFilterQuery);
    let query = `?download=true&file-type=${type}&non-productive-jobs=true`;
    query += `&${updated_query}`;
    query += this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
    let apiUrl = `${environment.live_url}/${environment.only_jobs}/${query}`;
    window.open(apiUrl, '_blank');
  }

  isColumnVisible(key: string): boolean {
    const col = this.columns.find(c => c.key === key);
    return col ? col.visible : false;
  }

  resetColumns() {
    this.columns.forEach(col => col.visible = true);
  }

  jobStatusValidation(data: any, index: any): boolean {
    if ((data.estimated_time === '00:00' || data.estimated_time === '0:00') && index >= this.internalReviewOneIndex) {
      return true;
    }
    if (this.userRole !== 'Admin') {
      return data.only_admin_can_change_job_status ? true : false;
    }
    return false;
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  fetchJobTypes = (page: number, search: string) => {
    return this.dropdownService.fetchDropdownData$(
      environment.settings_job_type,
      page,
      search,
      (item) => ({ id: item.id, name: item.job_type_name }),
    );
  };

  fetchEmployees = (page: number, search: string) => {
    const extraParams = {
      is_active: 'True',
      employee: 'True',
    };
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

  fetchGroupClients = (page: number, search: string) => {
    const extraParams = {
      ...(this.userRole !== 'Admin' && { 'employee_id': this.user_id })
    };
    return this.dropdownService.fetchDropdownData$(
      environment.clients_group,
      page,
      search,
      (item) => ({ id: item.id, name: item.group_name }),
      extraParams
    );
  };

  fetchManagers = (page: number, search: string) => {
    let extraParams: any = {
      is_active: 'True',
      employee: 'True',
      designation: 'manager'
    };
    if (this.userRole === 'Manager' || this.userRole === 'Accountant') {
      extraParams = { userId: this.user_id };
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

  fetchStatusGroup = (page: number, search: string) => {
    return this.dropdownService.fetchDropdownData$(
      environment.settings_status_group,
      page,
      search,
      (item: any) => {
        return { id: item.id, name: item.group_name };
      }
    );
  };

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.filterData();
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }

  resetFilters(): void {
    this.satusGroupFilter?.clearSelection();
  }
}
