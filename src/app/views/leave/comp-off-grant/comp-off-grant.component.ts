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
import { Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  BreadCrumbsTitle: any = 'Comp-Off Request';
  sessions: any = [
    { value: 'session 1', label: 'Session 1' },
    { value: 'session 2', label: 'Session 2' },
  ];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  leaveApplyForm!: FormGroup;
  allEmployeeEmailsList: any = [];
  reportinManagerDetails: any = [];
  minDate: any;
  startMaxDate= new Date();
  totalDays: number = 0;
  holidayList:any
  workCalendar:any
  ccEmailsList: any = [];
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  employeeCtrl = new FormControl('');
  selectedEmployees: any = [];
  filteredEmployees: any = [];
  allEmployees: any = []
  @ViewChild('employeeInput') employeeInput!: ElementRef<HTMLInputElement>;
  
  constructor(
    private apiService: ApiserviceService,
    private common_service: CommonServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    @Optional() public dialogRef: MatDialogRef<CompOffGrantComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
    // public dialogRef: MatDialogRef<CompOffGrantComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.initialForm();
    this.getAllLeaveTypes();
    this.workCalendarlist();
    this.holidaylistsss();
    this.getAllEmployeeList2();
    const isDialogMode = !!this.data;
  let employeeMode = false;

  if (isDialogMode) {
    employeeMode = this.data?.employee;
  } else {
    // If opened via route, read from query params (optional)
    this.route.queryParams.subscribe(params => {
      employeeMode = params['employee'] === 'true';
    });
  }
    if(!this.data){
        this.getManagerOfEmployee(this.user_id);
      } 
    this.subscribeToDateChanges();
    this.employeeCtrl.valueChanges.subscribe(value => {
      const search = typeof value === 'string' ? value.toLowerCase() : '';
      this.filteredEmployees = this.allEmployees.filter((emp: any) =>
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

  getManagerOfEmployee(user_id:any){
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
      to_date: [''],
      from_session: ['session 1', Validators.required],
      to_session: ['session 2', Validators.required],
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
          this.allleavetypeList = respData.filter((data: any) => data.leave_type_name.toLowerCase() === 'comp off');
          this.leaveApplyForm.patchValue({leave_type: this.allleavetypeList[0].id });
          this.leaveApplyForm.get('leave_type')?.disable();
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

   holidaylistsss(){
    this.apiService
      .getData(`${environment.live_url}/${environment.holiday_calendar}/`)
      .subscribe((res: any) => {
        this.holidayList = res;
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }
  workCalendarlist(){
    this.apiService
      .getData(`${environment.live_url}/${environment.work_calendar}/`)
      .subscribe((res: any) => {
        this.workCalendar = res[0];
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }

  public get f() {
    return this.leaveApplyForm.controls;
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
  
  get isPopup(): boolean {
    return !!this.dialogRef;
  }

  onSubmit(): void {
    const ccIds = this.selectedEmployees.map((e:any) => e.user_id);
    if(!this.data){
      this.leaveApplyForm.patchValue({employee: this.user_id });
    }
    let new_start_date: any = this.convertDateTime(this.getDateFromControl('from_date'));
    this.leaveApplyForm.patchValue({ cc: ccIds,number_of_leaves_applying_for: this.totalDays, from_date:new_start_date, to_date: new_start_date });

    console.log(this.leaveApplyForm.value)
     if (this.totalDays === 0) {
    this.apiService.showWarning("Comp off can only be applied on holidays or non-working days");
    return;
  }
    if (this.leaveApplyForm.invalid) {
      console.log('ee',this.leaveApplyForm.controls)
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
            if (this.dialogRef) {
              this.dialogRef.close({ data: 'refresh' });
            }
            //  this.dialogRef.close({data:'refresh'});
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
    this.leave_balance = 0
    this.formGroupDirective?.resetForm();
    this.initialForm();
    if(!this.data){
      this.getManagerOfEmployee(this.user_id);
    }
    this.subscribeToDateChanges();
    // this.formErrorScrollService.resetHasUnsavedValue();
    // this.isEditItem = false;
    // this.initialFormValue = this.jobFormGroup?.getRawValue();
  }
   subscribeToDateChanges(): void {
    this.leaveApplyForm.get('from_date')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('from_date')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('from_session')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('to_session')?.valueChanges.subscribe(() => this.computeTotalDays());
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
// dropdownState = {
//   employee: {
//     page: 1,
//     list: [],
//     search: '',
//     totalPages: 1,
//     loading: false,
//     initialized: false
//   }
// };

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


commonOnchangeFun(event: { value: any }, key: string): void {
  this.updateSelectedItems(key, event.value);
}

private getDateFromControl(controlName: string): Date | null {
    const val = this.leaveApplyForm.get(controlName)?.value;
    if (!val) return null;
    // if it's already a Date
    if (val instanceof Date) return val;
    // if it's ISO string
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  }

computeTotalDays(): void {
  const from: Date | null = this.getDateFromControl('from_date');
  this.minDate = from;
  const to: Date | null = this.getDateFromControl('from_date');
  const fromSession = this.leaveApplyForm.get('from_session')?.value;
  const toSession = this.leaveApplyForm.get('to_session')?.value;

  this.totalDays = 0;
  if (!from || !to || !fromSession || !toSession) return;

  const start = this.startOfDay(from);
  const end = this.startOfDay(to);

  if (end < start) {
    this.totalDays = 0;
    return;
  }

  const dates = this.enumerateDates(start, end);
  const wc = this.workCalendar;
  const holidayDatesSet = new Set(this.holidayList?.map((h:any) => h.date));

  // NEW: only holiday allowed
  const isHoliday = (d: Date): boolean => {
    const iso = this.toISODate(d);

    // API holiday
    if (holidayDatesSet.has(iso)) return true;

    if (!wc) return false;

    // work calendar holiday
    if (wc.custom_year === false) {
      if (wc.year === d.getFullYear()) {
        return this.isWorkCalendarHoliday(wc, d);
      }
      return false;
    }

    if (wc.custom_year === true) {
      if (wc.custom_year_start_date && wc.custom_year_end_date) {
        const startRange = this.startOfDay(new Date(wc.custom_year_start_date));
        const endRange = this.startOfDay(new Date(wc.custom_year_end_date));

        if (d >= startRange && d <= endRange) {
          return this.isWorkCalendarHoliday(wc, d);
        }
      }
      return false;
    }

    return false;
  };
  for (const d of dates) {
    if (!isHoliday(d)) {
      this.totalDays = 0;
      console.log('Not holiday date found:', this.totalDays);
      this.apiService.showWarning("Comp off can only be applied on holidays or non-working days");
      return;
    }
  }
  let total = 0;

  if (dates.length === 1) {
    total = (fromSession === toSession) ? 0.5 : 1;
    this.totalDays = total;
    console.log('Total Daysccc:', this.totalDays);
    return;
  }
  total += this.isSessionMorning(fromSession) ? 1 : 0.5;
  total += this.isSessionAfternoon(toSession) ? 1 : 0.5;

  for (let i = 1; i < dates.length - 1; i++) {
    total += 1;
  }

  this.totalDays = total;
}


private isSessionMorning(sessionValue: any): boolean {
    // adapt mapping if your session labels differ
    if (!sessionValue) return true;
    const s = String(sessionValue).toLowerCase();
    return s.includes('1') || s.includes('am') || s.includes('morning') || s.includes('session1');
  }

  // Determine if session is afternoon (session2)
  private isSessionAfternoon(sessionValue: any): boolean {
    if (!sessionValue) return false;
    const s = String(sessionValue).toLowerCase();
    return s.includes('2') || s.includes('pm') || s.includes('afternoon') || s.includes('session2');
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
   private enumerateDates(start: Date, end: Date): Date[] {
    const list: Date[] = [];
    let cur = this.startOfDay(start);
    const last = this.startOfDay(end);
    while (cur <= last) {
      list.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }
  private isWorkCalendarHoliday(wc: any, d: Date): boolean {
  if (!wc || !Array.isArray(wc.working_days)) return false;

  const dayName = this.weekdayNameFromCalendar(wc, d);
  const weekKey = this.getWeekNumberOfMonthKey(d);

  const weekdayEntry = wc.working_days.find(
    (entry: any) => entry.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!weekdayEntry || !Array.isArray(weekdayEntry.data)) return false;

  const allHoliday = weekdayEntry.data.find(
    (x: any) => x.key.toLowerCase() === 'all' && x.is_holiday
  );
  if (allHoliday) return true;

  const specificHoliday = weekdayEntry.data.find(
    (x: any) => x.key.toLowerCase() === weekKey && x.is_holiday
  );
  return !!specificHoliday;
}
private weekdayNameFromCalendar(wc: any, date: Date): string {
  const jsDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return jsDays[date.getDay()];
}

// private weekdayNameFromCalendar(wc: any, date: Date): string {
//   const daysFromCalendar = wc.working_days.map((d: any) => d.day);
//   console.log(daysFromCalendar)
//   if (!daysFromCalendar || daysFromCalendar.length < 7) {
//     const fallback = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     return fallback[date.getDay()];
//   }

//   const actualIndex = date.getDay();
//   const startDay = wc.work_week_starts_on;
//   const startIndex = daysFromCalendar.findIndex(
//     (d: string) => d.toLowerCase() === startDay.toLowerCase()
//   );

//   if (startIndex === -1) return daysFromCalendar[actualIndex] || daysFromCalendar[0];

//   const rotatedDays = [
//     ...daysFromCalendar.slice(startIndex),
//     ...daysFromCalendar.slice(0, startIndex),
//   ];

//   return rotatedDays[actualIndex] || rotatedDays[0];
// }

private getWeekNumberOfMonthKey(d: Date): string {
  const date = d.getDate();
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  const adjustedDate = date + firstDayOfWeek;
  const weekNumber = Math.ceil(adjustedDate / 7);
  return ['1st', '2nd', '3rd', '4th', '5th'][Math.min(weekNumber - 1, 4)];
}

  private toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    // digit-by-digit formatting to be safe
    const mmS = m < 10 ? '0' + m : String(m);
    const ddS = dd < 10 ? '0' + dd : String(dd);
    return `${y}-${mmS}-${ddS}`;
  }


}
