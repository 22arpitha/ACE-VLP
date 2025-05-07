import { Component, Input, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-jobs-of-endclient',
  templateUrl: './jobs-of-endclient.component.html',
  styleUrls: ['./jobs-of-endclient.component.scss']
})
export class JobsOfEndclientComponent implements OnInit {
  endClientData: any;
  BreadCrumbsTitle: any
  allJobs = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    job_number: false,
    job_name: false,
    employee_name: false,
    status: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  client_id:any;
  end_client_id:any
  filters: {employees:string[];status:string[] } = {
    employees:[],
    status:[]
  };
  allEmployeeNames: IdNamePair[] = [];
  allStatusNames: IdNamePair[] = [];
  dateFilterValue: any = null;
  filteredList:any = [];
    initialList:any = [];
    datepicker:any;
    filterQuery: string;
    jobList:any = [];
    jobAllocationDate: string | null;
    statusDate: any;
    user_id:any;
    userRole:any;
  constructor( private datePipe: DatePipe,private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
    private api: ApiserviceService,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
     this.endClientData = this.activateRoute.snapshot.paramMap.get('end-client-name');
     this.client_id = this.activateRoute.snapshot.paramMap.get('client-id')
     this.end_client_id = this.activateRoute.snapshot.paramMap.get('id')
     this.BreadCrumbsTitle = this.endClientData + ' - Jobs';
     this.common_service.setTitle(this.BreadCrumbsTitle);
     this.getJobsOfEndClient(`?page=${1}&page_size=${5}&end-client=${this.end_client_id}`);
  }

  async ngOnInit(): Promise<void> {
    await this.getFilteredList();
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  public getFilteredList(){
    let query =`?&end-client=${this.end_client_id}`;
    query +=this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
    this.api.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe(
      (res: any) => {
        this.initialList = res;
        this.allEmployeeNames = this.getUniqueValues(job => {
          const emp = job.employees?.find((e: any) => e.is_primary);
          return { id: emp?.employee || '', name: emp?.employee_name || '' };
        });
        this.allStatusNames = this.getUniqueValues(job => ({ id: job.job_status, name: job.job_status_name }));

      },(error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }

  getJobsOfEndClient(params: any) {
      this.api.getData(`${environment.live_url}/${environment.jobs}/${params}`).subscribe(
        (res: any) => {
          this.allJobs = res.results;
          this.filteredList = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
        },(error: any) => {
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
      const base = `?page=${this.page}&page_size=${this.tableSize}`;
      const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';
      const endClientParam = `&end-client=${this.end_client_id}`;
      const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

      return `${base}${searchParam}${endClientParam}${employeeParam}`;
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


    backToEndClients(id){
      this.common_service.setClientActiveTabindex(id);
      this.router.navigate([`/client/update-client/${this.client_id}`])
    }
    getUniqueValues(
      extractor: (item: any) => { id: any; name: string }
    ): { id: any; name: string }[] {
      const seen = new Map();
  
      this.initialList.forEach(job => {
        const value = extractor(job);
        if (value && value.id && !seen.has(value.id)) {
          seen.set(value.id, value.name);
        }
      });
  
      return Array.from(seen, ([id, name]) => ({ id, name }));
    }

    filterData() {
      this.filterQuery = this.getFilterBaseUrl()
      if (this.filters.status.length) {
        this.filterQuery += `&job-type-ids=[${this.filters.status.join(',')}]`;
      }
      if (this.filters.employees.length) {
        this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` :
        this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` ;
      }
      
      if (this.jobAllocationDate) {
        this.filterQuery += `&job-allocation-date=[${this.jobAllocationDate}]`;
      }
      if (this.statusDate) {
        this.filterQuery += `&job-status-date=[${this.statusDate}]`;
      }
      this.api.getData(`${environment.live_url}/${environment.jobs}/${this.filterQuery}`).subscribe(
        (res: any) => {
          this.allJobs = res.results;
          this.filteredList = res?.results;
          this.count = res?.['total_no_of_record'];
          this.page = res?.['current_page'];  
        },(error: any) => {
          this.api.showError(error?.error?.detail);
        });
    }
  

    setDateFilterColumn(event){
      const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
    }
    onDateSelected(event: any): void {
      const selectedDate = event.value;
      if (selectedDate) {
       this.jobAllocationDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
      }
      this.filterData()
    }
    clearDateFilter(){
      this.jobAllocationDate = null;
      this.dateFilterValue = null;
      this.statusDate = null;
      this.datepicker = null;
      this.filterData()
    }
    clearStatusDateFilter(){
      this.statusDate = null;
      this.dateFilterValue = null;
      this.datepicker = null;
      this.filterData()
    }

}
