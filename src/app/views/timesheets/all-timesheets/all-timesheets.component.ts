import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericTimesheetConfirmationComponent } from 'src/app/generic-components/generic-timesheet-confirmation/generic-timesheet-confirmation.component';
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
  selectedDate: any;
  BreadCrumbsTitle: any = 'Timesheets';
  term: any = '';
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
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  allTimesheetsList: any = [];
  idsOfTimesheet: any = [];
  accessPermissions = []
  user_id: any;
  userRole: any;
  filters: { client_name: string[],job_name: string[],employee_name:string[],task_nmae:string[]} = {
    client_name: [],
    job_name:[],
    employee_name:[],
    task_nmae:[],
  }
  allClientNames:IdNamePair[] = [];
  allJobsNames:IdNamePair[] = [];
  allEmployeeNames:IdNamePair[] = [];
  allTaskNames:IdNamePair[] = [];
  dateFilterValue: any = null;
  constructor(private common_service: CommonServiceService,
    private router: Router, private modalService: NgbModal, private accessControlService: SubModuleService,
    private apiService: ApiserviceService, private datePipe: DatePipe) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    // this.common_service.empolyeeStatus$.subscribe((status: boolean) => {
    //   if (status) {
    //     this.getTimesheets();
    //   } else {
    //     this.getInActiveEmployeeList();
    //   }
    // })
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    if (this.userRole != 'Admin') {
      this.getWeekData();
    } else {
      this.getTimesheets();
    }
  }
  // isTodayFriday(): boolean {
  //   const today = new Date();
  //   return today.getDay() === 5; // 0 = Sunday, 5 = Friday
  // }


  isDateInCurrentWeek(dateToCheck: Date): boolean {
    const today = new Date();
    const currentDay = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const date = new Date(dateToCheck);
    date.setHours(0, 0, 0, 0);

    return date >= startOfWeek && date <= endOfWeek;
  }

  isTodayFriday(): boolean {
    let storeDate: any
    if (this.selectedDate) {
      storeDate = this.selectedDate;
    }
    else {
      storeDate = new Date();
    }
    if (this.allTimesheetsList && this.allTimesheetsList.length > 0) {
      if (!this.weekTimesheetSubmitted) {
        if (this.isDateInCurrentWeek(storeDate)) {
          const isFriday = storeDate.getDay() === 5;
          return !isFriday;
        } else {
          return this.weekTimesheetSubmitted;
        }
      } else {
        return this.weekTimesheetSubmitted;
      }
    } else {
      return true;
    }
  }


  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', access);
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
      (res: any) => {
        // console.log('week data',res);
        // this.selectedDate = this.convertBackendDateToStandard(res.data[0].date)    
        // console.log(this.selectedDate)
        this.weekData = res.data;
        if (res.data.length > 0) {
          this.startDate = res.data[0].date;
          this.endDate = res.data[res.data.length - 1].date;
        }
        this.getTimesheets();
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
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe(
      (res: any) => {
        this.allTimesheetsList = res?.results;
        if (this.allTimesheetsList.length > 0) {
          this.idsOfTimesheet = [];
          res.results.forEach((element: any) => {
            this.idsOfTimesheet.push(element.id)
          })
          // console.log('this.idsOfTimesheet', this.idsOfTimesheet)
        }
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
        this.allClientNames = this.getUniqueValues(client => ({ id: client.client_id, name: client.client_name }));
        this.allJobsNames =  this.getUniqueValues(jobs => ({ id: jobs.job_id, name: jobs.job_name }));
        this.allEmployeeNames =  this.getUniqueValues(emps => ({ id: emps.employee_id, name: emps.employee_name }));
        this.allTaskNames = this.getUniqueValues(tasks => ({ id: tasks.task, name: tasks.task_name }));
      }
    )
  }

  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getTimesheets()
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getTimesheets()

  }
  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.getTimesheets()
    }
    else if (!this.term) {
      this.getTimesheets()
    }
  }

  public getFilterBaseUrl(): string {
    if (this.userRole === 'Admin') {
      return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&start-date=${this.startDate}&end-date=${this.endDate}`;
    } else {
      return `?timesheet-employee=${this.user_id}&page=${this.page}&page_size=${this.tableSize}&search=${this.term}&start-date=${this.startDate}&end-date=${this.endDate}`;
    }
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
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

        this.getTimesheets()
      }

    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  startDatePicker(event: any) {
    // console.log('start:', event);
    this.startDate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    this.getTimesheets()
  }

  startAndEndDateFunction(event: any) {
    // console.log('end:', event);
    this.endDate = this.datePipe.transform(event.value, 'yyyy-MM-dd')
    this.getTimesheets()
  }

  weekDatePicker(event: any) {
    // console.log('week:', event);
    this.selectedDate = event.start_date;
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
            this.apiService.showSuccess(res.detail)
            this.startDate='';
            this.endDate = '';
            this.selectedDate = '';
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
          (res:any)=>{
            // console.log(res)
            this.apiService.showSuccess(res.detail);
            this.getTimesheets()
          },
          (error)=>{
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

  setDateFilterColumn(event){
    const selectedDate = event.value;
  if (selectedDate) {
    const formatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }
  }
  onDateSelected(event: any): void {
    const selectedDate = event.value;

    if (selectedDate) {
      const formatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    // this.filters[filterType] = selectedOptions;
    // this.filterData();
  }

  getUniqueValues(
    extractor: (item: any) => { id: any; name: string }
  ): { id: any; name: string }[] {
    const seen = new Map();

    this.allTimesheetsList.forEach(item => {
      const value = extractor(item);
      if (value && value.id && !seen.has(value.id)) {
        seen.set(value.id, value.name);
      }
    });

    return Array.from(seen, ([id, name]) => ({ id, name }));
  }
}
