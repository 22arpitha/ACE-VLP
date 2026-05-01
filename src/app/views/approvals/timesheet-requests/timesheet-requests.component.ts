import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { CommonServiceService } from '../../../service/common-service.service';
import { ViewTimesheetRequestComponent } from '../view-timesheet-request/view-timesheet-request.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { FilterQueryService } from '../../../service/filter-query.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';

@Component({
  selector: 'app-timesheet-requests',
  templateUrl: './timesheet-requests.component.html',
  styleUrls: ['./timesheet-requests.component.scss']
})
export class TimesheetRequestsComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  @ViewChild('statusFilter') statusFilter!: GenericTableFilterComponent;
  BreadCrumbsTitle: any = 'Timesheet Requests';
  selectedTabIndex = 0;
  activeStatus = 'pending';
  timesheetRequestsList: any[] = [];
  loading = false;
  userId: any;
  userRole: any;

  // Date filter
  mainStartDate: any;
  mainEndDate: any;

  // Pagination
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
   filters: any = {
    employees: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    status_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  }
  // Sorting
  sortValue = '';
  directionValue = '';
  arrowState: { [key: string]: boolean } = {
    employee_name: false,
    quarter: false,
    date_to_unlock: false,
    created_datetime: false,
    status: false,
  };

  tabs = [
    { label: 'Pending', status: 'pending' },
    { label: 'Approved', status: 'approved' },
    { label: 'Rejected', status: 'rejected' },
  ];

  constructor(private apiService: ApiserviceService, private common_service: CommonServiceService, private datePipe: DatePipe,
    private dialog: MatDialog, private route: ActivatedRoute, private router: Router,
     private dropdownService: DropDownPaginationService,
     private filterQueryService: FilterQueryService,
  ) {
    this.userId = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name')?.toLowerCase();
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    // this.fetchTimesheetRequests();
    this.handleQueryParams();
  }

  handleQueryParams() {
  this.route.queryParams.subscribe(params => {
    const requestId = params['request_id'];
    const view = params['view'];
    if (view) {
      const tabIndex = this.tabs.findIndex(t => t.status === view);
      if (tabIndex !== -1) {
        this.selectedTabIndex = tabIndex;
        this.activeStatus = view;
      }
    }
    this.fetchTimesheetRequests();
    if (requestId) {
      setTimeout(() => {
        this.checkTimesheetRequestPresent(requestId);
      }, 500); // wait for API load
    }
  });
}

  onTabChange(event: any): void {
    const index = event.index;
    this.selectedTabIndex = index;
    this.activeStatus = this.tabs[index].status;
    this.page = 1;
    this.filters= {
      employees: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
      status_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    }
    this.tableSize = 50;
    this.timesheetRequestsList = [];
    this.resetSort();
    this.fetchTimesheetRequests();
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  mainDateChange(event: any): void {
  }

  mainEndDateChange(event: any): void {
    if (event.value) {
      this.page = 1;
      this.tableSize = 50;
      this.fetchTimesheetRequests();
    }
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }

  onFilterChange(event: any, filterType: string) {
    this.filters[filterType] = event;
    this.page = 1;
     this.fetchTimesheetRequests();
  }

  checkTimesheetRequestPresent(id: any) {
   this.apiService.getData(`${environment.live_url}/${environment.unlock_request}/${id}/`)
    .subscribe(
      (res: any) => {
        if (res) {
          this.viewRequest(id);
          this.router.navigate([], {
            queryParams: {},
            replaceUrl: true
          });
        }
      },
      (error) => {
        this.apiService.showError(error?.error?.error);
      }
    );
  }

  private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'employees': 'timesheet-lock-employee', 
    };
    return mapping[filterType] || filterType;
  }
  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }

  fetchTimesheetRequests(): void {
    this.loading = true;
    let url = `${environment.live_url}/${environment.unlock_request}/?page=${this.page}&page_size=${this.tableSize}&status=${this.activeStatus}`;
    url += this.userRole === 'manager' ? `&manager_id=${this.userId}`:'';
    url += this.buildFilterQuery('employees');
    if(this.userRole==='accountant'){
      url += `&employee_id=${this.userId}`;
    }
    if (this.mainStartDate && this.mainEndDate) {
      const startDate = this.datePipe.transform(this.mainStartDate, 'yyyy-MM-dd');
      const endDate = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      url += `&leave-start-date=${startDate}&leave-end-date=${endDate}`;
    }
    if (this.directionValue && this.sortValue) {
      url += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.apiService.getData(url).subscribe(
      (res: any) => {
        this.timesheetRequestsList = res?.results || [];
        const totalPages: number = res?.total_pages || 0;
        this.count = totalPages * this.tableSize;
        this.page = res?.current_page || 1;
        this.loading = false;
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
        this.timesheetRequestsList = [];
        this.loading = false;
      }
    );
  }

  sort(direction: string, column: string): void {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending';
    this.directionValue = direction;
    this.sortValue = column;
    this.fetchTimesheetRequests();
  }

  resetSort(): void {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.sortValue = '';
    this.directionValue = '';
  }

  reset(): void {
    this.page = 1;
    this.tableSize = 50;
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.selectedTabIndex = 0;
    this.activeStatus = 'pending';
    this.resetSort();
    this.fetchTimesheetRequests();
  }

  onTableDataChange(event: any): void {
    this.page = event;
    this.fetchTimesheetRequests();
  }

  onTableSizeChange(event: any): void {
    this.page = 1;
    this.tableSize = Number(event.value);
    this.fetchTimesheetRequests();
  }

  // checkStatus(item): boolean {

  // }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  viewRequest(id: any) {
    const dialogRef = this.dialog.open(ViewTimesheetRequestComponent, {
      data: id,
      panelClass: 'request-unlock-dialog',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      // console.log('resp', resp);
      if (resp?.data === 'refresh') {
        this.fetchTimesheetRequests();
        dialogRef.close();
      }
    });
  }

   fetchEmployees = (page: number, search: string) => {
    const extraParams:any = {
      is_active: 'True',
      employee: 'True',
    };
    if (this.userRole === 'manager') {
      extraParams['reporting_manager_id'] = this.userId; 
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item:any) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };
}
