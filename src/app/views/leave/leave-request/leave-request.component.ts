import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { ViewLeaveRequestComponent } from '../view-leave-request/view-leave-request.component';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {

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
  searchLeave: any
  constructor(private accessControlService: SubModuleService,
    modalService: NgbModal, private dialog: MatDialog,
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
      id:1,
      status: 'Pending',
      employee_name: 'Livia Mango',
      leave_type: 'Casual',
      type: 'paid',
      leave_period: "21-Apr-2025 - 21-Apr-2025",
      date_of_request: new Date('2025-04-21'),
      days_or_hours_taken: '1 Day(s)',
    },
    {
      id:2,
      status: 'Pending',
      employee_name: 'Zain Rhiel Madsen',
      leave_type: 'Earned',
      type: 'paid',
      leave_period: "21-Apr-2025 - 21-Apr-2025",
      date_of_request: new Date('2025-04-21'),
      days_or_hours_taken: '1 Day(s)',
    },
    {
      id:3,
      status: 'Pending',
      employee_name: 'Corey Stanton',
      leave_type: 'Sick Leave',
      type: 'paid',
      leave_period: "21-Apr-2025 - 21-Apr-2025",
      date_of_request: new Date('2025-04-21'),
      days_or_hours_taken: '1 Day(s)',
    },
    {
      id:4,
      status: 'Pending',
      employee_name: 'Jaylen Torff',
      leave_type: 'Sick Leave',
      type: 'paid',
      leave_period: "21-Apr-2025 - 21-Apr-2025",
      date_of_request: new Date('2025-04-21'),
      days_or_hours_taken: '1 Day(s)',
    },
    {
      id:5,
      status: 'Pending',
      employee_name: 'Corey Herwitz',
      leave_type: 'Charlie Geidt',
      type: 'paid',
      leave_period: "21-Apr-2025 - 21-Apr-2025",
      date_of_request: new Date('2025-04-21'),
      days_or_hours_taken: '1 Day(s)',
    }
  ];

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

  addRequest() {
    // logic to open add request form
  }

  toggleAllSelection() {
    this.filteredList.forEach((item: any) => item.selected = this.selectAll);
  }

  viewLeaveRequest(item) {
    this.dialog.open(ViewLeaveRequestComponent, {
      data: {item_id: item?.id },
      panelClass: 'custom-details-dialog',
      disableClose: true
    });
    this.dialog.afterAllClosed.subscribe((resp: any) => {
      // console.log('resp',resp);
      //  this.initalCall();
    });

  }
}
