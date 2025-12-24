import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-comp-off-grant',
  templateUrl: './comp-off-grant.component.html',
  styleUrls: ['./comp-off-grant.component.scss']
})
export class CompOffGrantComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  leave_balance: any = 'NA';
  userRole: any;
  user_id: any;
  allleavetypeList: any = [];
  BreadCrumbsTitle: any = 'Comp Off Grant';
  sessions: any = [
    { value: 'session 1', label: 'Session 1' },
    { value: 'session 2', label: 'Session 2' },
  ];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  leaveApplyForm: FormGroup;
  allEmployeeEmailsList: any = [];
  reportinManagerDetails: any = [];
  fileDataUrl: string | ArrayBuffer | null = null;
  uploadFile: any;
  url: any;
  fileUrl: string | ArrayBuffer;
  minDate: any;
  startMaxDate= new Date();

  emailCtrl = new FormControl('');
  filteredEmails!: Observable<{ email: string }[]>;
  selectedEmails: string[] = [];
  ccEmailsList: any = [];
  @ViewChild('ccInput') ccInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  employeeCtrl = new FormControl('');
  selectedEmployees: any = [];
  filteredEmployees: any = [];
  allEmployees: any = []
  @ViewChild('employeeInput') employeeInput!: ElementRef<HTMLInputElement>;
  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  constructor(
    private apiService: ApiserviceService,
    private common_service: CommonServiceService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CompOffGrantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    console.log(this.data?.employee===false)
    this.initialForm();
    this.getAllLeaveTypes();
    this.getAllEmployeeList2();
    if(this.data?.employee===false){
        this.getManagerOfEmployee(this.user_id);
      } 
    this.employeeCtrl.valueChanges.subscribe(value => {
      const search = typeof value === 'string' ? value.toLowerCase() : '';
      this.filteredEmployees = this.allEmployees.filter(emp =>
        emp.user__full_name.toLowerCase().includes(search) ||
        emp.designation__designation_name.toLowerCase().includes(search)
      );
     
    });
    
    // this.getAllEmployeeList();
  }

  getAllEmployeeList2() {
    this.apiService.getData(`${environment.live_url}/${environment.user}/?employee=True&is_active=True`).subscribe((res: any) => {
      this.allEmployees = res.results || res; // if API wraps data in results
      this.filteredEmployees = this.allEmployees;
    },
  (error:any)=>{
    console.log(error)
  });
  }

  getManagerOfEmployee(user_id){
    this.reportinManagerDetails = []
    this.apiService.getData(`${environment.live_url}/${environment.user}/${user_id}/`).subscribe((res) => {
      this.reportinManagerDetails.push({
        id: res['reporting_manager_id'],
        full_name:
          res['reporting_manager_id__first_name'] +
          ' ' +
          res['reporting_manager_id__last_name'],
      });
      this.leaveApplyForm.patchValue({reporting_to:this.reportinManagerDetails[0]?.id})
    });
  }


  initialForm() {
    this.leaveApplyForm = this.fb.group({
      leave_type: ['', Validators.required],
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      from_session: ['', Validators.required],
      to_session: ['', Validators.required],
      cc: [''],
      number_of_leaves_applying_for: [''],
      reporting_to: ['', Validators.required],
      message: ['', Validators.required],
      // attachment: [''],
      employee: ['', Validators.required],
    });
  }

  public getAllLeaveTypes() {
    this.allleavetypeList = [];
    this.apiService
      .getData(`${environment.live_url}/${environment.settings_leave_type}/`)
      .subscribe(
        (respData: any) => {
          this.allleavetypeList = respData.filter((data: any) => data.leave_type_name === 'Comp Off');
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

  public get f() {
    return this.leaveApplyForm.controls;
  }
  startDate: Date | null = null;
  endDate: Date | null = null;
  session1: string | null = null; // "first" or "second"
  session2: string | null = null; // "first" or "second"
  totalDays: number = 0;
  DateError: any;

  calculateDays() {
    if (!this.startDate || !this.endDate) {
      console.log('Please select both start and end date');
      return;
    }

    if (this.endDate < this.startDate) {
      this.DateError = 'End date must be greater than or equal to start date';
      return;
    }

    // Base difference in full days (inclusive)
    let diffTime = this.endDate.getTime() - this.startDate.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let total = diffDays;

    // Adjust for sessions
    if (this.startDate.getTime() === this.endDate.getTime()) {
      // Same day case
      if (this.session1 === 'session 1' && this.session2 === 'session 1')
        total = 0.5;
      else if (this.session1 === 'session 2' && this.session2 === 'session 2')
        total = 0.5;
      else total = 1; // first–second or second–first → full day
    } else {
      // Multi-day case
      if (this.session1 === 'session 2') {
        total -= 0.5; // start at 2nd half → reduce half
      }
      if (this.session2 === 'session 1') {
        total -= 0.5; // end at 1st half → reduce half
      }
    }

    this.totalDays = total;
    console.log('Total Days:', this.totalDays);
  }

  convertDateTime(dateVal: Date) {
    const date: Date = dateVal;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-based
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  working_day_data: any;
  getWorkingDays(date: Date) {
    this.apiService
      .getData(`${environment.live_url}/${environment.work_calendar}/`)
      .subscribe((res: any) => {
        this.working_day_data = res[0]['working_days'];
        // console.log('api response ==>', this.working_day_data);

        this.checkHoliday(date);
      });
  }

  countFixedHolidays(
    startDate: Date,
    endDate: Date,
    fixedHolidays: any[]
  ): number {
    let holidayCount = 0;

    fixedHolidays.forEach((holiday) => {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= startDate && holidayDate <= endDate) {
        holidayCount++;
      }
    });

    return holidayCount;
  }

  getHolidayCalender(
    startDate: Date,
    endDate: Date,
    callback: (count: number) => void
  ) {
    this.apiService
      .getData(`${environment.live_url}/${environment.holiday_calendar}/`)
      .subscribe((res: any) => {
        const count = this.countFixedHolidays(
          startDate,
          endDate,
          res.results || res
        );
        callback(count); // ✅ Pass result back
      });
  }

  countHolidays(startDate: Date, endDate: Date): number {
    if (!this.working_day_data) {
      // console.warn("working_day_data not loaded yet!");
      return 0;
    }

    let holidayCount = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const dayOfMonth = currentDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      const weekKey = ['1st', '2nd', '3rd', '4th', '5th'][weekNumber - 1];

      const dayData = this.working_day_data.find((d: any) => d.day === dayName);

      if (dayData) {
        const allHoliday = dayData.data.find(
          (d: any) => d.key === 'all'
        )?.is_holiday;
        const weekHoliday = dayData.data.find(
          (d: any) => d.key === weekKey
        )?.is_holiday;

        if (allHoliday || weekHoliday) {
          holidayCount++;
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return holidayCount;
  }

  checkHoliday(date: Date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfMonth = date.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const weekKey = ['1st', '2nd', '3rd', '4th', '5th'][weekNumber - 1];

    const dayData = this.working_day_data.find((d: any) => d.day === dayName);

    if (!dayData) {
      console.log('Day not found in calendar');
      return;
    }

    const allHoliday = dayData.data.find(
      (d: any) => d.key === 'all'
    )?.is_holiday;
    const weekHoliday = dayData.data.find(
      (d: any) => d.key === weekKey
    )?.is_holiday;

    if (allHoliday || weekHoliday) {
      // console.log('Its holiday');
    } else {
      // console.log('Not holiday');
    }
  }

  startDateFun(event: any) {
    let new_date: any = this.convertDateTime(event.value);
    this.startDate = event.value;
    this.minDate = event.value;
    this.calculateDays();
    this.leaveApplyForm.patchValue({ from_date: new_date });
  }

  endDateFun(event: any) {
    let new_date: any = this.convertDateTime(event.value);
    this.endDate = event.value;
    this.calculateDays();
    this.leaveApplyForm.patchValue({ to_date: new_date });

    let recurringHolidayCount = this.countHolidays(
      this.startDate,
      this.endDate
    );
  }

  sessionFun1(event: any) {
    console.log('Session 1:', event.value);
    this.session1 = event.value; // "first" or "second"
    let recurringHolidayCount = this.countHolidays(
      this.startDate,
      this.endDate
    );
    this.calculateDays();
  }

  sessionFun2(event: any) {
    console.log('Session 2:', event.value);
    this.session2 = event.value;
    let recurringHolidayCount = this.countHolidays(
      this.startDate,
      this.endDate
    );
    this.calculateDays();
  }

  public getAllEmployeeList() {
    this.allEmployeeEmailsList = [];
    this.apiService
      .getData(
        `${environment.live_url}/${environment.employee}/?is_active=True&employee=True`
      )
      .subscribe(
        (respData: any) => {
          this.allEmployeeEmailsList = respData;
          console.log('------>>', respData);
          this.reportinManagerDetails = this.allEmployeeEmailsList.find(
            (emp: any) => emp.user_id === Number(this.user_id)
          );
        },
        (error) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }

  selectedFile!: File | null;
  fileName: string = '';

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      // this.leaveApplyForm.patchValue({ attachment: file });
      this.leaveApplyForm.get('file')?.updateValueAndValidity();

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.fileDataUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }


  onSubmit(): void {
    const ccIds = this.selectedEmployees.map(e => e.user_id);
    if(this.data?.employee===false){
      this.leaveApplyForm.patchValue({employee: this.user_id });
    }
    this.leaveApplyForm.patchValue({ cc: ccIds,number_of_leaves_applying_for: this.totalDays });

    console.log(this.leaveApplyForm.value)
    if (this.leaveApplyForm.invalid) {
      this.leaveApplyForm.markAllAsTouched();
    }
    else {
      const formData = new FormData();
      Object.keys(this.leaveApplyForm.value).forEach((key) => {
        const value = this.leaveApplyForm.value[key];
        formData.append(key, value);
      });
      console.log('form value 2 after valid -->>>', this.leaveApplyForm.value);

      this.apiService.postData(
        `${environment.live_url}/${environment.comp_off_grant}/`,
        formData
      )
        .subscribe(
          (res: any) => {
            this.apiService.showSuccess(res.message);
            this.resetFormState();
             this.dialogRef.close({data:'refresh'});
          },
          (err) => {
            console.log('err', err);
            this.apiService.showError(err?.error?.message);
          }
        );
    }
  }
  public resetFormState() {
    this.totalDays = 0;
    this.fileDataUrl = '';
    this.selectedFile = null;
    this.fileName = '';
    this.selectedEmails = []
    this.leave_balance = 0
    this.formGroupDirective?.resetForm();
    // this.formErrorScrollService.resetHasUnsavedValue();
    // this.isEditItem = false;
    // this.initialFormValue = this.jobFormGroup?.getRawValue();
  }


  filterEmployees(): void {
    if (this.leaveApplyForm.value.cc_to_input) {
      this.filteredEmployees = this.ccEmailsList?.filter((employee: any) =>
        employee.user.first_name.toLowerCase().includes(this.leaveApplyForm.value.cc_to_input.toLowerCase())
      );
    } else {
      this.filteredEmployees = []
    }
  }


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const emp = this.allEmployees.find(e =>
        e.user__full_name.toLowerCase() === value.toLowerCase()
      );
      if (emp && !this.selectedEmployees.includes(emp)) {
        this.selectedEmployees.push(emp);
      }
    }
    if (this.employeeInput) {
      this.employeeInput.nativeElement.value = '';
    }
    this.employeeCtrl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const emp = event.option.value;
    if (!this.selectedEmployees.includes(emp)) {
      this.selectedEmployees.push(emp);
    }
    this.employeeInput.nativeElement.value = '';
    this.employeeCtrl.setValue(null);
  }

  remove(emp: any): void {
    const index = this.selectedEmployees.indexOf(emp);
    if (index >= 0) {
      this.selectedEmployees.splice(index, 1);
    }
  }

  public onEmployeeChange(event: any) {
    if(this.data?.employee===true){
      this.leaveApplyForm.get('reporting_to')?.reset('');
      this.getManagerOfEmployee(event.value)
    }
    this.updateSelectedItems('employee', event.value);
  }

    pageSizeDropdown = 50;

dropdownState = {
  employee: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  }
};

dropdownEndpoints = {
  employee: environment.user,
};

private scrollListeners: { [key: string]: (event: Event) => void } = {};

// Selected items for pagination dropdowns
selectedItemsMap: { [key: string]: any[] } = {
  employee: [],
};


removeScrollListener(key: string) {
  const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
  if (panel && this.scrollListeners[key]) {
    panel.removeEventListener('scroll', this.scrollListeners[key]);
    delete this.scrollListeners[key];
  }
}

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
  if (key === 'employee') {
    query += `&is_active=True&employee=True`;
    if (this.userRole === 'Manager')  {
      query += `&reporting_manager_id=${this.user_id}`;
    }
  }
  

  this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
    .subscribe((res: any) => {
      state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
      const selectedItems = this.selectedItemsMap[key] || [];
      const selectedIds = selectedItems.map(item => item.user_id);
      const filteredResults = res.results.filter(
        (item: any) => !selectedIds.includes(item.user_id)
      );
      if (append) {
        state.list = [...state.list, ...filteredResults];
      } else {
        state.list = [...selectedItems, ...filteredResults];
      }
      state.loading = false;
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
  selectedItems = selectedItems.filter(item => selectedIds.includes(item.user_id));
  selectedIds.forEach(id => {
    if (!selectedItems.some(item => item.user_id === id)) {
      const found = state.list.find(item => item.user_id === id);
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
    !selectedItems.some(sel => sel.user_id === item.user_id)
  );
  return [...selectedItems, ...unselectedItems];
}


// Called when the dropdown opens or closes
onDropdownOpened(isOpen, key: string) {
  if (isOpen) {
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

}
