import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { SortPipe } from '../../../sort/sort.pipe';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';


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

  constructor(private common_service: CommonServiceService, private accessControlService: SubModuleService,
    private router: Router, private modalService: NgbModal, private dialog: MatDialog,
    private apiService: ApiserviceService, private fb: FormBuilder) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getAllEmployeeList();
    this.getAllActiveManagerList();
    this.getCurrentJobsList();
    this.getJobStatusList();
    this.initialForm();
  }

  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  getJobStatusList() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (resData: any) => {
        console.log(resData);
        this.allJobStatus = resData;
      }
    )
  }

  public getAllEmployeeList(){
    this.allEmployeelist =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
  this.allEmployeelist = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  
  public getAllActiveManagerList(){
    this.allManagerlist =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True&designation=manager`).subscribe((respData: any) => {
  this.allManagerlist = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  initialForm() {
    this.jobStatusForm = this.fb.group({
      status_name: [''],
      percentage: []
    })
  }
  public openCreateClientPage() {
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
          this.router.navigate(['/jobs/update-job', this.selectedItemId]);

        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
  public getCurrentJobsList() {
    this.isHistory = false;
    this.isCurrent = true;
    let query = this.getFilterBaseUrl()
    query += `&status=True`;
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe(
      (res: any) => {
        this.allJobsList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }

  public getJobsHistoryList() {
    this.isCurrent = false;
    this.isHistory = true;
    let query = this.getFilterBaseUrl()
    query += `&status=False`;
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe(
      (res: any) => {
        this.allJobsList = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
  public getCurrentJobs() {
    this.page = 1;
    this.tableSize = 5;
    this.getCurrentJobsList();
  }
  public getJobsHistory() {
    this.page = 1;
    this.tableSize = 5;
    this.getJobsHistoryList();
  }

  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if (this.isCurrent) {
        this.getCurrentJobsList()
      } else {
        this.getJobsHistoryList();
      }
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    if (this.isCurrent) {
      this.getCurrentJobsList()
    } else {
      this.getJobsHistoryList();
    }

  }
  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      if (this.isCurrent) {
        this.getCurrentJobsList()
      } else {
        this.getJobsHistoryList();
      }
    }
    else if (!this.term) {
      if (this.isCurrent) {
        this.getCurrentJobsList()
      } else {
        this.getJobsHistoryList();
      }
    }
  }

  public getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
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

  onStatusChange(item: any, event: any) {
    console.log(event)
    const selectedStatusId = event.value;

    // Find the percentage associated with the selected status
    const selectedStatus = this.allJobStatus.find(status => status.id == selectedStatusId);
    console.log(selectedStatus)
    if (selectedStatus) {
      item.job_status = event.value;
      item.percentage_of_completion = selectedStatus.percentage_of_completion;
      item.isInvalid = false;
        // Update the percentage dynamically
    }

    // trigger the the api to upadate the job status

  }
  public validateKeyPress(event: KeyboardEvent) {
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
      item.errorType = null; // Clear errors when valid
    }
  }
  

  saveJobStausPercentage(item: any) {
    if(!item.isInvalid){
      let formData:any= {'job_status':item?.job_status,'percentage_of_completion':item.percentage_of_completion}
      this.apiService.updateData(`${environment.live_url}/${environment.jobs_percetage}/${item.id}/`,formData).subscribe((respData: any) => {
        if (respData) {
          this.apiService.showSuccess(respData['message']);
          if (this.isCurrent) {
            this.getCurrentJobsList()
          } else {
            this.getJobsHistoryList();
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

  public downloadOption(type:any){
    let query = `?page=${this.page}&page_size=${this.tableSize}&file-type=${type}`
    let apiUrl = `${environment.live_url}/${environment.job_details}/${query}`;
    fetch(apiUrl)
  .then(res => res.blob())
  .then(blob => {
    console.log('blob',blob);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `job_details.${type}`;
    a.click();
  });
  }
} 
