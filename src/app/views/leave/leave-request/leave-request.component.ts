import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { ViewLeaveRequestComponent } from '../view-leave-request/view-leave-request.component';
import { environment } from 'src/environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LeaveApplyAdminComponent } from '../leave-apply-admin/leave-apply-admin.component';
import { DropDownPaginationService } from 'src/app/service/drop-down-pagination.service';
import { GenericTableFilterComponent } from 'src/app/shared/generic-table-filter/generic-table-filter.component';
import { DatePipe } from '@angular/common';

export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss'],
})
export class LeaveRequestComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  leaveOptions: any = []
  selectedPeriod: any
  mainStartDate: any;
  mainEndDate: any;
  leave_request: any = [];
  leaveStatus: any = [];
  periodValues:any = [];
  filterQuery: any
  arrowState: { [key: string]: boolean } = {
    employee_name: false,
    leave_type: false,
    type: false,
    leave_period: false,
    date_of_request: false,
    days_or_hours_taken: false,
  };
  searchLeave: any;
  user_id: any;
  userRole: any;
  constructor(
    private accessControlService: SubModuleService,
    modalService: NgbModal,
    private dialog: MatDialog,
    private apiService: ApiserviceService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private dropdownService: DropDownPaginationService,
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.getLeaveStatus();
    this.getPeriodData();
    this.getallLeaveTypes();
    this.getleaverequest();
  }

  filters: { leave_type: IdNamePair[], employees: IdNamePair[], status_name: IdNamePair[] } = {
    leave_type: [],
    employees: [],
    status_name: [],
  }
  getLeaveStatus() {
    this.apiService.getData(`${environment.live_url}/${environment.leave_status}/`).subscribe(
      (res: any) => {
        this.leaveStatus = res?.data?.map((item: any) => ({
          id: item.key,
          name: item.value
        }));
      },
      (error) => {
        console.log(error)
      }
    )
  }
  getPeriodData(){
     this.apiService.getData(`${environment.live_url}/${environment.period_values}/`).subscribe(
      (res: any) => {
        this.periodValues = res?.data;
      },
      (error) => {
        console.log(error)
      }
    )
  }


  viewDetails(data: any) {
    let emails = [];
    try {
      emails = JSON.parse(data.cc); // now it's an array
    } catch {
      emails = []; // fallback
    }
    let emailString = emails.join(', ');
    data['emailString'] = emailString;
    const dialogRef = this.dialog.open(ViewLeaveRequestComponent, {
      height: '500px',
      width: '50%',
      data: { data: data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getleaverequest();
    });
  }

  getallLeaveTypes() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/`).subscribe((respData: any) => {
      this.leaveOptions = respData?.map((item: any) => ({
        id: item.id,
        name: item.leave_type_name
      }));
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach((key) => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  public filteredLeaveTypes() {
    if (!this.searchLeave) {
      return this.leaveOptions;
    }
    return this.leaveOptions.filter((leave: any) =>
      leave?.label?.toLowerCase()?.includes(this.searchLeave?.toLowerCase())
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
    console.log(event)
    if (event.value === 'custom') {
      console.log('period is selected')
    }
    this.getleaverequest();
  }
  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getleaverequest()
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getleaverequest();
  }

  selectedPeriodFunc(event) {
    console.log(this.selectedPeriod)
    this.mainStartDate = '';
    this.mainEndDate = '';
    if(this.selectedPeriod!='custom'){
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

  viewLeaveRequest(item) {
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
    const dialogRef = this.dialog.open(LeaveApplyAdminComponent, {
      // data: { item_id: item?.id },
      panelClass: 'custom-details-dialog',
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
  return filterArray.map(x => x.id).join(',');
}

  getleaverequest() {
     this.count = 0;
    this.filterQuery = this.getFilterBaseUrl()
    if (this.userRole === 'Manager') {
      this.filterQuery += `&manager_id=${this.user_id}`
    }
    if (this.filters.leave_type.length) {
      this.filterQuery += `&leave_type_ids=[${this.ids(this.filters.leave_type)}]`
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
    if(this.mainStartDate && this.mainEndDate){
      let start_date = this.datePipe.transform(this.mainStartDate, 'yyyy-MM-dd');
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery +=`&leave-start-date=${start_date}&leave-end-date=${end_date}`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.apply_leaves}/${this.filterQuery}`)
      .subscribe((res: any) => {
        if(res.results){
          this.leave_request = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.page = res?.['current_page'];
        }
      });
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    // const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    // const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
    return `${base}`;
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
  fetchEmployees = (page: number, search: string) => {
    const extraParams:any = {
      is_active: 'True',
      employee: 'True',
    };
    if (this.userRole === 'Manager') {
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


  reset(){
    this.page = 1;
    this.tableSize = 50;
    this.selectedPeriod = '';
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.filters = {leave_type: [],employees: [],status_name: []};
    this.getleaverequest()
  }

}
