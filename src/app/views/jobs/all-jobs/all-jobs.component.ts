import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { SortPipe } from '../../../shared/sort/sort.pipe';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-all-jobs',
  templateUrl: './all-jobs.component.html',
  styleUrls: ['./all-jobs.component.scss']
})


export class AllJobsComponent implements OnInit {
  jobStatusForm: FormGroup
  BreadCrumbsTitle: any = 'Jobs';
  term: any = '';
  isCurrent: boolean = true;
  isHistory: boolean = false;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    job_number: false,
    job_name: false,
    job_type_name: false,
    client_name: false,
    is_active: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  allJobsList: any = [];
  allJobStatus: any = [];
  accessPermissions = []
  user_id: any;
  userRole: any;
  allEmployeelist:any=[];
  allManagerlist:any=[];
  dateFilterValue: any = null;
  filters: { job_type_name: string[]; client_name: string[];employees:string[];manager:string[] } = {
    job_type_name: [],
    client_name: [],
    employees:[],
    manager:[]
  };


  allClientNames: IdNamePair[] = [];
  allJobTypeNames: IdNamePair[] = [];
  allManagerNames: IdNamePair[] = [];
  allEmployeeNames: IdNamePair[] = [];
  filteredList = [];
  datepicker:any;
  filterQuery: string;
  jobList:any = [];
  jobAllocationDate: string | null;
  statusDate: any;
  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private router: Router,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private apiService: ApiserviceService,
    private fb: FormBuilder,
    private datePipe: DatePipe) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name')?.toLowerCase();
     this.common_service.jobStatus$.subscribe((status:boolean)=>{
      if(status){
         this.getJobsHistoryList();
      }else{
        this.getCurrentJobsList();
      }
    })
  }

  async ngOnInit() {

    this.getModuleAccess();
    this.getAllEmployeeList();
    this.getAllActiveManagerList();
    // this.getCurrentJobsList();
    this.getJobStatusList();
    this.initialForm();



    await this.getJobsFilterList();
  }
  access_name:any ;

  // getUniqueValues(field: string):any {
  //   return [...new Set(this.allJobsList.map(job => job[field]).filter(Boolean))];
  // }
  getUniqueValues(
    extractor: (item: any) => { id: any; name: string }
  ): { id: any; name: string }[] {
    const seen = new Map();
    console.log(this.jobList,"jobList");
    this.jobList?.forEach(job => {
      const value = extractor(job);
      if (value && value.id && !seen.has(value.id)) {
        seen.set(value.id, value.name);
      }
    });

    return Array.from(seen, ([id, name]) => ({ id, name }));
  }

  applyClientFilter() {
    this.filterData();
  }
  applyJobTypeFilter() {
    this.filterData();
  }

  // filterData() {
  //   console.log(this.filters.job_type_name)
  //   this.filteredList = this.allJobsList.filter(job => {
  //     const jobTypeName = job?.job_type_name?.trim();
  //     const clientName = job?.client_name?.trim();
  //     const employeeName = job?.employees?.find((e: any) => e?.is_primary)?.employee_name?.trim();
  //     const managerName = job?.employees?.find((e: any) => e?.is_primary)?.manager_name?.trim();

  //     const jobTypeMatch = !this.filters.job_type_name.length || this.filters.job_type_name.includes(jobTypeName);
  //     const clientMatch = !this.filters.client_name.length || this.filters.client_name.includes(clientName);
  //     const employeeMatch = !this.filters.employees.length || this.filters.employees.includes(employeeName);
  //     const managerMatch = !this.filters.manager.length || this.filters.manager.includes(managerName);

  //     return jobTypeMatch && clientMatch && employeeMatch && managerMatch;
  //   });

  //   this.count = this.filteredList.length;
  // }
  filterData() {
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.client_name.length) {
      this.filterQuery += `&client-ids=[${this.filters.client_name.join(',')}]`;
    }

    if (this.filters.job_type_name.length) {
      this.filterQuery += `&job-type-ids=[${this.filters.job_type_name.join(',')}]`;
    }

    if (this.filters.employees.length || this.filters.manager.length) {
      this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]&em_designation=70` :
      this.userRole === 'manager' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]&em_designation=69`:
      this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` ;
    }


    if (this.jobAllocationDate) {
      this.filterQuery += `&job-allocation-date=[${this.jobAllocationDate}]`;
    }
    if (this.statusDate) {
      this.filterQuery += `&job-status-date=[${this.statusDate}]`;
    }
    if(this.isCurrent){
      this.filterQuery += `&status=True`;
    }
    else{
      this.filterQuery += `&status=False`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${this.filterQuery}`).subscribe((res: any) => {
      this.allJobsList = res?.results;
      this.filteredList = res?.results;
      this.count = res?.['total_no_of_record'];
      this.page = res?.['current_page'];


    });
  }



  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name=access[0]
        this.accessPermissions = access[0].operations;
      } else {
      //  console.log('No matching access found.');
      }
    });
  }

  getJobStatusList() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        // console.log(resData);
        resData.forEach((element:any)=>{
          element['valueChanged']=false
        })
        this.allJobStatus = resData;
      }
    )
  }

  getAllEmployeeList(){
    this.allEmployeelist =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
    this.allEmployeelist = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  getAllActiveManagerList(){
    this.allManagerlist =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True&designation=manager`).subscribe((respData: any) => {
    this.allManagerlist = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.filterData();
  }
  initialForm() {
    this.jobStatusForm = this.fb.group({
      status_name: [''],
      percentage: []
    })
  }
  openCreateClientPage() {
     sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/jobs/create-job']);

  }
  async edit(item: any) {
    this.selectedItemId = item?.id;
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          modalRef.dismiss();
           sessionStorage.setItem('access-name', this.access_name?.name)
          this.router.navigate(['/jobs/update-job', this.selectedItemId]);

        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
    //  console.error('Error opening modal:', error);
    }
  }
   getCurrentJobsList() {
    this.isHistory = false;
    this.isCurrent = true;
    let query = `${this.getFilterBaseUrl()}&status=True`;

    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
      this.allJobsList = res?.results;
      this.filteredList = res?.results;
      this.count = res?.['total_no_of_record'];
      this.page = res?.['current_page'];

    });
  }

  getJobsFilterList() {
    // this.isCurrent = false;
    // this.isHistory = true;
    // let query = `${this.getFilterBaseUrl()}`;

    this.apiService.getData(`${environment.live_url}/${environment.jobs}/?status=True`).subscribe(
      (res: any) => {
        this.jobList = res;
        this.allClientNames = this.getUniqueValues(job => ({ id: job.client, name: job.client_name }));
        this.allJobTypeNames = this.getUniqueValues(job => ({ id: job.job_type, name: job.job_type_name }));
        this.allEmployeeNames = this.getUniqueValues(job => {
          const emp = job.employees?.find((e: any) => e.is_primary);
          return { id: emp?.employee || '', name: emp?.employee_name || '' };
        });

        this.allManagerNames = this.getUniqueValues(job => {
          const mgr = job.employees?.find((e: any) => e.is_primary);
          return { id: mgr?.manager || '', name: mgr?.manager_name || '' };
        });

      }
    )
  }
   getJobsHistoryList() {
    this.isCurrent = false;
    this.isHistory = true;
    let query = `${this.getFilterBaseUrl()}&status=False`;

    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe(
      (res: any) => {
        this.allJobsList = res?.results;
        this.filteredList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      }
    )
  }
  getCurrentJobs() {
    this.page = 1;
    this.tableSize = 5;
    this.getCurrentJobsList();
  }
  getJobsHistory() {
    this.page = 1;
    this.tableSize = 5;
    this.getJobsHistoryList();
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
       this.filterData()
      // if (this.isCurrent) {
      //   this.getCurrentJobsList()
      // } else {
      //   this.getJobsHistoryList();
      // }
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    // if (this.isCurrent) {
    //   this.getCurrentJobsList()
    // } else {
    //   this.getJobsHistoryList();
    // }
     this.filterData();
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      // if (this.isCurrent) {
      //   this.getCurrentJobsList()
      // } else {
      //   this.getJobsHistoryList();
      // }
      this.filterData()
    }
    else if (!this.term) {
      if (this.isCurrent) {
        this.getCurrentJobsList()
      } else {
        this.getJobsHistoryList();
      }
    }
  }

  getFilterBaseUrl(): string {
  if(this.userRole === 'admin'){
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
  }else {
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&employee-id=${this.user_id}`;
  }
  }

  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  changedStatusName:any
  onStatusChange(item: any, event: any) {
    const selectedStatusId = event.value;
    const selectedStatus = this.allJobStatus.find(status => status.id == selectedStatusId);
    // console.log(selectedStatus)
    this.changedStatusName = selectedStatus.status_name
    if (selectedStatus) {
      item.job_status = event.value;
      item.percentage_of_completion = selectedStatus.percentage_of_completion;
      item.isInvalid = false;
      // item.valueChanged = true;
    }

    this.saveJobStausPercentage(item)

  }
  validateKeyPress(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
    }
  }

  validatePercentage(item: any) {
    const percentage = item.percentage_of_completion; // Ensure you use the correct key
    if (percentage === null || percentage === undefined || percentage === '') {
      item.isInvalid = true;
      item.errorType = 'required';
    } else if (!/^(100|[1-9]?\d?)$/.test(percentage.toString())) {
      item.isInvalid = true;
      item.errorType = 'pattern';
    } else if (Number(percentage) > 100) {
      item.isInvalid = true;
      item.errorType = 'max';
    } else if (Number(percentage) < 1) {
      item.isInvalid = true;
      item.errorType = 'min';
    } else {
      item.isInvalid = false;
      item.valueChanged = true;
      item.errorType = null; // Clear errors when valid
    }
  }


  saveJobStausPercentage(item: any) {
    if(!item.isInvalid){
      if(!this.changedStatusName){
        this.changedStatusName = item.job_status_name
      }
      let temp_status=this.changedStatusName.toLowerCase();
      let formData:any= {'job_status':item?.job_status,'percentage_of_completion':item.percentage_of_completion,
        status: (temp_status === 'cancelled' || temp_status === 'completed') ? false : true
      }
      this.apiService.updateData(`${environment.live_url}/${environment.jobs_percetage}/${item.id}/`,formData).subscribe((respData: any) => {
        if (respData) {
          this.apiService.showSuccess(respData['message']);
          let status = this.changedStatusName.toLowerCase();
          if(status==='completed' || status==='cancelled'){
            this.getJobsHistoryList();
          } else{
            this.getCurrentJobsList()
            // if (this.isCurrent) {
            //   this.getCurrentJobsList()
            // } else {
            //   this.getJobsHistoryList();
            // }
          }
    }},(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }
  }
  getEmployeeName(employees: any): string {
    const employee = employees.find((emp:any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }

  getManagerName(employees: any): string {
    const manager = employees.find((man:any) => man?.is_primary === true);
    return manager ? manager?.manager_name : '';
  }

  downloadOption(type:any){
  let status:any
    if(this.isCurrent){
      status = 'True';
    }
    else{
      status = 'False';
    }
    let query = `?page=${this.page}&page_size=${this.tableSize}&file-type=${type}&is-active=${status}`
    let apiUrl = `${environment.live_url}/${environment.job_details}/${query}`;
    fetch(apiUrl)
    .then(res => res.blob())
    .then(blob => {
      //console.log('blob',blob);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `job_details.${type}`;
      a.click();
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

}
