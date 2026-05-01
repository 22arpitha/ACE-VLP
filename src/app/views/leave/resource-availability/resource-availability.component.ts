import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { FilterQueryService } from '../../../service/filter-query.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
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
  selector: 'app-resource-availability',
  templateUrl: './resource-availability.component.html',
  styleUrls: ['./resource-availability.component.scss']
})
export class ResourceAvailabilityComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  filterQuery: any
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  selectedPeriod: any
  mainStartDate: any;
  mainEndDate: any;
  periodValues: any = [];
  employeeCalendarData: any = []
  weekDates: any = []
  leaveOptions: any = []
  isLoading = false;
  allDataLoaded = false;
  user_id: any;
  userRole: any;
   filters: any = {
    employees: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  }
  constructor(private apiService: ApiserviceService, private datePipe: DatePipe, 
    private dropdownService: DropDownPaginationService, private filterQueryService: FilterQueryService,) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.getPeriodData();
    this.getEmployeeCalendar();
    this.getallLeaveTypes();
  }


  // Fix: generate string keys for columns
  get displayedColumns(): string[] {
    return ['employee', ...this.weekDates.map((d:any) => this.getDateKey(d))];
  }

  getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // e.g. "2025-05-25"
  }

  getPeriodData() {
    this.apiService.getData(`${environment.live_url}/${environment.period_values}/`).subscribe(
      (res: any) => {
        this.periodValues = res?.data;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  getallLeaveTypes() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/`).subscribe((respData: any) => {
      this.leaveOptions = respData?.map((item: any) => ({
        id: item.id,
        name: item.leave_type_name,
        color: item.color
      }));
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
  fetchEmployees = (page: number, search: string) => {
    const extraParams: any = {
      is_active: 'True',
      employee: 'True',
      // ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
    };
    if (this.userRole === 'Manager') {
      extraParams['reporting_manager_id'] = this.user_id; // 145 in your example
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

  selectedPeriodFunc(event: any) {
    console.log(this.selectedPeriod)
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.page = 1;
    this.allDataLoaded = false;
    this.isLoading = false;
    if (this.selectedPeriod != 'custom') {
      this.employeeCalendarData = [];
      this.getEmployeeCalendar();
    } else{
    }
  }
  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  mainDateChange(event: any) {
    // const selectedDate = event.value;
    // const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }
  mainEndDateChange(event: any) {
    if (event.value) {
      this.page = 1;
      this.allDataLoaded = false;
      this.employeeCalendarData = [];
      this.isLoading = false;
      this.getEmployeeCalendar();
    }
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.page = 1;
    this.allDataLoaded = false;
    this.employeeCalendarData = [];
    this.isLoading = false;
    this.getEmployeeCalendar();
  }

  private ids(filterArray: any[]): string {
  if (!Array.isArray(filterArray)) return '';
  return filterArray.map(x => x.id).join(',');
}
private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'employees': 'resource-employee', // leave_employee_ids
    };
    return mapping[filterType] || filterType;
  }

  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }
  getEmployeeCalendar() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.filterQuery = this.getFilterBaseUrl()
    if (this.selectedPeriod) {
      this.filterQuery += `&leave_period=${this.selectedPeriod}`;
    }
    // const isDropdownSelected = this.userRole !== 'Admin' && this.filters.employees.length !== 0;
    // this.filterQuery += `&is_dropdown_selected=${isDropdownSelected}`;
    // let employeeIds = this.filters.employees.length ? this.ids(this.filters.employees): '';
    if (this.userRole === 'Manager') {
      // old code 
      // employeeIds = employeeIds ? `${employeeIds},${this.user_id}`: `${this.user_id}`;
      // select all code  
      this.filterQuery += `&manager_id=${this.user_id}`;
    }
    // if (employeeIds) {
    //   this.filterQuery += `&employee-ids=[${employeeIds}]`;
    // }
    this.filterQuery += this.buildFilterQuery('employees');
    // if (this.filters.employees.length) {
    //   this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    // }
    if (this.mainStartDate && this.mainEndDate) {
      let start_date = this.datePipe.transform(this.mainStartDate, 'yyyy-MM-dd');
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery += `&start_date=${start_date}&end_date=${end_date}`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.resource_availability}/${this.filterQuery}`)
      .subscribe((res: any) => {
        if (res.results) {
          if (this.page === 1) {
            this.employeeCalendarData = res.results;
          } else {
            this.employeeCalendarData = [...this.employeeCalendarData, ...res.results];
          }

          this.weekDates = res?.results[0]?.leave;
          this.count = res.total_pages * this.tableSize;
          this.page = res.current_page;

          if (this.page >= res.total_pages) {
            this.allDataLoaded = true;
          }
        } else {
          this.allDataLoaded = true;
        }
        this.isLoading = false;
      }
      );
  }

  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    // const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    // const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

    return `${base}`;
  }

  onScroll(event: any) {
    // console.log(event)
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 20;

    if (atBottom && !this.isLoading && !this.allDataLoaded) {
      this.page++;
      this.getEmployeeCalendar(); // just call the same method
    }
  }

  reset(){
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.selectedPeriod = '';
    // this.filters.employees = [];
    this.filters.employees = { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 };
    this.resetFilters();
    this.page = 1
    this.tableSize = 50;
    this.isLoading = false;
    this.allDataLoaded = false;
    this.getEmployeeCalendar()
  }

   resetFilters(): void {
    this.employeeFilter?.clearSelection();
  }
}
