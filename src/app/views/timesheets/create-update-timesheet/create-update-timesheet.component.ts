import { Component,ChangeDetectorRef, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import {CanComponentDeactivate} from '../../../auth-guard/can-deactivate.guard'
import { setMaxListeners } from 'events';

@Component({
  selector: 'app-create-update-timesheet',
  templateUrl: './create-update-timesheet.component.html',
  styleUrls: ['./create-update-timesheet.component.scss']
})
export class CreateUpdateTimesheetComponent implements CanComponentDeactivate,OnInit,OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Timesheet';
  timesheetFormGroup: FormGroup
  currentDate: any = new Date().toISOString();
  initialFormValue:any
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
  statusList:any=[];
allJobStatus:any=[];
weekTimesheetSubmitted: boolean = false;
errorMessage:any='';
  constructor(private fb: FormBuilder, private apiService: ApiserviceService, private datePipe: DatePipe,
    private accessControlService: SubModuleService, private router: Router, private common_service: CommonServiceService,
    private activeRoute: ActivatedRoute, private formErrorScrollService: FormErrorScrollUtilityService,private cdr: ChangeDetectorRef
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

  ngOnInit(): void {
    this.getAllDropdownData();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
    this.initialForm();
    if (this.isEditItem) {
      // Delay due to alldropdown dependency
      setTimeout(() => {
        this.getTimesheetDetails(this.timesheet_id);
      }, 500);
    } else {
      this.getStartTimePreviousData();
    }
    this.timesheetFormGroup?.valueChanges?.subscribe(() => {
      const currentFormValue = this.timesheetFormGroup?.getRawValue();
      const isInvalid = this.timesheetFormGroup?.touched && this.timesheetFormGroup?.invalid;
      const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
     this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }





  getAllDropdownData() {
    if (this.user_role_name != 'Admin') {
      this.getModuleAccess();
      this.getJobStatusList();
      this.getEmployeeData();;
      // this.getEmployeeJobsList();
      this.getTaskList();
    }

  }
  ngOnDestroy(): void {
this.formErrorScrollService.resetHasUnsavedValue();
  }
  initialForm() {
    this.timesheetFormGroup = this.fb.group({
      date: [this.currentDate, Validators.required],
      employee_id: ['', Validators.required],
      client_id: [null],
      job_id: ['', Validators.required],
      task: ['', Validators.required],
      start_time: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5][0-9]|[1-5][0-9])$/)]],
      end_time: [this.currentTime, [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5][0-9]|[1-5][0-9])$/)]],
      time_spent: [''],
      notes: [''],
      created_by: [this.user_id, Validators.required],
    })
    this.initialFormValue  = this.timesheetFormGroup.getRawValue();
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

  filteredClientList() {
    if (!this.searchClientText) {
      return this.clientList;
    }
    return this.clientList.filter((client: any) =>
      client?.client_name?.toLowerCase()?.includes(this.searchClientText?.toLowerCase())
    );
  }

  getEmployeeJobsList() {
    let queryparams = `?job-status=[${this.statusList}]&employee-id=${this.user_id}`;
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${queryparams}`).subscribe(
      (res: any) => {
        // console.log('jobs data', res)
        // this.jobsList = res
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
  dateSelected(event){
  const { startOfWeek, endOfWeek } = this.getWeekRangeFromSelectedDate(this.formatDateToString(event.value));
  this.checkTimesheetSubmission(startOfWeek,endOfWeek);
  this.getStartTimePreviousData()
  }
formatDateToString(date: Date): string | null {
    return this.datePipe.transform(date, 'yyyy-MM-dd'); // Output: '2025-04-13'
  }
getWeekRangeFromSelectedDate(date: any): { startOfWeek: string; endOfWeek: string } {
  const selected = new Date(date);
  const dayOfWeek = selected.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Get Sunday (start of the week)
  const startOfWeek = new Date(selected);
  startOfWeek.setDate(selected.getDate() - dayOfWeek);

  // Get Saturday (end of the week)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Format date as YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split('T')[0];

  return {
    startOfWeek: format(startOfWeek),
    endOfWeek: format(endOfWeek),
  };
}


checkTimesheetSubmission(startDate,endDate) {
  this.errorMessage='';
  this.weekTimesheetSubmitted=false;
    let query = `?employee-id=${this.user_id}&from-date=${startDate}&to-date=${endDate}`
    this.apiService.getData(`${environment.live_url}/${environment.submit_weekly_timesheet}/${query}`).subscribe(
      (res: any) => {
        this.weekTimesheetSubmitted = res.is_timesheet_submitted;
        if(this.weekTimesheetSubmitted){
          this.errorMessage=`Timesheet already submitted for this week (${startDate} – ${endDate}). Cannot create new.`;
        }        
      },
      (error: any) => {
        console.log(error)
      }
    )
  }

  getStartTimePreviousData() {
   let date =  this.datePipe.transform(this.timesheetFormGroup.value.date, 'YYYY-MM-dd')
    let queryparams = `?timesheet-employee=${this.user_id}&higest-end-time=True&date=${date}`
    this.apiService.getData(`${environment.live_url}/${environment.vlp_timesheets}/${queryparams}`).subscribe(
      (res: any) => {
        let currentDate = this.datePipe.transform(new Date().toDateString(), 'YYYY-MM-dd')
        if (res?.higest_end_time) {
          if (date === currentDate) {
            // console.log('Selected date is today.');
            this.timesheetFormGroup.patchValue({end_time:this.currentTime})
          } else {
            // console.log('Selected date is NOT today.');
            this.timesheetFormGroup.patchValue({end_time:''})
          }
          this.timesheetFormGroup.patchValue({ start_time: res?.higest_end_time })
          // console.log('perious time data', res)
          this.updateDuration();
        } 
        else{
          // console.log('no time data', res)
          if (date === currentDate) {
            // console.log('Selected date is today.');
            this.timesheetFormGroup.patchValue({end_time:this.currentTime})
          } else {
            // console.log('Selected date is NOT today.');
            this.timesheetFormGroup.patchValue({start_time:''});
            this.timesheetFormGroup.patchValue({end_time:''})
          }
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
   if(event.target.value){
let rawValue = event.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 2) {
      rawValue = rawValue.slice(0, 2) + ':' + rawValue.slice(2);
    }
    this.timesheetFormGroup.controls['end_time'].setValue(rawValue, { emitEvent: false });
    this.isEndTimeBeforeStartTime();
   }else{
this.timesheetFormGroup.controls['time_spent']?.reset();
   }
    
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
        });
        this.patchDropdownValuesForEdit(res);
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
      this.formErrorScrollService.setUnsavedChanges(true);
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
            this.getAllDropdownData();
            this.resetFormState();
            // sessionStorage.removeItem("access-name")
            // this.router.navigate(['/timesheets/all-timesheets']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
    this.isEditItem = false;
    this.initialForm();
    this.getStartTimePreviousData();
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.timesheetFormGroup?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged,this.timesheetFormGroup);
  }

  @HostListener('window:beforeunload', ['$event'])
unloadNotification($event: BeforeUnloadEvent): void {
  const currentFormValue = this.timesheetFormGroup.getRawValue();
  const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
  if (isFormChanged || this.timesheetFormGroup.dirty) {
    $event.preventDefault();
  }
}
getJobStatusList() {
  this.allJobStatus=[];
  this.statusList=[];
  this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
    (resData: any) => {
      if(resData){
        this.allJobStatus = resData;
        this.statusList = this.allJobStatus
        ?.filter((jobstatus: any) =>jobstatus?.status_name !== "Cancelled" && jobstatus?.status_name !== "Completed")?.map((status: any) => status?.status_name);
      }
      // commented because added pagination for jobs
    // setTimeout(() => {
    //   this.getEmployeeJobsList();
    // }, 300);
    },
    (error:any)=>{
      this.apiService.showError(error?.error?.detail);
    }
  )
}

dateClass = (date: Date) => {
  return date.getDay() === 0 ? 'sunday-highlight' : '';
};


// new code =====================================

pageSizeDropdown = 10;

dropdownState = {
    job_id: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  },
};

dropdownEndpoints = {
  job_id: environment.jobs_search,
};

private scrollListeners: { [key: string]: (event: Event) => void } = {};

// Selected items for pagination dropdowns
selectedItemsMap: { [key: string]: any[] } = {
  job_id: [],
};


removeScrollListener(key: string) {
  const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
  if (panel && this.scrollListeners[key]) {
    panel.removeEventListener('scroll', this.scrollListeners[key]);
    delete this.scrollListeners[key];
  }
}

// Scroll handler for infinite scroll
onScroll(key: string, event: Event) {
  const target = event.target as HTMLElement;
  const state = this.dropdownState[key];

  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  const atBottom = scrollHeight - scrollTop <= clientHeight + 5;
  if (atBottom && !state.loading && state.page < state.totalPages) {
    state.page++;
    this.fetchData(key, true);
  }
}

// Search input for pagination 
onSearch(key: string, text: string) {
  const state = this.dropdownState[key];
  state.search = text.trim();
  state.page = 1;
  state.list = [];
  this.fetchData(key, false);
}

// Clear search input
clearSearchDropD(key: string) {
  this.dropdownState[key].search = '';
  this.dropdownState[key].page = 1;
  this.dropdownState[key].list = [];
  this.fetchData(key, false);
}

// Fetch data from API with pagination and search
fetchData(key: string, append = false) {
  const state = this.dropdownState[key];
  state.loading = true;
  let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
  if (state.search) {
    query += `&search=${encodeURIComponent(state.search)}`;
  }
  if (key === 'job_id') {
    query += `&employee-id=${this.user_id}`;
  }
  this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
    .subscribe((res: any) => {
      state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
      const selectedItems = this.selectedItemsMap[key] || [];
      const selectedIds = selectedItems.map(item => item.id);
      const filteredResults = res.results.filter(
        (item: any) => !selectedIds.includes(item.id)
      );
      if (append) {
        state.list = [...state.list, ...filteredResults];
      } else {
        state.list = [...selectedItems, ...filteredResults];
      }

      state.loading = false;
      this.cdr.detectChanges();
    }, () => {
      state.loading = false;
    });
}

// Update selectedItemsMap with full objects to keep selected at top & no duplicates
updateSelectedItems(key: string, selectedIds: any[]) {
  if (!Array.isArray(selectedIds)) {
    selectedIds = selectedIds != null ? [selectedIds] : [];
  }
  const state = this.dropdownState[key];
  let selectedItems = this.selectedItemsMap[key] || [];
   // removing the unselected datas
  selectedItems = selectedItems.filter(item => selectedIds.includes(item.id));

  // Add new selected items from currently loaded list if missing
  selectedIds.forEach(id => {
    if (!selectedItems.some(item => item.id === id)) {
      const found = state.list.find(item => item.id === id);
      if (found) {
        selectedItems.push(found);
      } else {
        // if we want then fetch item from API if not found 
      }
    }
  });
  this.selectedItemsMap[key] = selectedItems;
}

// Return options with selected items on top, no duplicates
getOptionsWithSelectedOnTop(key: string) {
  const state = this.dropdownState[key];
  const selectedItems = this.selectedItemsMap[key] || [];
  const unselectedItems = state.list.filter(item =>
    !selectedItems.some(sel => sel.id === item.id)
  );

  return [...selectedItems, ...unselectedItems];
}

onDropdownOpened(isOpen, key: string) {
  if (isOpen) {
    // ⬇⬇ ADD THIS BLOCK ⬇⬇
    if (!this.dropdownState[key].initialized || this.dropdownState[key].list.length === 0) {
      this.dropdownState[key].page = 1;
      this.fetchData(key, false);  
      this.dropdownState[key].initialized = true;
    }
    setTimeout(() => {
      this.removeScrollListener(key); 
      const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
      if (panel) {
        this.scrollListeners[key] = (event: Event) => this.onScroll(key, event);
        panel.addEventListener('scroll', this.scrollListeners[key]);
      }
    }, 0);
  } else {
    this.removeScrollListener(key);
  }
}

commonOnchangeFun(event, key){
  this.updateSelectedItems(key, event.value);
}

patchDropdownValuesForEdit(data: any) {
  const setDropdownValue = (key: string, idKey: string, nameKey: string) => {
    const idVal = data?.[idKey];
    const nameVal = data?.[nameKey];
    if (idVal != null) {
      const obj: any = { id: idVal, [nameKey]: nameVal ?? '' };
      this.selectedItemsMap[key] = [obj];
      this.timesheetFormGroup.get(key)?.patchValue(idVal);
      if (!this.dropdownState[key]) {
        this.dropdownState[key] = {
          page: 1,
          list: [],
          search: '',
          totalPages: 1,
          loading: false,
          initialized: false
        };
      }
      this.dropdownState[key].list = this.dropdownState[key].list.filter(
        (it: any) => it?.id !== idVal
      );
      this.dropdownState[key].list.unshift(obj);
    }
  };
  setDropdownValue('job_id', 'job_id', 'job_name');
  this.cdr.detectChanges();
}



}
