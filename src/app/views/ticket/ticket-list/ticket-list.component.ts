import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { debounceTime, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TicketDetailComponent } from '../ticket-detail/ticket-detail.component';
import { GenericTimesheetConfirmationComponent } from 'src/app/generic-components/generic-timesheet-confirmation/generic-timesheet-confirmation.component';
export interface IdNamePair {
  id: any;
  name: string;
}

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
})
export class TicketListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('itStatusFilter') itStatusFilter!: GenericTableFilterComponent;
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  BreadCrumbsTitle: any = 'IT Tickets';
  allTickets = []
  selectedItemData: any;
  private searchSubject = new Subject<string>();
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    ticket_number: false,
    employee__user__full_name: false,
    ticket_raised_date: false,
    issue: false,
    status: false,
    status_date: false,
    tat_hours:false
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  term: any = '';
  client_id: any;
  filters: { employees: IdNamePair[]; it_ticketstatus: IdNamePair[] } = {
    employees: [],
    it_ticketstatus: []
  };
  allEmployeeNames: IdNamePair[] = [];
  allStatusNames: IdNamePair[] = [];
  dateFilterValue: any = null;
  statusDateFilterValue: any = null;
  raisedDateFilterValue: any = null;
  raisedDateRange: any = { start: '', end: '' };
  statusDateRange: any = { start: '', end: '' };
  filteredList: any = [];
  datepicker: any;
  filterQuery: string;
  jobList: any = [];
  jobAllocationDate: string | null;
  departmentName: any = '';
  statusDate: any;
  raisedDate: any;
  user_id: any;
  it_status = [{ id: 1, name: 'Open' }, { id: 2, name: "Close Request sent" }, { id: 3, name: "Re-Open" }, { id: 4, name: "Closed" }];
  userRole: any;
  dateRange = {
    start: '',
    end: ''
  };
  constructor(private datePipe: DatePipe, private common_service: CommonServiceService, private activateRoute: ActivatedRoute, private router: Router,
    private api: ApiserviceService, private dropdownService: DropDownPaginationService, private dialog: MatDialog, private modalService: NgbModal,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name').toLowerCase();
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((term: string) => term === '' || term.length >= 2),
      takeUntil(this.destroy$)
    ).subscribe((search: string) => {
      this.term = search
      this.filterData();
    });
    if (this.userRole !== 'admin') {
      this.getUrserData(this.user_id);
    }
    this.filterData();
    // this.getEmployees();
    // this.getAllJobStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUrserData(id: any) {
    this.api.getData(`${environment.live_url}/${environment.user}/${id}/`).subscribe((res: any) => {
      if (res) {
        this.departmentName = res.department__department_name || '';
      }
    });
  }

  public getAllJobStatus() {
    this.allStatusNames = [];
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((respData: any) => {
      if (respData && respData.length >= 1) {
        this.allStatusNames = respData.map((status: any) => ({ id: status.id, name: status.status_name }));
      }
    }, (error: any) => {
      this.api.showError(error.detail);

    });
  }
  selectedItem(item: any) {
    this.selectedItemData = item;
  }
  raiseNewTicket(): void {
    this.router.navigate(['/it-support/tickets/new']);
  }
  openTicket(ticket: any, view: boolean): void {
    const dialogRef = this.dialog.open(TicketDetailComponent, {
      data: { item: ticket, view_details: view },
      panelClass: 'view-leave-details-dialog',
      disableClose: false,
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      // console.log('resp', resp);
      if (resp?.data === 'refresh') {
        this.filterData();
        dialogRef.close();
      }
    });
  }
  closeTicket(data: any) {
    const modelRef = this.modalService.open(GenericTimesheetConfirmationComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = 'Are you sure you want to close this ticket?';
    modelRef.componentInstance.message = `Confirmation`;
    modelRef.componentInstance.buttonName = `Yes`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        let dataToSend = {
          "status": 4,
          'employee_id': this.user_id,
          'issue': data?.issue,
        }
        this.api.updateData(`${environment.live_url}/${environment.it_ticket}/${data?.id}/`, dataToSend).subscribe((resp: any) => {
          this.api.showSuccess(resp.message);
          this.filterData();
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }

  closeRequest(data: any) {
     const modelRef = this.modalService.open(GenericTimesheetConfirmationComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = 'Are you sure you want to close this ticket?';
    modelRef.componentInstance.message = `Confirmation`;
    modelRef.componentInstance.buttonName = `Yes`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        let dataToSend = {
          "status": 2,
          'employee_id': this.user_id,
          'issue': data?.issue,
        }
        this.api.updateData(`${environment.live_url}/${environment.it_ticket}/${data?.id}/`, dataToSend).subscribe((resp: any) => {
          this.api.showSuccess(resp.message);
          this.filterData();
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }
  approveTicket(data: any) {
    const modelRef = this.modalService.open(GenericTimesheetConfirmationComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = 'Are you sure you want to approve this ticket?';
    modelRef.componentInstance.message = `Confirmation`;
    modelRef.componentInstance.buttonName = `Yes`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        let dataToSend = {
          "status": 4,
          'employee_id': this.user_id,
          'issue': data?.issue,
        }
        this.api.updateData(`${environment.live_url}/${environment.it_ticket}/${data?.id}/`, dataToSend).subscribe((resp: any) => {
          this.api.showSuccess(resp.message);
          this.filterData();
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }

  rejectTicket(data: any) {

  }

  shouldShowButton(item: any): boolean {
    return item.status_display !== 'Closed';
  }

  getActions(item: any): string[] {
    const actions: string[] = [];

    const isAdmin = this.userRole === 'admin';
    const isAccountant = this.userRole === 'accountant';
    const isManager = this.userRole === 'manager';
    const isIT = this.departmentName?.toLowerCase() === 'it department';

    // 👇 key condition
    const isAccountantLike = isAccountant || (isManager && item.logged_data);

    if (item.status_display === 'Closed') {
      return actions;
    }

    if (item.status_display === 'Open') {
      // Admin or Accountant-like (NOT IT) → Close
      if ((isAdmin || isAccountantLike) && !isIT) {
        actions.push('close');
      }

      // IT users (not admin/accountant-like) → Close Request
      if (isIT) {
        actions.push('closeRequest');
      }
    }

    if (item.status_display === 'Close Request sent') {
      if (isAccountantLike && !isIT) {
        actions.push('approve', 'reject');
      }
    }

    return actions;
  }
  // getActions(item: any): string[] {
  //   const actions: string[] = [];

  //   const isAdmin = this.userRole === 'admin';
  //   const isAccountant = this.userRole === 'accountant';
  //   const isManager = this.userRole === 'manager';
  //   const isIT = this.departmentName?.toLowerCase() === 'it';
  //    const isAccountantLike = isAccountant || (isManager && item.logged_data);
  //   if (item.status_display === 'Closed') {
  //     return actions;
  //   }
  //   if (item.status_display === 'Open') {
  //     // Admin or Accountant (NOT IT) → Close
  //     if ((isAdmin || isAccountant) && !isIT) {
  //       actions.push('close');
  //     }
  //     // IT users (not admin/accountant) → Close Request
  //     if (!isAdmin && !isAccountant && isIT) {
  //       actions.push('closeRequest');
  //     }
  //   }

  //   if (item.status_display === 'Close Request sent') {
  //     if (isAccountant && !isIT) {
  //       actions.push('approve', 'reject');
  //     }
  //   }
  //   return actions;
  // }
  public getEmployees() {
    let queryparams = `?is_active=True&employee=True`;
    this.allEmployeeNames = [];
    this.api.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      if (respData && respData.length >= 1) {
        this.allEmployeeNames = respData.map((emp: any) => ({ id: emp.user_id, name: emp.user__full_name }));
      }
    }, (error => {
      this.api.showError(error?.error?.detail)
    }));
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
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
      this.page = 1
    }
    this.searchSubject.next(value);
    // this.term = event.target.value?.trim();
    // if (this.term && this.term.length >= 2) {
    //   this.page = 1;
    //   this.filterData();
    // }
    // else if (!this.term) {
    //   this.filterData();
    // }
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    const employeeParam = this.userRole === 'admin' ? '' : `&employee_id=${this.user_id}`;
    return `${base}${searchParam}${employeeParam}`;
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

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map(x => x.id).join(',');
  }
  filterData() {
    this.filterQuery = this.getFilterBaseUrl()
    this.filterQuery += this.userRole === 'manager' ? '&show_team=true' : '';
    if (this.filters.it_ticketstatus.length) {
      this.filterQuery += `&status=[${this.ids(this.filters.it_ticketstatus)}]`;
    }
    if (this.filters.employees.length) {
      // this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` :
      this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    }
    if (this.raisedDateRange.start && this.raisedDateRange.end) {
      this.filterQuery += `&ticket_raised_start-date=${this.raisedDateRange.start}&ticket_raised_end-date=${this.raisedDateRange.end}`;
    }
    if (this.directionValue && this.sortValue) {
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    if (this.statusDateRange.start && this.statusDateRange.end) {
      this.filterQuery += `&status_start-date=${this.statusDateRange.start}&status_end-date=${this.statusDateRange.end}`;
    }
    this.api.getData(`${environment.live_url}/${environment.it_ticket}/${this.filterQuery}`).subscribe(
      (res: any) => {
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
        this.allTickets = (res.results || []).map((ticket: any) => {
          return Number(ticket?.employee_id) === Number(this.user_id)
            ? { ...ticket, logged_data: true }
            : ticket
        });
        this.filteredList = this.allTickets;
      }, (error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }


  onRaisedDateStartChange(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.raisedDateRange.start = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
  }

  onRaisedDateEndChange(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.raisedDateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  onStatusDateStartChange(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDateRange.start = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
  }

  onStatusDateEndChange(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  clearDateFilter(type: string) {
    if (type === 'status') {
      this.statusDateRange = { start: '', end: '' };
      this.statusDate = null;
    } else if (type === 'raised_date') {
      this.raisedDateRange = { start: '', end: '' };
      this.raisedDate = null;
    }
    this.filterData();
  }

  allocationStartDate(event: any): void {
    // console.log(event)
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.start = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    // this.filterData()
  }
  allocationEndDate(event: any): void {
    // console.log(event)
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }

  // clearDateFilter() {
  //   this.dateRange.start = '';
  //   this.dateRange.end = ''
  //   this.filterData()
  // }

  getEmployeeName(employees: any): string {
    const employee = employees.find((emp: any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }
  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  fetchEmployees = (page: number, search: string) => {
    const extraParams = {
      is_active: 'True',
      employee: 'True',
      // ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
    };
    if (this.userRole === 'manager') {
      extraParams['reporting_manager_id'] = this.user_id;
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };
  fetchJobStatus = (page: number, search: string) => {
    return this.dropdownService.fetchDropdownData$(
      environment.settings_job_status,
      page,
      search,
      (item) => ({ id: item.id, name: item.status_name }),
    );
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
}

