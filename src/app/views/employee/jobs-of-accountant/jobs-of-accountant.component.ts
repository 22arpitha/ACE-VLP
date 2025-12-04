import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-jobs-of-accountant',
  templateUrl: './jobs-of-accountant.component.html',
  styleUrls: ['./jobs-of-accountant.component.scss']
})
export class JobsOfAccountantComponent implements OnInit {

  @ViewChild('jobStatusFilter') jobStatusFilter!: GenericTableFilterComponent;
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  BreadCrumbsTitle: any
  allJobs = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    job_number: false,
    job_name: false,
    employee_name: false,
    client_name:false,
    job_status__status_name: false,
  };
  page = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [10, 50, 75, 100];
  currentIndex: any;
  term: any = '';
  client_id: any;
  filters: { employees: IdNamePair[]; status: IdNamePair[] } = {
    employees: [],
    status: []
  };
  allStatusNames: any = [];
  dateFilterValue: any = null;
  statusDateFilterValue: any = null;
  filteredList: any = [];
  datepicker: any;
  filterQuery: string;
  jobList: any = [];
  jobAllocationDate: string | null;
  statusDate: any;
  user_id: any;
  userRole: any;
  dateRange:any = {
    start: '',
    end: ''
  };
  jobSelection: any[] = [];
  constructor(private datePipe: DatePipe, private common_service: CommonServiceService, private activateRoute: ActivatedRoute, private router: Router,
    private api: ApiserviceService, private dropdownService: DropDownPaginationService, public dialogRef: MatDialogRef<JobsOfAccountantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.client_id = this.activateRoute.snapshot.paramMap.get('id');
    this.filterData()
    //  this.getJobsOfAccount(`?page=${1}&page_size=${5}&employee-id=${this.data.employeeId}`);
  }

  ngOnInit() {

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
  getJobsOfAccount(params: any) {
    this.api.getData(`${environment.live_url}/${environment.only_jobs}/${params}`).subscribe(
      (res: any) => {
        this.allJobs = res.results;
        this.filteredList = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }, (error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.filterData();
    }
    else if (!this.term) {
      this.filterData();
    }
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}&employee-id=${this.data.employeeId}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';
    return `${base}${searchParam}`;
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
    if (this.filters.status.length) {
      this.filterQuery += `&job-status-ids=[${this.ids(this.filters.status)}]`;
    }
    if (this.filters.employees.length) {
      // this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` :
        this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    }
    if (this.dateRange.start && this.dateRange.end) {
      this.filterQuery += `&start-date=${this.dateRange.start}&end-date=${this.dateRange.end}`;
    }
    if (this.directionValue && this.sortValue) {
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    // if (this.jobAllocationDate) {
    //   this.filterQuery += `&job-allocation-date=[${this.jobAllocationDate}]`;
    // }
    if (this.statusDate) {
      this.filterQuery += `&job-status-date=[${this.statusDate}]`;
    }
    this.api.getData(`${environment.live_url}/${environment.only_jobs}/${this.filterQuery}`).subscribe(
      (res: any) => {
        this.allJobs = res.results;
        this.filteredList = res?.results;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      }, (error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }


  setDateFilterColumn(event) {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }

  onStatusDateSelected(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }
  clearStatusDateFilter() {
    this.statusDate = null;
    this.statusDateFilterValue = null;
    this.filterData()
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

  clearDateFilter() {
    this.dateRange.start = '';
    this.dateRange.end = ''
    this.filterData()
  }

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
    };
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
      (item) => {
        if (item.status_name === 'Cancelled' || item.status_name === 'Completed') {
          return null;
        }
        return { id: item.id, name: item.status_name }
      }
    ).pipe(
      map((res: any) => {
        return {
          ...res,
          results: res.results.filter((x: any) => x !== null) // remove nulls
        };
      })
    );
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }

  // toggleAllJobs(event: any) {
  //   if (event.checked) {
  //     this.jobSelection = [...this.allJobs];
  //   } else {
  //     this.jobSelection = [];
  //   }
  // }

  //   isAllJobsSelected() {
  //   return this.jobSelection?.length > 0 ? this.jobSelection?.length === this.allJobs?.length : false;
  // }

  // isSomeJobsSelected() {
  //   return this.jobSelection?.length > 0 && !this.isAllJobsSelected();
  // }
  // toggleJobSelection(item: any) {
  //   const index = this.jobSelection?.indexOf(item);
  //   if (index === -1) {
  //     this.jobSelection?.push(item);
  //   } else {
  //     this.jobSelection?.splice(index, 1);
  //   }
  // }

  toggleJobSelection(item: any) {
    const index = this.jobSelection.indexOf(item.id);
    if (index === -1) {
      this.jobSelection.push(item.id);
    } else {
      this.jobSelection.splice(index, 1);
    }
  }

  toggleAllJobs(event: any) {
    const currentPageIds = this.allJobs.map((j:any) => j.id);

    if (event.checked) {
      this.jobSelection = Array.from(new Set([...this.jobSelection, ...currentPageIds]));
    } else {
      this.jobSelection = this.jobSelection.filter(id => !currentPageIds.includes(id));
    }
  }

  isAllJobsSelected() {
    return this.allJobs.length > 0 &&
      this.allJobs.every(j => this.jobSelection.includes(j.id));
  }

  isSomeJobsSelected() {
    return this.allJobs.some(j => this.jobSelection.includes(j.id)) &&
      !this.isAllJobsSelected();
  }


  transferJobs() {
    console.log(this.jobSelection)
    if(this.jobSelection.length===0){
      this.api.showError('Please select any jobs for transfering')
    } else{
      const data = this.jobSelection
     this.dialogRef.close(data)
      
    }
  }

}
