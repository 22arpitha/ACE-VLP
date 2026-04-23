import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from './../../../service/apiservice.service';
import { SubModuleService } from './../../../service/sub-module.service';
import { AddCompoffRequestComponent } from '../add-compoff-request/add-compoff-request.component';
import { environment } from '../../../../environments/environment';
import { CompOffGrantComponent } from '../comp-off-grant/comp-off-grant.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';

export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-compensatory-request',
  templateUrl: './compensatory-request.component.html',
  styleUrls: ['./compensatory-request.component.scss']
})
export class CompensatoryRequestComponent implements OnInit {
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  @ViewChild('leaveStatusFilter') leaveStatusFilter!: GenericTableFilterComponent;
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  accessPermissions = [];
  user_id: any;
  userRole: any;
   leaveStatus :any = [];
  arrowState: { [key: string]: boolean } = {
    employee__full_name: false,
    reporting_to__full_name: false,
    from_date: false,
    to_date: false,
    credited: false,
    number_of_leaves_applying_for: false,
    balance: false,
    message: false,
  };
  searchLeave: any
  filterQuery: string;
  compOffLists: any = []
  constructor(private accessControlService: SubModuleService,
    modalService: NgbModal, private dialog: MatDialog,private dropdownService: DropDownPaginationService,
    private apiService: ApiserviceService,) {
    this.user_id = Number(sessionStorage.getItem('user_id'));
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.getLeaveStatus();
    // this.getAllCompOffData();
  }
  filters: {status_name: IdNamePair[],employees:IdNamePair[] } = {
    status_name: [],
    employees:[],
  }

  getLeaveStatus(){
    this.apiService.getData(`${environment.live_url}/${environment.leave_status}/`).subscribe(
      (res: any) => {
        this.leaveStatus = res?.data?.map((item: any) => ({
          id: item.key,
          name: item.value
        }));
        const pendingStatus = this.leaveStatus.find((x: any) => x.name === 'Pending');
        if (pendingStatus) {
          this.filters.status_name = [pendingStatus];
          setTimeout(() => {
            if (this.leaveStatusFilter) {
              this.leaveStatusFilter.selectedOptions  = [pendingStatus];
            }
          });
        }
        this.getAllCompOffData();
      },
      (error:any) => {
        console.log(error)
      }
    )
  }

  leaveOptions = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'casual', label: 'Casual Leave' },
    { value: 'comp_off', label: 'Comp Off' }
  ];

  dataOptions = [
    { value: 'all', label: 'All' },
    { value: 'current', label: 'Current' },
    { value: 'expired', label: 'Expired' }
  ];

 


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
    this.getAllCompOffData();
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    console.log(this.filters)
    this.getAllCompOffData();
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

  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  selectedData() {

  }
  selectedRequest() {

  }

  selectAll = false;
  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getAllCompOffData()
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getAllCompOffData();
  }

   private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map(x => x.id).join(',');
  }

  getAllCompOffData() {
    this.count = 0;
    this.filterQuery = this.getFilterBaseUrl()
    if (this.userRole === 'Manager') {
      this.filterQuery += `&manager_id=${this.user_id}`
    }
    if (this.filters.status_name.length) {
      this.filterQuery += `&status_values=[${this.ids(this.filters.status_name)}]`;
    }
    if (this.filters.employees.length) {
      this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.comp_off_grant}/${this.filterQuery}`).subscribe(
      (res: any) => {
        this.compOffLists = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        // this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      },
      (error) => {
        console.log(error)
      }
    )
  }

  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    // const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    // const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

    return `${base}`;
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
  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }

  addOrViewRequest(edit: boolean, item: any) {
    sessionStorage.setItem('access-name', this.access_name?.name)
    const isMobile = window.innerWidth <= 425;
    const dialogRef =this.dialog.open(AddCompoffRequestComponent, {
      data: { edit: edit, item_id: item?.id },
      // panelClass: 'comp-offs',
      // width: '40%',
      width: isMobile ? '100%' : '40%',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      if(resp.data==='refresh'){
        this.getAllCompOffData();
      }
    });

  }

  requestRevoke(item: any){
    
  }
  openGrantCompOff() {
    const dialogRef = this.dialog.open(CompOffGrantComponent, {
       data: { employee: true},
       panelClass: 'leave-or-compoff-form-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      if(resp.data==='refresh'){
        this.getAllCompOffData();
      }
    });

  }

  toggleAllSelection() {
    this.compOffLists.forEach((item: any) => item.selected = this.selectAll);
  }


  reset(){
    this.page = 1;
    this.tableSize = 50;
    this.filters.status_name = [];
    this.leaveStatus = []
    this.filters = {status_name: [],employees: []};
    // this.employeeFilter.clearSelection();
    // this.leaveStatusFilter.clearSelection();
    this.getLeaveStatus();
    // this.getAllCompOffData();
  }
}
