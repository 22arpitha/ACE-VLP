import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, forkJoin, map, Subject } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { FilterStateService } from '../../../service/filter-state.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpClient } from '@angular/common/http';

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
  //  @ViewChildren(GenericTableFilterComponent) allFilters!: QueryList<GenericTableFilterComponent>;
  @ViewChild('clientFilter') clientFilter!: GenericTableFilterComponent;
  @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
  @ViewChild('jobTypeFilter') jobTypeFilter!: GenericTableFilterComponent;
  @ViewChild('groupClientFilter') groupClientFilter!: GenericTableFilterComponent;
  @ViewChild('managerFilter') managerFilter!: GenericTableFilterComponent;
  @ViewChild('satusGroupFilter') satusGroupFilter!: GenericTableFilterComponent;
  jobStatusForm: FormGroup
  BreadCrumbsTitle: any = 'Jobs';
  term: any = '';
  isCurrent: boolean = true;
  isHistory: boolean = false;
  isUnassigned:boolean = false
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    group_name: false,
    job_number: false,
    job_name: false,
    job_type__job_type_name: false,
    client__client_name: false,
    is_active: false,
    primary_employee_name:false,
    job_status__status_name:false
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  sortColumn:string;
  sortType:string;
  currentIndex: any;
  allJobsList: any = [];
  internalReviewOneIndex: any
  allJobStatus: any = [];
  groupList: any = []
  accessPermissions = []
  user_id: any;
  userRole: any;
  allEmployeelist: any = [];
  allManagerlist: any = [];
  dateFilterValue: any = null;
  statusDateFilterValue: any = null;
  statusList: String[] = [];
  filters: { group_name: IdNamePair[]; job_type_name: IdNamePair[]; client_name: IdNamePair[]; employees: IdNamePair[]; manager: IdNamePair[], status_name: IdNamePair[],status_group_name:IdNamePair[] } = {
    group_name: [],
    job_type_name: [],
    client_name: [],
    employees: [],
    manager: [],
    status_name: [],
    status_group_name: [],
  };
