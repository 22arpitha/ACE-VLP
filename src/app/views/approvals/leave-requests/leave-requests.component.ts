import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.scss']
})
export class LeaveRequestsComponent implements OnInit {
  selectedTabIndex = 0;
  activeStatus = 'pending';
  leaveRequests: any[] = [];
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

  // Sorting
  sortValue = '';
  directionValue = '';
  arrowState: { [key: string]: boolean } = {
    leave_type_id: false,
    from_date: false,
    number_of_leaves_applying_for: false,
    created_datetime: false,
    status: false,
    rejected_reason: false,
  };

  tabs = [
    { label: 'Pending', status: 'pending' },
    { label: 'Approved', status: 'approved' },
    { label: 'Rejected', status: 'rejected' },
  ];

  constructor(private apiService: ApiserviceService, private datePipe: DatePipe) {
    this.userId = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.fetchLeaveRequests();
  }

  onTabChange(event: any): void {
    const index = event.index;
    this.selectedTabIndex = index;
    this.activeStatus = this.tabs[index].status;
    this.page = 1;
    this.tableSize = 50;
    this.leaveRequests = [];
    this.resetSort();
    this.fetchLeaveRequests();
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
      this.fetchLeaveRequests();
    }
  }

  fetchLeaveRequests(): void {
    this.loading = true;
    let url = `${environment.live_url}/${environment.my_leaves}/?page=${this.page}&page_size=${this.tableSize}&status_values=[${this.activeStatus}]`;
    url += this.userRole === 'Admin' ? '' : `&leave_employee_id=${this.userId}`;
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
        this.leaveRequests = res?.results || [];
        const totalPages: number = res?.total_pages || 0;
        this.count = totalPages * this.tableSize;
        this.page = res?.current_page || 1;
        this.loading = false;
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
        this.leaveRequests = [];
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
    this.fetchLeaveRequests();
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
    this.fetchLeaveRequests();
  }

  onTableDataChange(event: any): void {
    this.page = event;
    this.fetchLeaveRequests();
  }

  onTableSizeChange(event: any): void {
    this.page = 1;
    this.tableSize = Number(event.value);
    this.fetchLeaveRequests();
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
