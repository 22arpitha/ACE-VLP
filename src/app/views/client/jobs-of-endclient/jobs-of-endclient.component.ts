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
  tableSize = 50;
  tableSizes = [50,75,100];
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
  statusDateFilterValue: any = null;
  filteredList:any = [];
    datepicker:any;
    filterQuery: string;
    jobList:any = [];
    jobAllocationDate: string | null;
     dateRange = {
      start: '',
      end: ''
    };
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
     if(this.userRole!='Admin'){
     this.getJobsOfEndClient(`?page=${1}&page_size=${50}&end-client=${this.end_client_id}&employee-id=${this.user_id}`);
     } 
     else{
      this.getJobsOfEndClient(`?page=${1}&page_size=${50}&end-client=${this.end_client_id}`)
     }
    }

  ngOnInit(){
      this.getEmployees();
      this.getAllJobStatus();
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

    filterData() {
      this.filterQuery = this.getFilterBaseUrl()
      if (this.filters.status.length) {
        this.filterQuery += `&job-status-ids=[${this.filters.status.join(',')}]`;
      }
      if (this.filters.employees.length) {
        this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` :
        this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` ;
      }
      if (this.dateRange.start && this.dateRange.end) {
      this.filterQuery += `&start-date=${this.dateRange.start}&end-date=${this.dateRange.end}`;
    }
      // if (this.jobAllocationDate) {
      //   this.filterQuery += `&job-allocation-date=[${this.jobAllocationDate}]`;
      // }
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
    onStatusDateSelected(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
     this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }
   
    clearStatusDateFilter(){
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
  }
  allocationEndDate(event: any): void {
    // console.log(event)
    const selectedDate = event.value;
    if (selectedDate) {
     this.dateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }
    clearDateFilter(){
    this.dateRange.start ='';
    this.dateRange.end =''
    this.filterData()
  }

    getEmployeeName(employees: any): string {
    const employee = employees.find((emp:any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }
  dateClass = (date: Date) => {
  return date.getDay() === 0 ? 'sunday-highlight' : '';
};
}
