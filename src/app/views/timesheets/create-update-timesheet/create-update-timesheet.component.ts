import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { DatePipe } from '@angular/common';
import {CanComponentDeactivate} from '../../../authGuard/can-deactivate.guard'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-update-timesheet',
  templateUrl: './create-update-timesheet.component.html',
  styleUrls: ['./create-update-timesheet.component.scss']
})
export class CreateUpdateTimesheetComponent implements CanComponentDeactivate, OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Timesheet';
  timesheetFormGroup: FormGroup
  currentDate: any = new Date().toISOString();
  currentTime: any
  accessPermissions: any = [];
  employeeData: any = []
  clientList: any = []
  jobsList: any = []
  taskList: any = []
  searchClientText: any;
  searchJobText: any;
  user_id: any;
  user_role_name: any
  filteredJobStatusList: any = []
  isEditItem: boolean = false;
  timesheet_id: any;
  minstartTime: any
  minEndTime: string = '';
  constructor(private fb: FormBuilder, private apiService: ApiserviceService, private datePipe: DatePipe,
    private accessControlService: SubModuleService, private router: Router, private common_service: CommonServiceService,
    private activeRoute: ActivatedRoute, private formErrorScrollService: FormErrorScrollUtilityService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name')
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
      this.timesheet_id = this.activeRoute.snapshot.paramMap.get('id')
      this.isEditItem = true;
    } else {
      this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
    }
  }
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;

  ngOnInit(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
    this.initialForm()
    this.getAllDropdownData();
    if (this.isEditItem) {
      this.getTimesheetDetails(this.timesheet_id);
    } else {
      this.getStartTimePreviousData();
    }

  }





  getAllDropdownData() {
    if (this.user_role_name != 'Admin') {
      this.getModuleAccess();
      this.getEmployeeData();
      this.getEmployeeClientData();
      this.getEmployeeJobsList();
      this.getTaskList();
    }
  }
  initialForm() {
    this.timesheetFormGroup = this.fb.group({
      date: [this.currentDate, Validators.required],
      employee_id: ['', Validators.required],
      client_id: ['', Validators.required],
      job_id: ['', Validators.required],
      task: ['', Validators.required],
      start_time: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5][0-9]|[1-5][0-9])$/)]],
      end_time: [this.currentTime, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5][0-9]|[1-5][0-9])$/)]],
      time_spent: [''],
      notes: [''],
      created_by: [this.user_id, Validators.required],
    })
  }
  public get f() {
    return this.timesheetFormGroup.controls;
  }

  // access
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        // console.log(res);
        this.accessPermissions = res[0].operations;
      }
    )
  }

  // Employee data
  getEmployeeData() {
    let queryparams = `?employee=True&is_active=True&employee_id=${this.user_id}`
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('employee data', res)
        this.employeeData = res
        this.timesheetFormGroup.patchValue({ employee_id: res[0].user_id });
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }

  getEmployeeClientData() {
    let queryparams = `?status=True&employee-id=${this.user_id}`
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('clientList data', res)
        this.clientList = res
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }
  filteredClientList() {
    if (!this.searchClientText) {
      return this.clientList;
    }
    return this.clientList.filter((client: any) =>
      client?.client_name?.toLowerCase()?.includes(this.searchClientText?.toLowerCase())
    );
  }

  getEmployeeJobsList() {
    let queryparams = `?status=True&employee-id=${this.user_id}`
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('jobs data', res)
        this.jobsList = res
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }
  filteredJobsList() {
    if (!this.searchJobText) {
      return this.jobsList;
    }
    return this.jobsList.filter((jobs: any) =>
      jobs?.job_name?.toLowerCase()?.includes(this.searchJobText?.toLowerCase())
    );
  }

  getTaskList() {
    let queryparams = `?get-tasks=True`
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('task data', res)
        this.taskList = res;
        this.taskList.forEach((task_name) => {
          if (task_name.value === 'Review' && this.user_role_name === 'Manager') {
            this.timesheetFormGroup.patchValue({ task: task_name.id })
          } else if (task_name.value === 'Processing' && this.user_role_name === 'Accountant') {
            this.timesheetFormGroup.patchValue({ task: task_name.id })
          }
        });
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }

  getStartTimePreviousData() {
    let queryparams = `?timesheet-employee=${this.user_id}&higest-end-time=True`
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('perious time data', res)
        if (res) {
          this.timesheetFormGroup.patchValue({ start_time: res.higest_end_time })
          this.updateDuration();
        }
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }


  public clearSearch(key: any) {
    if (key === 'client') {
      this.searchClientText = '';
    } else if (key === 'jobs') {
      this.searchJobText = '';
    }
  }

  startTimeFormat(event: any): void {
    let rawValue = event.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 2) {
      rawValue = rawValue.slice(0, 2) + ':' + rawValue.slice(2);
    }
    this.timesheetFormGroup.controls['start_time'].setValue(rawValue, { emitEvent: false });
    this.isEndTimeBeforeStartTime();
    this.updateDuration()
  }
  endTimeFormat(event: any): void {
    let rawValue = event.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 2) {
      rawValue = rawValue.slice(0, 2) + ':' + rawValue.slice(2);
    }
    this.timesheetFormGroup.controls['end_time'].setValue(rawValue, { emitEvent: false });
    this.isEndTimeBeforeStartTime();
  }

  sss: boolean = false
  isEndTimeBeforeStartTime(): void {
    const startTime = this.timesheetFormGroup.value.start_time;
    const endTime = this.timesheetFormGroup.value.end_time;

    if (!startTime || !endTime || !startTime.includes(':') || !endTime.includes(':')) {
      this.timesheetFormGroup.get('end_time')?.setErrors(null);
      return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    const control = this.timesheetFormGroup.get('end_time');

    if (endTotal <= startTotal) {
      control?.setErrors({ endBeforeStart: true });
    } else {
      if (control?.hasError('endBeforeStart')) {
        const errors = { ...control.errors };
        delete errors['endBeforeStart'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    this.updateDuration()
  }

  updateDuration(): void {
    const start = this.timesheetFormGroup.value.start_time;
    const end = this.timesheetFormGroup.value.end_time;
    if (!start || !end || !start.includes(':') || !end.includes(':')) {
      this.timesheetFormGroup.get('time_spent')?.setValue('');
      return;
    }

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) {
      this.timesheetFormGroup.get('time_spent')?.setValue('');
      return;
    }

    const hrs = Math.floor(diff / 60).toString().padStart(2, '0');
    const mins = (diff % 60).toString().padStart(2, '0');
    this.timesheetFormGroup.get('time_spent')?.setValue(`${hrs}:${mins}`);
  }



  getTimesheetDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${id}/`).subscribe(
      (res: any) => {
        // console.log(res);
        this.timesheetFormGroup.patchValue({
          date: res.date,
          employee_id: res.employee_id,
          client_id: res.client_id,
          job_id: res.job_id,
          task: res.task,
          start_time: res.start_time,
          end_time: res.end_time,
          time_spent: res.time_spent,
          notes: res.notes,
          created_by: res.created_by,
        })
      },
      (error: any) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }

  backBtnFunc() {
    this.router.navigate(['/timesheets/all-timesheets']);
  }
  saveTimesheets() {
    this.timesheetFormGroup.patchValue({ date: this.datePipe.transform(this.timesheetFormGroup?.get('date')?.value, 'YYYY-MM-dd') })
    if (this.timesheetFormGroup.invalid) {
      this.timesheetFormGroup.markAllAsTouched();
      this.formErrorScrollService.scrollToFirstError(this.timesheetFormGroup);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.vlp_timesheets}/${this.timesheet_id}/`, this.timesheetFormGroup.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/timesheets/all-timesheets']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        // console.log(this.timesheetFormGroup.value)
        this.apiService.postData(`${environment.live_url}/${environment.vlp_timesheets}/`, this.timesheetFormGroup.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/timesheets/all-timesheets']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.isEditItem = false;
  }

}
