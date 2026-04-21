import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewWfhRequestComponent } from '../view-wfh-request/view-wfh-request.component';
import { ViewLeaveRequestComponent } from '../../leave/view-leave-request/view-leave-request.component';
import { ApplyWorkFromHomeComponent } from '../apply-work-from-home/apply-work-from-home.component';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';

export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-wfh-requests',
  templateUrl: './wfh-requests.component.html',
  styleUrls: ['./wfh-requests.component.scss'],
  standalone: false,
})
export class WfhRequestsComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  leaveOptions: any = [];
  selectedPeriod: any;
  mainStartDate: any;
  mainEndDate: any;
  leave_request: any = [];
  leaveStatus: any = [];
  periodValues: any = [];
  filterQuery: any;
  arrowState: { [key: string]: boolean } = {
    employee__full_name: false,
    leave_type__leave_type_name: false,
    from_date: false,
    number_of_leaves_applying_for: false,
    created_datetime: false,
    status: false,
  };

  searchLeave: any;
  user_id: any;
  userRole: any;
  accessPermissions: any = [];
  canCreateWfh = false;
  canApplyForWfh = false;
  canViewWfh = false;
  canUpdateWfh = false;
  canDeleteWfh = false;
  showManagementApprovalColumn = false;
  BreadCrumbsTitle: any = 'WFH Request';
  constructor(
    private accessControlService: SubModuleService,
    private dialog: MatDialog,
    private modalService: NgbModal,
    private apiService: ApiserviceService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private dropdownService: DropDownPaginationService,
    private common_service: CommonServiceService,
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.getLeaveStatus();
    this.getPeriodData();
    this.getallLeaveTypes();
    this.getleaverequest();
    this.getModuleAccess();
  }

  filters: {
    leave_type: IdNamePair[];
    employees: IdNamePair[];
    status_name: IdNamePair[];
  } = {
    leave_type: [],
    employees: [],
    status_name: [],
  };
  getLeaveStatus() {
    this.apiService
      .getData(`${environment.live_url}/${environment.leave_status}/`)
      .subscribe(
        (res: any) => {
          this.leaveStatus = res?.data?.map((item: any) => ({
            id: item.key,
            name: item.value,
          }));
        },
        (error: any) => {
          console.log(error);
        },
      );
  }
  getPeriodData() {
    this.apiService
      .getData(`${environment.live_url}/${environment.period_values}/`)
      .subscribe(
        (res: any) => {
          this.periodValues = res?.data;
        },
        (error: any) => {
          console.log(error);
        },
      );
  }

  viewDetails(data: any) {
    // let emails = [];
    // try {
    //   emails = JSON.parse(data.cc); // now it's an array
    // } catch {
    //   emails = []; // fallback
    // }
    // let emailString = emails.join(', ');
    // data['emailString'] = emailString;
    const dialogRef = this.dialog.open(ViewWfhRequestComponent, {
      height: '500px',
      width: '50%',
      data: { data: data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getleaverequest();
    });
  }

  getallLeaveTypes() {
    this.apiService
      .getData(`${environment.live_url}/${environment.settings_leave_type}/`)
      .subscribe(
        (respData: any) => {
          this.leaveOptions = respData?.map((item: any) => ({
            id: item.id,
            name: item.leave_type_name,
          }));
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        },
      );
  }

  getModuleAccess() {
    this.accessControlService
      .getAccessForActiveUrl(this.user_id)
      .subscribe((access: any) => {
        if (access?.length) {
          this.accessPermissions = access[0].operations || access[0];
          const ops = Array.isArray(this.accessPermissions)
            ? this.accessPermissions[0]
            : this.accessPermissions;

          if (this.userRole === 'Admin') {
            this.canCreateWfh = false;
            this.canApplyForWfh = false;
            this.canViewWfh = true;
            this.canUpdateWfh = false;
            this.canDeleteWfh = false;
            this.showManagementApprovalColumn = true;
          } else {
            this.canCreateWfh = !!ops?.create;
            this.canApplyForWfh = !!ops?.create;
            this.canViewWfh = !!ops?.view;
            this.canUpdateWfh = !!ops?.update;
            this.canDeleteWfh = !!ops?.delete;
            this.showManagementApprovalColumn =
              this.userRole === 'Director' && !!ops?.update;
          }
        } else {
          console.log('No matching access found.');
        }
      });
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  getWfhDisplayStatus(item: any): string {
    if (
      item?.wfh_type_name === 'prolonged_health_issue' &&
      item?.status === 'Approved' &&
      item?.is_confirmed_by_director === false
    ) {
      return 'Pending';
    }
    return item?.status;
  }

  isWfhStatusPending(item: any): boolean {
    return this.getWfhDisplayStatus(item) === 'Pending';
  }

  isWfhStatusApproved(item: any): boolean {
    return this.getWfhDisplayStatus(item) === 'Approved';
  }

  isWfhStatusRejected(item: any): boolean {
    return this.getWfhDisplayStatus(item) === 'Rejected';
  }

  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach((key) => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getleaverequest();
  }

  public filteredLeaveTypes() {
    if (!this.searchLeave) {
      return this.leaveOptions;
    }
    return this.leaveOptions.filter((leave: any) =>
      leave?.label?.toLowerCase()?.includes(this.searchLeave?.toLowerCase()),
    );
  }

  public clearSearch(key: any, i?: any) {
    if (key === 'leave_type') {
      this.searchLeave = '';
    }
  }

  selectAll = false;
  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    console.log(event);
    if (event.value === 'custom') {
      console.log('period is selected');
    }
    this.getleaverequest();
  }
  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getleaverequest();
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getleaverequest();
  }

  selectedPeriodFunc(event: any) {
    console.log(this.selectedPeriod);
    this.mainStartDate = '';
    this.mainEndDate = '';
    if (this.selectedPeriod != 'custom') {
      this.getleaverequest();
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
      this.getleaverequest();
    }
  }

  viewLeaveRequest(item: any) {
    this.dialog.open(ViewLeaveRequestComponent, {
      data: { item_id: item?.id },
      panelClass: 'custom-details-dialog',
      disableClose: true,
    });
    this.dialog.afterAllClosed.subscribe((resp: any) => {
      // console.log('resp',resp);
      //  this.initalCall();
    });
  }

  openleaveForm() {
    const dialogRef = this.dialog.open(ApplyWorkFromHomeComponent, {
      // data: { item_id: item?.id },
      panelClass: 'leave-or-compoff-form-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      console.log('resp', resp);
      if (resp.data === 'refresh') {
        this.getleaverequest();
      }
    });
    this.cdr.detectChanges();
  }

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map((x) => x.id).join(',');
  }

  getleaverequest() {
    this.count = 0;
    this.filterQuery = this.getFilterBaseUrl();
    if (this.userRole === 'Manager' && !this.filters.employees.length) {
      this.filterQuery += `&employee_id=${this.user_id}`;
    }
    if (this.userRole === 'Accountant') {
      this.filterQuery += `&employee_id=${this.user_id}`;
    }
    if (this.filters.leave_type.length) {
      this.filterQuery += `&leave_type_ids=[${this.ids(this.filters.leave_type)}]`;
    }
    if (this.filters.employees.length) {
      this.filterQuery += `&leave_employee_ids=[${this.ids(this.filters.employees)}]`;
    }
    if (this.filters.status_name.length) {
      this.filterQuery += `&status_values=[${this.ids(this.filters.status_name)}]`;
    }
    if (this.selectedPeriod) {
      this.filterQuery += `&leave_period=${this.selectedPeriod}`;
    }
    if (this.mainStartDate && this.mainEndDate) {
      let start_date = this.datePipe.transform(
        this.mainStartDate,
        'yyyy-MM-dd',
      );
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery += `&leave-start-date=${start_date}&leave-end-date=${end_date}`;
    }

    if (this.directionValue && this.sortValue) {
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.apiService
      .getData(
        `${environment.live_url}/${environment.apply_wfh}/${this.filterQuery}`,
      )
      .subscribe((res: any) => {
        if (res.results) {
          this.leave_request = res.results;
          const noOfPages: number = res?.['total_pages'];
          this.count = noOfPages * this.tableSize;
          this.page = res?.['current_page'];
        }
      });
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;

    return `${base}`;
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
    };
    if (this.userRole === 'Manager') {
      extraParams['reporting_manager_id'] = this.user_id;
    }
    if (this.userRole === 'Accountant') {
      extraParams['employee_id'] = this.user_id;
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item: any) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams,
    );
  };

  reset() {
    this.page = 1;
    this.tableSize = 50;
    this.selectedPeriod = '';
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.filters = { leave_type: [], employees: [], status_name: [] };
    this.getleaverequest();
  }

  isOwnRequest(item: any): boolean {
    return (
      String(item?.employee) === String(this.user_id) ||
      String(item?.employee_id) === String(this.user_id)
    );
  }

  editWfhRequest(item: any) {
    const dialogRef = this.dialog.open(ApplyWorkFromHomeComponent, {
      data: { mode: 'edit', id: item.id },
      panelClass: 'leave-or-compoff-form-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      if (resp?.data === 'refresh') {
        this.getleaverequest();
      }
    });
    this.cdr.detectChanges();
  }

  deleteWfhRequest(item: any) {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: 'sm' as any,
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.status.subscribe((resp: any) => {
      if (resp === 'ok') {
        this.apiService
          .delete(`${environment.live_url}/${environment.apply_wfh}/?id=${item.id}`)
          .subscribe(
            (res: any) => {
              this.apiService.showSuccess(res?.message || 'WFH request deleted successfully');
              this.getleaverequest();
            },
            (error: any) => {
              this.apiService.showError(error?.error?.detail || error?.error?.message || 'Delete failed');
            },
          );
        modelRef.close();
      } else {
        modelRef.close();
      }
    });
  }

  cancelWfhRequest(item: any) {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: 'sm' as any,
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = 'Cancel WFH Request';
    modelRef.componentInstance.message = 'Cancel';
    modelRef.componentInstance.status.subscribe((resp: any) => {
      if (resp === 'ok') {
        this.apiService
          .patchData(`${environment.live_url}/${environment.apply_wfh}/?id=${item.id}`, { status: 'Cancelled' })
          .subscribe(
            (res: any) => {
              this.apiService.showSuccess(res?.message || 'WFH request cancelled successfully');
              this.getleaverequest();
            },
            (error: any) => {
              this.apiService.showError(error?.error?.detail || error?.error?.message || 'Cancel failed');
            },
          );
        modelRef.close();
      } else {
        modelRef.close();
      }
    });
  }

  formatCategoryName(name: string): string {
    if (!name) return '';

    return name
      .replace(/_/g, ' ') // underscores → spaces
      .toLowerCase() // all lowercase
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
  }



  activeTab: 'mine' | 'team' = 'mine';

get myRequests(): any[] {
  return (this.leave_request || []).filter((item: any) => this.isOwnRequest(item));
}

get teamRequests(): any[] {
  return (this.leave_request || []).filter((item: any) => !this.isOwnRequest(item));
}

get showTeamTab(): boolean {
  return this.userRole === 'Manager' || this.userRole === 'Admin' || this.userRole === 'Director';
}
}
