import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-compensatory-request',
  templateUrl: './compensatory-request.component.html',
  styleUrls: ['./compensatory-request.component.scss']
})
export class CompensatoryRequestComponent implements OnInit {
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
    reporting_to: false,
    worked_date: false,
    expiry_date: false,
    credited: false,
    taken: false,
    balance: false,
    reason: false,
  };
  searchLeave:any
  constructor() { }

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
      selected: false,
      employee_name: 'Livia Mango',
      reporting_to: 'Cheyenne Korsgaard',
      worked_date: new Date('2025-04-21'),
      expiry_date: new Date('2025-04-21'),
      credited: '1.5 Day(s)',
      taken: '1 Day(s)',
      balance: '1.5 Day(s)',
      reason: 'Worked on Saturday'
    },
    {
      selected: false,
      employee_name: 'Zain Rhiel Madsen',
      reporting_to: 'Leo Ekstrom Bothman',
      worked_date: new Date('2025-04-21'),
      expiry_date: new Date('2025-04-21'),
      credited: '1.5 Day(s)',
      taken: '1 Day(s)',
      balance: '1.5 Day(s)',
      reason: 'Worked on Saturday'
    },
    {
      selected: false,
      employee_name: 'Corey Stanton',
      reporting_to: 'Zaria Korsgaard',
      worked_date: new Date('2025-04-21'),
      expiry_date: new Date('2025-04-21'),
      credited: '1.5 Day(s)',
      taken: '1 Day(s)',
      balance: '1.5 Day(s)',
      reason: 'Worked on Saturday'
    },
    {
      selected: false,
      employee_name: 'Jaylen Torff',
      reporting_to: 'Patryn Korsgaard',
      worked_date: new Date('2025-04-21'),
      expiry_date: new Date('2025-04-21'),
      credited: '1.5 Day(s)',
      taken: '1 Day(s)',
      balance: '1.5 Day(s)',
      reason: 'Worked on Saturday'
    },
    {
      selected: false,
      employee_name: 'Corey Herwitz',
      reporting_to: 'Charlie Geidt',
      worked_date: new Date('2025-04-21'),
      expiry_date: new Date('2025-04-21'),
      credited: '1.5 Day(s)',
      taken: '1 Day(s)',
      balance: '1.5 Day(s)',
      reason: 'Worked on Saturday'
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

  public clearSearch(key: any,i?:any) {
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
}
