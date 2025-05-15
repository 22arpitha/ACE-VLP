import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-jobs-of-clients',
  templateUrl: './jobs-of-clients.component.html',
  styleUrls: ['./jobs-of-clients.component.scss']
})
export class JobsOfClientsComponent implements OnInit {
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
    tableSize = 50;
    tableSizes = [50,75,100];
    currentIndex: any;
    term: any = '';
    client_id:any;
    filters: {employees:string[];status:string[] } = {
      employees:[],
      status:[]
    };
    allEmployeeNames: IdNamePair[] = [];
    allStatusNames: IdNamePair[] = [];
    dateFilterValue: any = null;
    filteredList:any = [];
    datepicker:any;
    filterQuery: string;
    jobList:any = [];
    jobAllocationDate: string | null;
    statusDate: any;
    user_id:any;
    userRole:any;
    constructor(private datePipe: DatePipe,private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
      private api: ApiserviceService,
    ) {
      this.user_id = sessionStorage.getItem('user_id');
      this.userRole = sessionStorage.getItem('user_role_name');
       this.client_id = this.activateRoute.snapshot.paramMap.get('id');
       this.getJobsOfClient(`?page=${1}&page_size=${5}&client=${this.client_id}`);
    }
  
    ngOnInit(){
      this.getEmployees();
      this.getAllJobStatus();
    }
  

    public getAllJobStatus() {
    this.allStatusNames = [];
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((respData: any) => {
    if(respData && respData.length>=1){
  this.allStatusNames = respData.map((status:any) => ({ id: status.id, name: status.status_name }));
    }
    }, (error: any) => {
      this.api.showError(error.detail);

    });
  }

   public getEmployees() {
    let queryparams = `?is_active=True&employee=True`;
    this.allEmployeeNames = [];
    this.api.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      if(respData && respData.length>=1){
      this.allEmployeeNames = respData.map((emp:any) => ({ id: emp.user_id, name: emp.user__full_name }));
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
      this.arrowState[column] = direction === 'asc' ? true : false;
      this.directionValue = direction;
      this.sortValue = column;
    }
    getJobsOfClient(params: any) {
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
        const clientParam = `&client=${this.client_id}`;
        const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

        return `${base}${searchParam}${clientParam}${employeeParam}`;
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

      filterData() {
        this.filterQuery = this.getFilterBaseUrl()
        if (this.filters.status.length) {
          this.filterQuery += `&job-status-ids=[${this.filters.status.join(',')}]`;
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
      onStatusDateSelected(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
     this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
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
    getEmployeeName(employees: any): string {
    const employee = employees.find((emp:any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }
}