private searchSubject = new Subject<string>();

  allClientNames: IdNamePair[] = [];
  allJobTypeNames: IdNamePair[] = [];
  allManagerNames: IdNamePair[] = [];
  allEmployeeNames: IdNamePair[] = [];
  allStatuGroupNames: IdNamePair[] = [];
  allGroupNames: IdNamePair[] = [];
  filteredList = [];
  filterQuery: string;
  jobList: any = [];
  jobAllocationDate: string | null;
  statusDate: any;
  dateRange: any = {
    start: '',
    end: ''
  };

  columns = [
    { key: 'sl_no', label: 'Sl No', visible: true },
    { key: 'job_number', label: 'Job Id', visible: true },
    { key: 'job_name', label: 'Job', visible: true },
    { key: 'job_type_name', label: 'Job Type', visible: true },
    { key: 'client_name', label: 'Client', visible: true },
    { key: 'group_name', label: 'Group', visible: false },
    { key: 'job_allocation_date', label: 'Allocated On', visible: false },
    { key: 'employees', label: 'Employees', visible: true },
    { key: 'manager', label: 'Manager', visible: true },
    { key: 'status_name', label: 'Status', visible: true },
    { key: 'percentage_of_completion', label: 'Percentage Of Completion', visible: true },
    { key: 'job_status_date', label: 'Status Date', visible: true },
    { key: 'tat_days', label: 'Tat Days', visible: true },
  ];

  state:any = {
  filters: {},
  pageIndex: 0,
  pageSize: 0,
  directionValue: '',
  sortValue: '',
  search: '',
  current:false,
  history:false,
  unassigned:false,
  jobStatusDate:''
};
  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private router: Router,
    private apiService: ApiserviceService,
    private fb: FormBuilder,
    private dropdownService: DropDownPaginationService,
    private filterState: FilterStateService,
    private datePipe: DatePipe) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.loadInitialData();
  }

  ngOnInit() {
    this.searchSubject.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          filter((term: string) => term === '' || term.length >= 2)
        ).subscribe((search: string) => {
          this.term = search
          this.filterData();
        });
  }
  access_name: any;

  loadInitialData() {
    let query = `?status=True`;
    let manager_query = `?is_active=True&employee=True&designation=manager`;
    query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
    this.allJobStatus = [];
    if (this.userRole === 'Manager' || this.userRole === 'Accountant') {
      manager_query = `${this.user_id}/`
    }
    this.allStatuGroupNames = [];
    this.allJobTypeNames = [];
    this.allEmployeelist = [];
    this.allEmployeeNames = [];
    this.allManagerlist = []
    this.allManagerNames = [];
    this.allClientNames = [];
    forkJoin({
      _res_status_group: this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/`),
      _res_job_status: this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`),
      // _res_job_type: this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/`),
      // _res_employees: this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`),
      // _res_Managers: this.apiService.getData(`${environment.live_url}/${environment.employee}/${manager_query}`),
      // _res_clients: this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`),
    }).subscribe((data: any) => {
      if (data._res_status_group && data._res_status_group?.length >= 1) {
        this.groupList = data._res_status_group
      }
      if (data._res_job_status && data._res_job_status?.length >= 1) {
        data._res_job_status.forEach((element: any) => {
          element['valueChanged'] = false
          // console.log(data._res_job_status)
        })
        this.allJobStatus = data._res_job_status;
        this.internalReviewOneIndex = this.allJobStatus.findIndex(status => status?.status_name.toLowerCase() === 'internal review 1');
        this.jobStatusList('True');
      }
      if (data._res_job_type && data._res_job_type?.length >= 1) {
        this.allJobTypeNames = data._res_job_type?.map((item: any) => ({
          id: item.id,
          name: item.job_type_name
        }));
      }
      if (data._res_employees && data._res_employees?.length >= 1) {
        this.allEmployeelist = data._res_employees;
        this.allEmployeeNames = data._res_employees?.map((emp: any) => ({
          id: emp?.user_id,
          name: emp?.user__first_name
        }))
      }
      if (data._res_Managers) {
        this.allManagerlist = data._res_Managers;
        if (this.userRole === 'Manager' || this.userRole === 'Accountant') {
          this.allManagerNames = [{
            id: data._res_Managers?.reporting_manager_id,
            name: data._res_Managers?.reporting_manager_id__first_name
          }]
        } else {
          this.allManagerNames = data._res_Managers?.map((emp: any) => ({
            id: emp?.user_id,
            name: emp?.user__first_name
          }))
        }
      }
      if (data._res_clients && data._res_clients?.length >= 1) {
        this.allClientNames = data._res_clients?.map((item: any) => ({
          id: item.id,
          name: item.client_name
        }));
        let clientIds = this.allClientNames.map((client: any) => client.id);
        if (clientIds && clientIds.length >= 1) {

          this.getAllCientsBaseGroupList(clientIds);
        }
      }
      // this.getCurrentJobs();
      const saved = this.filterState.loadState();
      if (saved) {
        this.state = saved;
        this.page= this.state.pageIndex;
        this.tableSize= this.state.pageSize;
        this.term= this.state.search;
        this.directionValue= this.state.directionValue;
        this.sortValue= this.state.sortValue;
        this.isCurrent= this.state.current;
        this.isHistory= this.state.history;
        this.isUnassigned= this.state.unassigned;
        this.columns = this.state.columns
        this.dateRange.start = this.state.allocStartDate;
        this.dateRange.end = this.state.allocEndDate;
        this.statusDate = this.state.jobStatusDate;
        this.statusDateFilterValue = this.state.jobStatusDate;
        Object.keys(this.arrowState).forEach(key => {
        this.arrowState[key] = false;
        });
        this.arrowState[this.state.sortValue] = this.state.directionValue === 'ascending' ? true : false;
         this.filters = this.state.filters;
      } 
      this.filterData();
    }, (error) => {
      this.apiService.showError(error?.error?.detail)
    });
  }
  //   getClientList(){
  //       let query = `?status=True`;
  //  query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
  //     this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe((res: any) => {
  //       if(res){
  //         this.allClientNames = res?.map((item: any) => ({
  //           id: item.id,
  //           name: item.client_name
  //         }));
  //       }
  //     })
  //     return this.allClientNames;
  //   }
  applyClientFilter() {
    this.filterData();
  }
  applyJobTypeFilter() {
    this.filterData();
  }

  private ids(filterArray: any[]): string {
  if (!Array.isArray(filterArray)) return '';
  return filterArray.map(x => x.id).join(',');
}
  filterData() {
     this.saveState();
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.client_name.length) {
      this.filterQuery += `&client-ids=[${this.ids(this.filters.client_name)}]`;
    }
    if (this.filters.job_type_name.length) {
      // this.filterQuery += `&job-type-ids=[${this.filters.job_type_name.join(',')}]`;
      this.filterQuery += `&job-type-ids=[${this.ids(this.filters.job_type_name)}]`;
    }
    if (this.filters.group_name.length) {
      this.filterQuery += `&group-ids=[${this.ids(this.filters.group_name)}]`;
    }
    if (this.filters.employees.length) {
      // this.userRole === 'accountant' ? this.filterQuery += `&employee-ids=[${this.filters.employees.join(',')}]` :
        this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    }
    if (this.filters.manager.length) {
      this.userRole === 'manager' ? this.filterQuery += `&manager-ids=[${this.ids(this.filters.manager)}]` :
        this.filterQuery += `&manager-ids=[${this.ids(this.filters.manager)}]`;
    }

    if (this.dateRange.start && this.dateRange.end) {
      this.filterQuery += `&start-date=${this.dateRange.start}&end-date=${this.dateRange.end}`;
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    // if (this.jobAllocationDate) {
    //   this.filterQuery += `&job-allocation-date=[${this.jobAllocationDate}]`;
    // }
    if (this.statusDate) {
      this.filterQuery += `&job-status-date=[${this.statusDate}]`;
    }
    if(this.filters.status_group_name.length){
      this.filterQuery += `&status-group-ids=[${this.ids(this.filters.status_group_name)}]`;
    }
    if(this.isUnassigned){
      this.filterQuery += `&unassigned=True`
    }
    if (this.isCurrent && !this.isUnassigned && this.filters.status_name.length == 0) {
      this.jobStatusList('True');
      this.filterQuery += `&job-status=[${this.statusList}]`;
    }
    else if (!this.isCurrent && !this.isUnassigned && this.filters.status_name.length == 0) {
      this.jobStatusList('False');
      this.filterQuery += `&job-status=[${this.statusList}]`;
    } else {
      // this.filterQuery += `&job-status=[${this.filters.status_name.join(',')}]`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.only_jobs}/${this.filterQuery}`).subscribe((res: any) => {
      this.allJobsList = res?.results;
      this.filteredList = res?.results;
      this.count = res?.['total_no_of_record'];
      this.page = res?.['current_page'];
    });
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
      } else {
        //  console.log('No matching access found.');
      }
    });
  }
  
  getAllCientsBaseGroupList(clientIds: any) {
    // console.log('ClientIDs:',clientIds);
    let query = this.userRole === 'Admin' ? '' : `?client-ids=[${clientIds}]`
    this.allGroupNames = [];
    this.apiService.getData(`${environment.live_url}/${environment.clients_group}/${query}`).subscribe((respData: any) => {
      this.allGroupNames = respData?.map((group: any) => ({
        id: group?.id,
        name: group?.group_name
      }))
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  getAllEmployeeList() {
    this.allEmployeelist = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
      this.allEmployeelist = respData;
      this.allEmployeeNames = respData?.map((emp: any) => ({
        id: emp?.user_id,
        name: emp?.user__first_name
      }))
    }, (error => {
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
    this.saveState();
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/jobs/create-job']);

  }
  saveState() {
    this.state = {
      pageIndex : this.page,
      pageSize : this.tableSize,
      search : this.term,
      directionValue : this.directionValue,
      sortValue : this.sortValue,
      current:this.isCurrent,
      history:this.isHistory,
      unassigned:this.isUnassigned,
      jobStatusDate:this.statusDate,
      allocStartDate: this.dateRange.start,
      allocEndDate: this.dateRange.end,
      filters: this.filters,
      columns: this.columns
    }
    this.filterState.saveState(this.state);
  }
  async edit(item: any) {
    this.saveState();
    this.selectedItemId = item?.id;
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/jobs/update-job', this.selectedItemId]);
  }
  getCurrentJobsList() {
    this.allJobsList = [];
    this.filteredList = [];
    this.isHistory = false;
    this.isCurrent = true;
    this.isUnassigned = false;
    this.jobStatusList('True');
    // const joinedStatusList = this.statusList.join(','); // no encoding!
    // let query = `${this.getFilterBaseUrl()}&job-status=${joinedStatusList}`;
    // // let jobStatusParam = encodeURIComponent(JSON.stringify(this.statusList));
    // // let query = `${this.getFilterBaseUrl()}&job-status=${jobStatusParam}`;
    // add this ==> this.statusList.length != 0 ( when you are displaying the job status)

    this.filterData();
    // if (this.allStatuGroupNames.length != 0) {
    //   let query: any = `${this.getFilterBaseUrl()}&job-status=[${this.statusList}]`;
    //   this.apiService.getData(`${environment.live_url}/${environment.only_jobs}/${query}`).subscribe((res: any) => {
    //     this.allJobsList = res?.results;
    //     this.filteredList = res?.results;
    //     const noOfPages: number = res?.['total_pages']
    //     this.count = noOfPages * this.tableSize;
    //     this.count = res?.['total_no_of_record'];
    //     this.page = res?.['current_page'];
    //   });
    // }
  }
  getJobsHistoryList() {
    this.allJobsList = [];
    this.filteredList = [];
    this.isCurrent = false;
    this.isHistory = true;
    this.isUnassigned = false;
    this.jobStatusList('False');
    // console.log('history',this.statusList)
    // this.allStatuGroupNames

    this.filterData();
    // let query = `${this.getFilterBaseUrl()}&job-status=[${this.statusList}]`;
    // this.apiService.getData(`${environment.live_url}/${environment.only_jobs}/${query}`).subscribe(
    //   (res: any) => {
    //     this.allJobsList = res?.results;
    //     this.filteredList = res?.results;
    //     const noOfPages: number = res?.['total_pages']
    //     this.count = noOfPages * this.tableSize;
    //     this.count = res?.['total_no_of_record'];
    //     this.page = res?.['current_page'];
    //   }
    // )
  }
   getUnassignedJobsList() {
    this.allJobsList = [];
    this.filteredList = [];
    this.isHistory = false;
    this.isCurrent = false;
    this.isUnassigned = true;
      let query: any = `${this.getFilterBaseUrl()}&unassigned=True`;
      this.apiService.getData(`${environment.live_url}/${environment.only_jobs}/${query}`).subscribe((res: any) => {
        this.allJobsList = res?.results;
        this.filteredList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      });
    
  }
  getCurrentJobs() {
    this.page = 1;
    this.tableSize = 50;
    this.getCurrentJobsList();
    this.resetFilters();
  }
  getJobsHistory() {
    this.page = 1;
    this.tableSize = 50;
    this.getJobsHistoryList();
    this.resetFilters();
  }

  getUnassignedJobs(){
     this.page = 1;
    this.tableSize = 50;
    this.getUnassignedJobsList();
    // this.resetFilters();
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.state.pageIndex = event;
      this.state.pageSize = Number(event.value);;
      this.filterData()
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.state.pageIndex = event;
    this.filterData();
  }
  filterSearch(event: any) {
      const value = event?.target?.value || '';
    if (value && value.length >= 2) {
      this.page = 1
    }
    this.searchSubject.next(value);
  }

  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

    return `${base}${searchParam}${employeeParam}`;
  }


  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.filterData()
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  changedStatusName: any
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
    } else if (Number(percentage) < 0) {
      item.isInvalid = true;
      item.errorType = 'min';
    } else {
      item.isInvalid = false;
      item.valueChanged = true;
      item.errorType = null; // Clear errors when valid
    }
  }
  saveJobStausPercentage(item: any) {
    if (!item.isInvalid) {
      if (!this.changedStatusName) {
        this.changedStatusName = item.job_status_name
      }
      let temp_status = this.changedStatusName?.toLowerCase();
      let formData: any = {
        'job_status': item?.job_status, 'percentage_of_completion': item.percentage_of_completion,
        status: (temp_status === 'cancelled' || temp_status === 'completed') ? false : true,
        update_by: Number(this.user_id)
      }
      this.apiService.updateData(`${environment.live_url}/${environment.jobs_percetage}/${item.id}/`, formData).subscribe((respData: any) => {
        if (respData) {
          this.apiService.showSuccess(respData['message']);
          this.filterData();
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
    }
  }
  getEmployeeName(employees: any): string {
    if (!employees || employees.length === 0) {
    return '-';
    }
    const employee = employees.find((emp: any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }
  getManagerName(employees: any): string {
    const manager = employees.find((man: any) => man?.is_primary === true);
    return manager ? manager?.manager_name : '';
  }

  removePagination(url: string) {
    const params = new URLSearchParams(url);
    params.delete('page');
    params.delete('page_size');
    return params.toString();  
  }
  downloadOption(type: any) {
    let status: any
    if (this.isCurrent) {
      status = 'True';
      this.jobStatusList(status);
    }
    else {
      status = 'False';
      this.jobStatusList(status);
    }
    let cleanedFilterQuery = this.filterQuery;
    const updated_query = this.removePagination(cleanedFilterQuery)
    let query = `?download=true&file-type=${type}`;
    query += `&${updated_query}`;
    query += this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
    let apiUrl = `${environment.live_url}/${environment.only_jobs}/${query}`;
    window.open(apiUrl, '_blank');
    // const newTab = window.open(apiUrl, '_blank');

    // setTimeout(() => {
    //   try {
    //     newTab?.close();
    //   } catch (err) {
    //     console.error('Could not close tab:', err);
    //   }
    // }, 1000);

  //     this.ngxLoader.stop(); // stop on success
  //   },
  //   error: err => {
  //     console.error(err);
  //     this.ngxLoader.stop(); // stop on error
  //     // show in-panel message if you want
  //   }
  // });
    // let apiUrl = `${environment.live_url}/${environment.only_jobs}/${query}`;
    //  this.ngxLoader.start();
    // fetch(apiUrl)
    //   .then(res => res.blob())
    //   .then(blob => {
    //     const a = document.createElement('a');
    //     a.href = URL.createObjectURL(blob);
    //     a.download = `job-details.${type}`;
    //     a.click();
    //   });
  }

  jobStatusList(status: any) {
    const isActive = status === 'True';
    this.statusList = this.allJobStatus?.filter((jobstatus: any) => isActive
      ? jobstatus?.status_name !== "Cancelled" && jobstatus?.status_name !== "Completed"
      : jobstatus?.status_name === "Cancelled" || jobstatus?.status_name === "Completed")
      .map((status: any) => status?.status_name);
    // this.allStatusNames = this.allJobStatus
    // this.allStatuGroupNames = this.allJobStatus?.filter((status: any) => isActive ? status?.status_name !== "Cancelled" && status?.status_name !== "Completed"
    //   : status?.status_name === "Cancelled" || status?.status_name === "Completed").map((status: any) => ({
    //     id: status?.status_name, name: status?.status_name
    //   }))
    this.allStatuGroupNames = this.groupList?.filter((group: any) => isActive ? group?.group_name !== "Cancelled" && group?.group_name !== "Completed"
      : group?.group_name === "Cancelled" || group?.group_name === "Completed").map((status: any) => ({
        id: status?.group_name, name: status?.group_name
      }))
  }

  setDateFilterColumn(event) {
    const selectedDate = event.value;
    if (selectedDate) {
      this.statusDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
  }

  setDateRangeFilterColumn(event) {
    console.log(event.value)
  }
  allocationStartDate(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.start = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
  }
  allocationEndDate(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.dateRange.end = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
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
  clearDateFilter() {
    this.jobAllocationDate = null;
    this.dateRange.start = '';
    this.dateRange.end = ''
    this.filterData()
  }
  clearStatusDateFilter() {
    this.statusDate = null;
    this.statusDateFilterValue = null;
    this.filterData()
  }

  isColumnVisible(key: string): boolean {
    const col = this.columns.find(c => c.key === key);
    return col ? col.visible : false;
  }
  resetColumns() {
    this.columns.forEach(col => col.visible = true);
  }

  jobStatusValidation(data: any, index: any): boolean {
     if ((data.estimated_time === '00:00' || data.estimated_time === '0:00') && index >= this.internalReviewOneIndex) {
      return true;
    }
    if (this.userRole !== 'Admin') {
      return data.only_admin_can_change_job_status ? true : false;
    }
    return false;
    // below code is matching the flows
    // if (data.estimated_time == '00:00' && index >= this.internalReviewOneIndex) {
    //   return true;
    // }
    // if (this.userRole !== 'Admin') {
    //   if (data.only_admin_can_change_job_status) {
    //     return true;
    //   }
    //   if (!data.only_admin_can_change_job_status && index >= this.internalReviewOneIndex) {
    //     return true;
    //   }
    // } else {
    //   if (index >= this.internalReviewOneIndex) {
    //     return true;
    //   }
    // }

    // return false;
  }
  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };


  fetchJobTypes = (page: number, search: string) => {
    //  const extraParams = {
    //   status: 'True'
    //  }
    return this.dropdownService.fetchDropdownData$(
      environment.settings_job_type,
      page,
      search,
      (item) => ({ id: item.id, name: item.job_type_name }),
      // extraParams
    );
  };

  fetchClients = (page: number, search: string) => {
    // this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`
    const extraParams = {
      status: 'True',
      ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
    }
    return this.dropdownService.fetchDropdownData$(
      environment.all_clients,
      page,
      search,
      (item) => ({ id: item.id, name: item.client_name }),
      extraParams
    );
  };

  fetchEmployees = (page: number, search: string) => {
    const extraParams = {
      is_active: 'True',
      employee: 'True',
      // ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
    };
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

  fetchGroupClients = (page: number, search: string) => {
    const extraParams = {
      ...(this.userRole !== 'Admin' && { 'employee_id': this.user_id })
    }
    return this.dropdownService.fetchDropdownData$(
      environment.clients_group,
      page,
      search,
      (item) => ({ id: item.id, name: item.group_name }),
      extraParams
    );
  };

  fetchManagers = (page: number, search: string) => {
    let extraParams: any = {
      is_active: 'True',
      employee: 'True',
      designation: 'manager'
    };
    if (this.userRole === 'Manager' || this.userRole === 'Accountant') {
      extraParams = { userId: this.user_id };
    }
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

    fetchStatusGroup = (page: number, search: string) => {
  return this.dropdownService.fetchDropdownData$(
    environment.settings_status_group,
    page,
    search,
    (item:any) => {
      // Apply filter: if item should be excluded, return null
      if (this.isCurrent) {
        if (item.group_name === 'Cancelled' || item.group_name === 'Completed') {
          return null;
        }
      } else {
        if (item.group_name !== 'Cancelled' && item.group_name !== 'Completed') {
          return null;
        }
      }

      return { id: item.id, name: item.group_name };
    }
  ).pipe(
    map((res: any) => {
      return {
        ...res,
        results: res.results.filter((x: any) => x !== null) // remove nulls
      };
    })
  );
};


  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }


  resetFilters(): void {
  // clears only status group filter
  this.satusGroupFilter?.clearSelection();
}

}

