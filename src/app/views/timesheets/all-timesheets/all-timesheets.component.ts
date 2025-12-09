import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericTimesheetConfirmationComponent } from '../../../generic-components/generic-timesheet-confirmation/generic-timesheet-confirmation.component';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, Observable, Subject } from 'rxjs';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { FilterStateService } from '../../../service/filter-state.service';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-all-timesheets',
  templateUrl: './all-timesheets.component.html',
  styleUrls: ['./all-timesheets.component.scss'],

})
export class AllTimesheetsComponent implements OnInit {
   @ViewChild('clientFilter') clientFilter!: GenericTableFilterComponent;
   @ViewChild('employeeFilter') employeeFilter!: GenericTableFilterComponent;
   @ViewChild('jobNameFilter') jobNameFilter!: GenericTableFilterComponent;
//    fetchEmployees!: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;
// fetchClients!: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;
// fetchJobs!: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;
  selectedDate: any;
  selectedWeek: any = null;
  BreadCrumbsTitle: any = 'Timesheets';
  term: any = '';
  private searchSubject = new Subject<string>();
  isCurrent: boolean = true;
  isHistory: boolean = false;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    employee_name: false,
    client_name: false,
    job_name: false,
    task_nmae: false,
    notes: false,
  };
  startDate: any = '';
  endDate: any = '';
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  allTimesheetsList: any = [];
  idsOfTimesheet: any = [];
  accessPermissions = []
  user_id: any;
  userRole: any;
  filters: { client_name: IdNamePair[], job_name: IdNamePair[], employee_name: IdNamePair[], task_nmae: IdNamePair[] } = {
    client_name: [],
    job_name: [],
    employee_name: [],
    task_nmae: [],
  }
  allClientNames: IdNamePair[] = [];
  allJobsNames: IdNamePair[] = [];
  allEmployeeNames: IdNamePair[] = [];
  allTaskNames: IdNamePair[] = [];
  dateFilterValue: any = null;
  resetWeekDate: boolean = false;
  datepicker: any;
  filterQuery: string;
  initalTimesheetList: any = [];
  timesheetDate: string | null;
  total_working_hours: any;
  total_excepted_hours: any;
  shortfall: any;
  state:any = {
    filters: {},
    pageIndex: 0,
    pageSize: 0,
    directionValue: '',
    sortValue: '',
    startDate:'',
    endDate:'',
    search: '',
    globalWeekDate:'',
    timesheetDate:'',
    tableDateFilter:'',
    selectedWeek:''
  };
  constructor(
    private common_service: CommonServiceService,
    private router: Router,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    private apiService: ApiserviceService,
    private datePipe: DatePipe,
    private dropdownService:DropDownPaginationService,
   private filterState: FilterStateService,) {
    this.common_service.setTitle(this.BreadCrumbsTitle)

    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    const startDate = this.getStartOfCurrentWeek();
    const endDate = this.getEndOfCurrentWeek();
    this.startDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    this.endDate = this.datePipe.transform(endDate, 'yyyy-MM-dd');
  }

   ngOnInit() {
    this.getModuleAccess();
    this.searchSubject.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((term: string) => term === '' || term.length >= 2)
      ).subscribe((search: string) => {
        this.term = search
        this.filterData();
      });
    // this.getEmployees();
    // this.getAllActiveClients();
    // this.getAllUserbasedActiveJobsList();
    this.getTaskList();
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
        this.startDate = this.state.allocStartDate;
        this.endDate = this.state.allocEndDate;
        this.selectedDate = this.state.globalWeekDate,
        this.timesheetDate = this.state.timesheetDate,
        this.dateFilterValue= this.state.tableDateFilter,
        this.selectedWeek = saved.selectedWeek;
        Object.keys(this.arrowState).forEach(key => {
        this.arrowState[key] = false;
        });
        this.arrowState[this.state.sortValue] = this.state.directionValue === 'ascending' ? true : false;
         this.filters = this.state.filters;
      } 
    if (this.userRole != 'Admin') {
      this.getWeekData();
    } else {
      this.startDate = '';
      this.endDate = '';
      // this.getTimesheets();
      this.filterData();
    }
  }
  
  isTodayFriday(): boolean {
    const storeDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
    const today = new Date();
    const isSameWeek = this.isDateInCurrentWeek(storeDate);
    const isPastWeek = storeDate < this.getStartOfCurrentWeek();
    const isFuture = storeDate > this.getEndOfCurrentWeek();
    const isFriday = today.getDay() === 5;
    const hasData = this.allTimesheetsList && this.allTimesheetsList.length > 0;

    if (this.weekTimesheetSubmitted) {
      return true;
    }
    // 1. Current week and today is Friday, and has data => enable (return false)
    if (isSameWeek && isFriday && hasData) {
      return false;
    }

    // 2. Past week and has data => enable
    if (isPastWeek && hasData) {
      return false;
    }

    // 3. Past or future week and no data => disable
    if ((isPastWeek || isFuture) && !hasData) {
      return true;
    }

    // 4. Future week with data => disable
    if (isFuture && hasData) {
      return true;
    }

    // Default: disable
    return true;
  }
  getStartOfCurrentWeek(): Date {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  getEndOfCurrentWeek(): Date {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  isDateInCurrentWeek(date: Date): boolean {
    const start = this.getStartOfCurrentWeek();
    const end = this.getEndOfCurrentWeek();
    return date >= start && date <= end;
  }

  public getAllActiveClients() {
    let query: any
    if (this.userRole === 'Admin') {
      query = '?status=True'
    } else {
      query = `?status=True&employee-id=${this.user_id}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
      (res: any) => {
        this.allClientNames = res?.map((client: any) => ({
          id: client.id, name: client.client_name
        }));
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  getTaskList() {
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/?get-tasks=True`).subscribe((res: any) => {
      if (res) {
        this.allTaskNames = res?.map((item: any) => ({
          id: item.id,
          name: item.value
        }));
      }
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  public getEmployees() {
    let queryparams = `?is_active=True&employee=True`;
    this.allEmployeeNames = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      if (respData && respData.length >= 1) {
        this.allEmployeeNames = respData.map((emp: any) => ({ id: emp.user_id, name: emp.user__full_name }));
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  // getAllUserbasedActiveJobsList() {
  // let query = `?status=True`;
  // query +=this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
  // this.allJobsNames=[];
  //     this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
  //       if(res && res.length>=1){
  //       this.allJobsNames = res?.map(((jobs:any) => ({ id: jobs.id, name: jobs.job_name })));
  //       }
  //       }, (error => {
  //       this.apiService.showError(error?.error?.detail)
  //     }));
  //   }


  fetchJobs = (page: number, search: string) => {
     const extraParams = {
      status: 'True'
     }
    return this.dropdownService.fetchDropdownData$(
      environment.only_jobs,
      page,
      search,
      (item) => ({ id: item.id, name: item.job_name }),
      extraParams
    );
  };

    fetchClients = (page: number, search: string) => {
        const extraParams = {
        status: 'True'
      }
      console.log(search, extraParams,'client funcion')
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
    ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
  };
    return  this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };
  
  
  onClientFilterOpened() {
    if (this.clientFilter) {
      this.clientFilter.onMenuOpened();
    }
  }
  onEmployeeFilterOpened(){
    if (this.employeeFilter) {
      this.employeeFilter.onMenuOpened();
    }
  }
  onJobsFilterOpened(){
    if (this.jobNameFilter) {
      this.jobNameFilter.onMenuOpened();
    }
  }
  // GenericTableFilterComponent -> fetchClients (input) -> DropDownPaginationService -> API
  


// private _fetchEmployees(page: number, search: string) {
//   const extraParams = {
//     is_active: 'True',
//     employee: 'True',
//     ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
//   };
//   return this.dropdownService.fetchDropdownData$(
//     environment.employee,
//     page,
//     search,
//     (item) => ({ id: item.user_id, name: item.user__full_name }),
//     extraParams
//   );
// }

// private _fetchClients(page: number, search: string) {
//   const extraParams = {
//     status: 'True'
//   };
//   return this.dropdownService.fetchDropdownData$(
//     environment.clients,
//     page,
//     search,
//     (item) => ({ id: item.id, name: item.client_name }),
//     extraParams
//   );
// }

// private _fetchJobs(page: number, search: string) {
//   const extraParams = {
//     status: 'True'
//   };
//   return this.dropdownService.fetchDropdownData$(
//     environment.jobs,
//     page,
//     search,
//     (item) => ({ id: item.id, name: item.job_name }),
//     extraParams
//   );
// }









  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
      } else {
        console.log('No matching access found.');
      }
    });
  }

  weekData: any = []
  getWeekData() {
    let currentDate: any
    let query: any;
    if (this.selectedDate) {
      currentDate = this.datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      query = `?timesheet-employee=${this.user_id}&get-cuurent-timesheet-data=True&from-date=${currentDate}`;
    } else {
      query = `?timesheet-employee=${this.user_id}&get-cuurent-timesheet-data=True`
    }
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe(
      async (res: any) => {
        // console.log('week data',res);
        // this.selectedDate = this.convertBackendDateToStandard(res.data[0].date)
        // console.log(this.selectedDate)
        this.weekData = res.data;
        if (res.data.length > 0) {
          this.startDate = res.data[0].date;
          this.endDate = res.data[res.data.length - 1].date;
        }
        // this.getTimesheets();
        this.filterData();
        this.checkTimesheetSubmission();
      }
    )

  }

  weekTimesheetSubmitted: boolean = false
  checkTimesheetSubmission() {
    let query = `?employee-id=${this.user_id}&from-date=${this.startDate}&to-date=${this.endDate}`
    this.apiService.getData(`${environment.live_url}/${environment.submit_weekly_timesheet}/${query}`).subscribe(
      (res: any) => {
        // console.log('timesheet submission', res)
        this.weekTimesheetSubmitted = res.is_timesheet_submitted
      },
      (error: any) => {
        console.log(error)
      }
    )
  }


  convertBackendDateToStandard(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.toString();
  }

  public openCreateEmployeePage() {
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/timesheets/create-timesheet']);

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
          this.router.navigate(['/timesheets/update-timesheet', this.selectedItemId]);

        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  public getTimesheets() {
    let query = this.getFilterBaseUrl();
    query += `&start-date=${this.startDate}&end-date=${this.endDate}`; 
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe(
      (res: any) => {
        this.allTimesheetsList = res?.results;
        this.total_working_hours = res?.total_time_spent;
        this.total_excepted_hours = res?.total_working_hours;
        this.shortfall = res?.shortfall;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
  public getTimesheetsIDs() {
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/?timesheet-employee=${this.user_id}&start-date=${this.startDate}&end-date=${this.endDate}`).subscribe(
      (res: any) => {
        // this.allTimesheetsList = res;
        if (res.length > 0) {
          this.idsOfTimesheet = [];
          res?.forEach((element: any) => {
            // console.log('element',element.id);
            this.idsOfTimesheet.push(element.id)
          })
        }
        // const noOfPages: number = res?.['total_pages']
        // this.count = noOfPages * this.tableSize;
        // this.count = res?.['total_no_of_record']
        // this.page = res?.['current_page'];
        // this.allClientNames = this.getUniqueValues(client => ({ id: client.client_id, name: client.client_name }));
        // this.allJobsNames =  this.getUniqueValues(jobs => ({ id: jobs.job_id, name: jobs.job_name }));
        // this.allEmployeeNames =  this.getUniqueValues(emps => ({ id: emps.employee_id, name: emps.employee_name }));
        // this.allTaskNames = this.getUniqueValues(tasks => ({ id: tasks.task, name: tasks.task_name }));
      }
    )
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.filterData();
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.filterData();

  }
  public filterSearch(event: any) {
    const value = event?.target?.value || '';
    if (value && value.length >= 2) {
      this.page = 1
    }
    this.searchSubject.next(value);
    // this.term = event.target.value?.trim();
    // if (this.term && this.term.length >= 2) {
    //   this.page = 1;
    //   this.filterData();
    // }
    // else if (!this.term) {
    //   this.filterData();
    // }
  }

  public getFilterBaseUrl(): string {
     const base = `?page=${this.page}&page_size=${this.tableSize}`;
     const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
     const employeeParam = this.userRole !== 'Admin' ? `&timesheet-employee=${this.user_id}` : '';
     return `${base}${searchParam}${employeeParam}`;
    //  if (this.userRole === 'Admin') {
    //   let query = `?page=${this.page}&page_size=${this.tableSize}`;
    //   if (this.term) {
    //     query += `&search=${this.term}`;
    //   }
    //   return query;
    // } else {
    //   let query = `?page=${this.page}&page_size=${this.tableSize}`;
    //   if (this.term) {
    //     query += `&search=${this.term}`;
    //   }
    //   return `?timesheet-employee=${this.user_id}&page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
    // }
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.filterData();
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  delete(id: any) {
    if (id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.deleteContent(id);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(id: any) {
    this.apiService.delete(`${environment.live_url}/${environment.vlp_timesheets}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allTimesheetsList = []
        this.apiService.showSuccess(data.message)
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.filterData();
      }

    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  startDatePicker(event: any) {
    // console.log('start:', event);
    this.startDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    this.filterData();
  }

  startAndEndDateFunction(event: any) {
    // console.log('end:', event);
    this.endDate = this.datePipe.transform(event.value, 'yyyy-MM-dd')
    this.filterData();
  }

  weekDatePicker(event: any) {
    // console.log('week:', event);
    this.selectedDate = event.start_date;
    this.selectedWeek = event;
    // this.startDate = this.datePipe.transform(event.start_date, 'yyyy-MM-dd');
    // this.endDate = this.datePipe.transform(event.end_date, 'yyyy-MM-dd');
    // console.log('this.selectedDate',this.selectedDate)
    this.getWeekData();
    // this.getTimesheets();
  }

  submitWeekTimesheet() {
    const modelRef = this.modalService.open(GenericTimesheetConfirmationComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = `Are you sure you want to submit`;
    modelRef.componentInstance.message = `Confirmation`;
    modelRef.componentInstance.buttonName = `Submit`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        let data = {
          "employee_id": this.user_id,
          "timesheet_ids": this.idsOfTimesheet,
          "from_date": this.startDate,
          "to_date": this.endDate
        }

        this.apiService.postData(`${environment.live_url}/${environment.submit_weekly_timesheet}/`, data).subscribe(
          (res: any) => {
            // console.log(res)
            this.apiService.showSuccess(res.detail);
            // this.startDate='';
            // this.endDate = '';
            // this.selectedDate = '';
            // this.resetWeekDate = true
            this.getWeekData();
          },
          (error) => {
            console.log(error);
            this.apiService.showError(error)
          }
        )
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })

  }
  unlockTimesheet(data: any) {
    const modelRef = this.modalService.open(GenericTimesheetConfirmationComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = `Are you sure you want to unlock`;
    modelRef.componentInstance.message = `Confirmation`;
    modelRef.componentInstance.buttonName = `Yes`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        let putData = {
          "timesheet-id": data.id,
          "unlock": true
        }
        this.apiService.updateData(`${environment.live_url}/${environment.submit_weekly_timesheet}/`, putData).subscribe(
          (res: any) => {
            // console.log(res)
            this.apiService.showSuccess(res.detail);
            // this.getTimesheets()
            this.filterData();
          },
          (error) => {
            this.apiService.showError(error.error)
          }
        )
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })

  }

  // Filter related


  clearDateFilter() {
    this.timesheetDate = null;
    this.dateFilterValue = null;
    this.datepicker = null;
    // this.startDate = '';
    // this.endDate = '';
    this.filterData();
  }
  onDateSelected(event: any): void {
    const selectedDate = event.value;
    if (selectedDate) {
      this.timesheetDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData();
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.filterData();
  }
  saveState() {
    this.state = {
      pageIndex : this.page,
      pageSize : this.tableSize,
      search : this.term,
      directionValue : this.directionValue,
      sortValue : this.sortValue,
      startDate:this.startDate,
      endDate: this.endDate,
      globalWeekDate: this.selectedDate,
      timesheetDate: this.timesheetDate,
      tableDateFilter:this.dateFilterValue,
      filters: this.filters,
      selectedWeek: this.selectedWeek
    }
    this.filterState.saveState(this.state);
  }

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map(x => x.id).join(',');
  }
  filterData() {
    if(this.userRole!='Admin'){
      this.saveState();
    }
    let filterQuery = this.getFilterBaseUrl()
    // console.log(filterQuery)
    if (this.filters.client_name.length) {
      filterQuery += `&client-ids=[${this.ids(this.filters.client_name)}]`;
    }

    if (this.filters.job_name.length) {
      filterQuery += `&job-ids=[${this.ids(this.filters.job_name)}]`;
    }
    if (this.filters.employee_name.length) {
      // this.userRole === 'Accountant' ? filterQuery += `&timesheet-employee-ids=[${this.filters.employee_name.join(',')}]` :
        filterQuery += `&timesheet-employee-ids=[${this.ids(this.filters.employee_name)}]`;
    }
    if (this.filters.task_nmae.length) {
      filterQuery += `&timesheet-task-ids=[${this.ids(this.filters.task_nmae)}]`;
    }
     if(this.directionValue && this.sortValue){
      filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    if (this.userRole === 'Admin') {
      if (this.startDate && this.endDate) {
        filterQuery += `&start-date=${this.startDate}&end-date=${this.endDate}`;
      }
    }
    if (this.userRole !== 'Admin') {
      if (this.timesheetDate) {
        filterQuery += `&timesheet-dates=[${this.timesheetDate}]`;
      }
      if(this.startDate && this.endDate){
         filterQuery += `&start-date=${this.startDate}&end-date=${this.endDate}`; 
      }
    }
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${filterQuery}`).subscribe(
      (res: any) => {
        // this.allTimesheetsList = res?.results;
        // this.count = res?.['total_no_of_record'];
        // this.page = res?.['current_page'];

        this.allTimesheetsList = res?.results;
        this.total_working_hours = res?.total_time_spent;
        this.total_excepted_hours = res?.total_working_hours;
        this.shortfall = res?.shortfall;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
          // this.fetchEmployees = this._fetchEmployees.bind(this);
          // this.fetchClients = this._fetchClients.bind(this);
          // this.fetchJobs = this._fetchJobs.bind(this);
      });
  }
  onDateChange(event: any) {
    this.startDate = '';
    this.dateFilterValue = event.value;
    this.startDate = this.datePipe.transform(this.dateFilterValue, 'yyyy-MM-dd');
  }
  onEndDateChange(event: any) {
    this.endDate = '';
    this.endDate = event.value;
    this.endDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    if (this.startDate && this.endDate) {
      this.filterData();
    }

  }

  private timeToMinutes(time: string): number {
    if (!time) {
      return 0;
    }

    const match = time.match(/^(\d+):(\d{2})$/);
    if (!match) {
      return 0;
    }

    const [, hoursStr, minutesStr] = match;
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes >= 60) {
      return 0;
    }

    return hours * 60 + minutes;
  }



  isShortFall(total_working_hour: string, excepted_hours: string): boolean {
    return this.timeToMinutes(total_working_hour) < this.timeToMinutes(excepted_hours);
  }
  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

}
