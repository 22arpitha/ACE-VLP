import { Component, OnInit } from '@angular/core';
import { AddCustomizeBalanceComponent } from '../add-customize-balance/add-customize-balance.component';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-customize-balance',
  templateUrl: './customize-balance.component.html',
  styleUrls: ['./customize-balance.component.scss']
})
export class CustomizeBalanceComponent implements OnInit {

  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    employee_name: false,
    leave_type: false,
    type: false,
    leave_period: false,
    date_of_request: false,
    days_or_hours_taken: false,
  };
  searchLeave: any;
  accessPermissions = [];
  user_id: any;
  userRole: any;
  constructor(private accessControlService: SubModuleService,
    private dialog: MatDialog,
    private apiService: ApiserviceService,) { }

  ngOnInit(): void {
  }
  filters = {
    leave: '',
    data: '',
    request: ''
  };

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

  requestOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  filteredList = [
    {
      status: 'Pending',
      employee_name: 'Livia Mango',
      casual_leave: '0.5',
      earned_leave: 3,
      maternity_leave: 0,
      paternity_leave: 0,
      sick_leave: 4,
      loss_of_pay: 8
    },
    {
      status: 'Pending',
      employee_name: 'Zain Rhiel Madsen',
      casual_leave: '0.5',
      earned_leave: 3,
      maternity_leave: 0,
      paternity_leave: 0,
      sick_leave: 4,
      loss_of_pay: 8
    },
    {
      status: 'Pending',
      employee_name: 'Corey Stanton',
      casual_leave: '0.5',
      earned_leave: 3,
      maternity_leave: 0,
      paternity_leave: 0,
      sick_leave: 4,
      loss_of_pay: 8
    },
    {
      status: 'Pending',
      employee_name: 'Jaylen Torff',
      casual_leave: '0.5',
      earned_leave: 3,
      maternity_leave: 0,
      paternity_leave: 0,
      sick_leave: 4,
      loss_of_pay: 8
    },
    {
      status: 'Pending',
      employee_name: 'Corey Herwitz',
      leave_type: 'Charlie Geidt',
      casual_leave: '0.5',
      earned_leave: 3,
      maternity_leave: 0,
      paternity_leave: 0,
      sick_leave: 4,
      loss_of_pay: 8
    }
  ];

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

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
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

  onTableDataChange(event: any) {
    // update page here
  }

  onTableSizeChange(event: any) {
    // update table size here
  }

  filterData() {
    // apply filters to your data
  }

  customize() {
    sessionStorage.setItem('access-name', this.access_name?.name)
    //  this.router.navigate(['/invoice/create-invoice']);
    this.dialog.open(AddCustomizeBalanceComponent, {
      data: { edit: false },
      panelClass: 'custom-details-dialog',
      disableClose: true
    });
    this.dialog.afterAllClosed.subscribe((resp: any) => {
      // console.log('resp',resp);
      // this.initalCall();
    });
  }

  toggleAllSelection() {
    this.filteredList.forEach((item: any) => item.selected = this.selectAll);
  }
}
