import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { DatePipe } from '@angular/common';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { WeeklySelectionStrategy } from '../../../shared/weekly-selection-strategy';

@Component({
  selector: 'app-all-timesheets',
  templateUrl: './all-timesheets.component.html',
  styleUrls: ['./all-timesheets.component.scss'],
  providers: [
    DatePipe,
    WeeklySelectionStrategy,
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useExisting: WeeklySelectionStrategy
    }
  ]
})
export class AllTimesheetsComponent implements  OnInit {
  selectedDate: Date = new Date();
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
  endDate:any = '';
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  allTimesheetsList: any = [];
  accessPermissions = []
  user_id: any;
  userRole: any;

  constructor(private common_service: CommonServiceService,
    private router: Router, private modalService: NgbModal, private accessControlService: SubModuleService,
    private apiService: ApiserviceService, private datePipe:DatePipe) {
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
    this.getTimesheets();
    this.getWeekData(this.selectedDate);
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

  weekData:any = []
  getWeekData(date:any){
    let currentDate = this.datePipe.transform(date,'yyyy-MM-dd');
    let query =`?timesheet-employee=${this.user_id}&get-cuurent-timesheet-data=True&from-date=${currentDate}`;
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe(
      (res:any)=>{
        console.log('week data',res);
        this.weekData = res.data
      }
    )
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
    let query = this.getFilterBaseUrl()
    query += `&timesheet-employee=${this.user_id}`;
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe(
      (res: any) => {
        this.allTimesheetsList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
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
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&start-date=${this.startDate}&end-date=${this.endDate}`;
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
      console.log('start:', event);
      this.startDate = this.datePipe.transform(event.value,'yyyy-MM-dd');
      this.getTimesheets()
      // console.log('Start:', event.value?.start);
      // console.log('End:', event.value?.end);
    }
  
    startAndEndDateFunction(event: any) {
      console.log('end:', event);
      this.endDate = this.datePipe.transform(event.value,'yyyy-MM-dd')
      this.getTimesheets()
      // console.log('Start:', event.value?.start);
      // console.log('End:', event.value?.end);
    }

    weekDatePicker(event: any){
      console.log('week:', event);
      this.getWeekData(event.value);
    }
}
