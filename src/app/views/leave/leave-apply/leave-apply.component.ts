import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompOffGrantComponent } from '../comp-off-grant/comp-off-grant.component';
@Component({
  selector: 'app-leave-apply',
  templateUrl: './leave-apply.component.html',
  styleUrls: ['./leave-apply.component.scss'],
})
export class LeaveApplyComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  leave_balance: any = 'NA';
  selectedLeaveTypeName:any;
  employeeActive:boolean;
  emppoyeeActive:any
  user_id: any;
  allleavetypeList: any = [];
  BreadCrumbsTitle: any = 'Leave Request';
  sessions: any = [
    { value: 'session 1', label: 'Session 1' },
    { value: 'session 2', label: 'Session 2' },
  ];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  leaveApplyForm!: FormGroup;
  allEmployeeEmailsList: any = [];
  // filteredEmails: any = [];
  reportinManagerDetails: any = [];
  fileDataUrl: string | ArrayBuffer | null = null;
  // @ViewChild('fileInput') fileInput: ElementRef;
  uploadFile: any;
  url: any;
  fileUrl: string | ArrayBuffer;
  minDate: any;

  emailCtrl = new FormControl('');
  filteredEmails!: Observable<{ email: string }[]>;
  selectedEmails: string[] = [];
  ccEmailsList: any = [];
  holidayList:any
  workCalendar:any
  genders =[{name:'Male',value:'1',value_check:'male'},{name:'Female',value:'2',value_check:'female'},{name:'Others',value:'3',value_check:'others'}]
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }
  removeImage(){
    this.selectedFile = null;
    this.fileName = '';
    this.fileDataUrl = '';
  }

  constructor(
    private apiService: ApiserviceService,
    private common_service: CommonServiceService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filteredEmails = this.emailCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) =>
        value ? this._filter(value) : this.ccEmailsList.slice()
      )
    );

    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.initialForm();
    this.getAllEmployeeList2();
    this.getUserData();
    this.getAllLeaveTypes();
    this.workCalendarlist();
    this.holidaylistsss();
    this.leaveApplyForm.get('from_date')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('to_date')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('from_session')?.valueChanges.subscribe(() => this.computeTotalDays());
    this.leaveApplyForm.get('to_session')?.valueChanges.subscribe(() => this.computeTotalDays());
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
employeeGender:any;
  getUserData(){
     this.apiService.getUserById(this.user_id).subscribe((res:any) => {
     this.employeeGender  = this.genders.find((x:any)=>x.value == res?.user__gender)
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

  getAllEmployeeList2() {
    this.apiService.getAllEmployees2().subscribe((res: any) => {
      this.ccEmailsList = res;
    });
  }

  onLeaveTypeChange(event: any) {
    let temp = this.allleavetypeList.find((item: any) => item.leave_type_id === event.value)
    this.selectedLeaveTypeName = temp.leave_type.toLowerCase() || ''
    this.leave_balance = temp.closing_balance_leave;
          this.employeeActive = temp.is_active;
         if (this.selectedLeaveTypeName.includes('paternity') || 
          this.selectedLeaveTypeName.includes('maternity')) {
          this.leaveApplyForm.controls['attachment'].setValidators([Validators.required]);
        } else {
          this.leaveApplyForm.controls['attachment'].setValidators(null); 
          this.leaveApplyForm.controls['attachment'].setErrors(null);
        }
        this.leaveApplyForm.controls['attachment'].updateValueAndValidity();
  }

  initialForm() {
    this.leaveApplyForm = this.fb.group({
      leave_type: ['', Validators.required],
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      from_session: ['', Validators.required],
      to_session: ['', Validators.required],
      cc: [''],
      reporting_to: ['', Validators.required],
      message: ['', Validators.required],
      attachment: [''],
      employee: [this.user_id],
      number_of_leaves_applying_for:[]
    });
  }

  public get f() {
    return this.leaveApplyForm.controls;
  }

  public getAllLeaveTypes() {
    this.allleavetypeList = [];
    this.apiService
      .getData(`${environment.live_url}/${environment.employees_leave}/?employee=${this.user_id}`)
      .subscribe(
        (respData: any) => {
          this.allleavetypeList = respData?.results?.filter((item:any)=>item.is_active===true && (item.leave_for===this.employeeGender?.value_check || item.leave_for==='all employees'));
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }
  isLeaveTypeDisabled(leave: any): boolean {
  if (!leave || !leave.leave_type) return false;
  const type = leave.leave_type.toLowerCase();
  return (
    (type.includes('maternity') || type.includes('paternity')) &&
    !leave.is_maternity_and_paternity_enabled
  );
}

  startDate: Date | null = null;
  endDate: Date | null = null;
  session1: string | null = null; // "first" or "second"
  session2: string | null = null; // "first" or "second"
  totalDays: number = 0;
  DateError: any;

  calculateDays() {
    if (!this.startDate || !this.endDate) {
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

    console.log(total)
    this.totalDays = total;
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
  my_calendar:any;
  allowDaysCounting:boolean = false
  getWorkingDays(date: Date) {
    this.apiService
      .getData(`${environment.live_url}/${environment.work_calendar}/`)
      .subscribe((res: any) => {
        this.working_day_data = res[0]['working_days'];
        this.my_calendar = res[0]
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
    // let new_date: any = this.convertDateTime(event.value);
    // this.startDate = event.value;
    // this.minDate = event.value;
    // this.calculateDays();

    // this.getWorkingDays(event.value);

    // this.leaveApplyForm.patchValue({ from_date: new_date });

    // let recurringHolidayCount = this.countHolidays(
    //   this.startDate,
    //   this.endDate
    // );

    // this.getHolidayCalender(
    //   this.startDate,
    //   this.endDate,
    //   (fixedHolidayCount) => {
    //     this.totalDays =
    //       this.totalDays - (recurringHolidayCount + fixedHolidayCount);
    //   }
    // );
  }

  endDateFun(event: any) {
    // let new_date: any = this.convertDateTime(event.value);
    // this.endDate = event.value;
    // this.getWorkingDays(event.value);
    // this.calculateDays();
    // this.leaveApplyForm.patchValue({ to_date: new_date });

    // let recurringHolidayCount = this.countHolidays(
    //   this.startDate,
    //   this.endDate
    // );
    // this.getHolidayCalender(
    //   this.startDate,
    //   this.endDate,
    //   (fixedHolidayCount) => {
    //     this.totalDays =
    //       this.totalDays - (recurringHolidayCount + fixedHolidayCount);
    //   }
    // );
  }

  sessionFun1(event: any) {
    // this.session1 = event.value; // "first" or "second"
    // let recurringHolidayCount = this.countHolidays(
    //   this.startDate,
    //   this.endDate
    // );
    // this.getHolidayCalender(
    //   this.startDate,
    //   this.endDate,
    //   (fixedHolidayCount) => {
    //     this.totalDays =
    //       this.totalDays - (recurringHolidayCount + fixedHolidayCount);
    //   }
    // );
    // this.calculateDays();
  }

  sessionFun2(event: any) {
    // this.session2 = event.value;
    // let recurringHolidayCount = this.countHolidays(
    //   this.startDate,
    //   this.endDate
    // );
    // this.getHolidayCalender(
    //   this.startDate,
    //   this.endDate,
    //   (fixedHolidayCount) => {
    //     this.totalDays =
    //       this.totalDays - (recurringHolidayCount + fixedHolidayCount);
    //   }
    // );
    // this.calculateDays();
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
          this.reportinManagerDetails = this.allEmployeeEmailsList.find(
            (emp: any) => emp.user_id === Number(this.user_id)
          );
          // console.log(
          //   'this.reportinManagerDetails',
          //   this.user_id,
          //   this.reportinManagerDetails
          // );
        },
        (error) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  

  private _excludeSelected(): string[] {
    return this.ccEmailsList.filter(
      (email) => !this.selectedEmails.includes(email)
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedEmails.includes(value)) {
      this.selectedEmails.push(value);
    }
    // event.chipInput!.clear();
    if (event.input) {
      event.input.value = '';
    }
    this.emailCtrl.setValue(null);
  }

  remove(email: string): void {
    const index = this.selectedEmails.indexOf(email);
    if (index >= 0) {
      this.selectedEmails.splice(index, 1);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.ccEmailsList.filter((email:any) =>
      email.toLowerCase().includes(filterValue)
    );
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedEmails.includes(event.option.viewValue)) {
      this.selectedEmails.push(event.option.viewValue);
    }
    this.emailInput.nativeElement.value = '';
    this.emailCtrl.setValue(null);
  }
// drag drop function
  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();    // required for drop to work
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    // Accept images only
    if (!file.type.startsWith('image/')) {
      this.apiService.showError("Only image files are allowed.");
      return;
    }

    this.handleDroppedImage(file);
  }

  handleDroppedImage(file: File) {
    this.selectedFile = file;
    this.fileName = file.name;
    this.leaveApplyForm.get('file')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => (this.fileDataUrl = reader.result);
    reader.readAsDataURL(file);
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

  private _isValidEmail(email: string): boolean {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EMAIL_REGEX.test(email);
  }

  onSubmit(): void {
    let new_start_date: any = this.convertDateTime(this.getDateFromControl('from_date'));
    let new_end_date: any = this.convertDateTime(this.getDateFromControl('to_date'));
  // prepare cc and file
  this.leaveApplyForm.patchValue({ 
    cc: JSON.stringify(this.selectedEmails),
    number_of_leaves_applying_for:this.totalDays,
    from_date:new_start_date,to_date: new_end_date});
  if (this.selectedFile) {
    this.leaveApplyForm.patchValue({ attachment: this.selectedFile });
  }

  // basic form validation
  if (this.leaveApplyForm.invalid) {
    console.log(this.leaveApplyForm.value)
    this.leaveApplyForm.markAllAsTouched();
    return;
  }

  // get leave type config
  const leaveTypeId = this.leaveApplyForm.get('leave_type')?.value;
  const leaveTypeData = this.allleavetypeList?.find((l: any) => l.leave_type_id === leaveTypeId);

  const fromDateRaw = this.leaveApplyForm.get('from_date')?.value;
  const toDateRaw = this.leaveApplyForm.get('to_date')?.value;

  if (!fromDateRaw || !toDateRaw) {
    this.apiService.showError('Please select both From and To dates');
    return;
  }

  // normalize dates to midnight
  const msPerDay = 24 * 60 * 60 * 1000;
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  const fromDate = new Date(fromDateRaw);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = new Date(toDateRaw);
  toDate.setHours(0, 0, 0, 0);

    if (fromDate < current) {
    if (leaveTypeData?.utilization_after && Number(leaveTypeData.utilization_after) > 0) {
      if (toDate < current) {
        // Count days from current date to TO date, excluding TO date
        const daysDiff = Math.floor((current.getTime() - toDate.getTime()) / msPerDay);
        if (daysDiff > Number(leaveTypeData.utilization_after)) {
          this.apiService.showError(
            `${leaveTypeData.leave_type} leave cannot be applied. It must be within ${leaveTypeData.utilization_after} day(s) from leave date.`
          );
          return;
        }
      }
    }
  }

  if (fromDate >= current) {
    if (leaveTypeData?.utilization_before && Number(leaveTypeData.utilization_before) > 0) {
      const daysDiff = Math.floor((fromDate.getTime() - current.getTime()) / msPerDay);
      if (daysDiff < Number(leaveTypeData.utilization_before)) {
        this.apiService.showError(
          `${this.selectedLeaveTypeName} must be applied at least ${leaveTypeData.utilization_before} days before the leave date`
          // `You cannot apply this leave. You must apply at least ${leaveTypeData.utilization_before} day(s) in advance.`
        );
        return;
      }
    }
  }

  // passed all checks → submit
  const formData = new FormData();
  Object.keys(this.leaveApplyForm.value).forEach((key) => {
    const value = this.leaveApplyForm.value[key];
    formData.append(key, value);
  });
  this.apiService
    .postData(`${environment.live_url}/${environment.apply_leaves}/`, formData)
    .subscribe(
      (res: any) => {
        this.apiService.showSuccess(res.message);
        this.resetFormState();
      },
      (err) => {
        this.apiService.showError(err?.error?.detail);
      }
    );
}

  public resetFormState() {
    this.totalDays = 0;
    this.fileDataUrl = '';
    this.selectedFile = null;
    this.fileName = '';
    this.selectedEmails = []
    this.leave_balance = 0
    this.formGroupDirective?.resetForm();
    this.initialForm()
  }

  openGrantCompOff(){
      this.dialog.open(CompOffGrantComponent, {
             data: { employee: false},
             panelClass: 'custom-details-dialog',
             disableClose: true
           });
           this.dialog.afterAllClosed.subscribe((resp: any) => {
             // console.log('resp',resp);
            //  this.initalCall();
           });
       
  }

  isApplyDisabled(): boolean {
    if (!this.employeeActive) {
      return true;
    }
    if (this.selectedLeaveTypeName === 'loss of pay') {
      return false; 
    }
    if (this.leave_balance === 0) {
      return true;
    }
    return false;
  }
  
// day calculations
computeTotalDays(): void {
  const from: Date | null = this.getDateFromControl('from_date');
  this.minDate = from;
  const to: Date | null = this.getDateFromControl('to_date');
  const fromSession = this.leaveApplyForm.get('from_session')?.value;
  const toSession = this.leaveApplyForm.get('to_session')?.value;

  if (!from || !to || !fromSession || !toSession) {
    this.totalDays = 0;
    return;
  }

  const start = this.startOfDay(from);
  const end = this.startOfDay(to);
  if (end < start) {
    this.totalDays = 0;
    return;
  }

  const dates = this.enumerateDates(start, end);
  const wc = this.workCalendar;
  const holidayDatesSet = new Set(this.holidayList.map(h => h.date)); // 'YYYY-MM-DD'

  const shouldSkipDate = (d: Date): boolean => {
    const iso = this.toISODate(d);
    if (holidayDatesSet.has(iso)) return true;

    if (!wc) return false;

    // CASE 1 — custom_year = false
    if (wc.custom_year === false) {
      if (wc.year === d.getFullYear()) {
        return this.isWorkCalendarHoliday(wc, d);
      } else {
        // Year mismatch → ignore work calendar
        return false;
      }
    }

    // CASE 2 — custom_year = true
    if (wc.custom_year === true) {
      if (wc.custom_year_start_date && wc.custom_year_end_date) {
        const startRange = this.startOfDay(new Date(wc.custom_year_start_date));
        const endRange = this.startOfDay(new Date(wc.custom_year_end_date));
        if (d >= startRange && d <= endRange) {
          return this.isWorkCalendarHoliday(wc, d);
        } else {
          // Outside custom-year range → ignore
          return false;
        }
      } else {
        // If dates not defined → ignore
        return false;
      }
    }

    return false;
  };

  // ==== Day Count Logic ====
  let total = 0;

  if (dates.length === 1) {
    const d = dates[0];
    if (shouldSkipDate(d)) {
      this.totalDays = 0;
      return;
    }

    total = (fromSession === toSession) ? 0.5 : 1;
    this.totalDays = total;
    return;
  }

  const firstDate = dates[0];
  if (!shouldSkipDate(firstDate)) {
    total += this.isSessionMorning(fromSession) ? 1 : 0.5;
  }

  const lastDate = dates[dates.length - 1];
  if (!shouldSkipDate(lastDate)) {
    total += this.isSessionAfternoon(toSession) ? 1 : 0.5;
  }

  for (let i = 1; i < dates.length - 1; i++) {
    const d = dates[i];
    if (!shouldSkipDate(d)) total += 1;
  }

  this.totalDays = total;
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
  const daysFromCalendar = wc.working_days.map((d: any) => d.day);

  if (!daysFromCalendar || daysFromCalendar.length < 7) {
    const fallback = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return fallback[date.getDay()];
  }

  const actualIndex = date.getDay();
  const startDay = wc.work_week_starts_on;
  const startIndex = daysFromCalendar.findIndex(
    (d: string) => d.toLowerCase() === startDay.toLowerCase()
  );

  if (startIndex === -1) return daysFromCalendar[actualIndex] || daysFromCalendar[0];

  const rotatedDays = [
    ...daysFromCalendar.slice(startIndex),
    ...daysFromCalendar.slice(0, startIndex),
  ];

  return rotatedDays[actualIndex] || rotatedDays[0];
}

private getWeekNumberOfMonthKey(d: Date): string {
  const date = d.getDate();
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  const adjustedDate = date + firstDayOfWeek;
  const weekNumber = Math.ceil(adjustedDate / 7);
  return ['1st', '2nd', '3rd', '4th', '5th'][Math.min(weekNumber - 1, 4)];
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

  // return yyyy-mm-dd
  private toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    // digit-by-digit formatting to be safe
    const mmS = m < 10 ? '0' + m : String(m);
    const ddS = dd < 10 ? '0' + dd : String(dd);
    return `${y}-${mmS}-${ddS}`;
  }

  // strip time part
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // enumerate inclusive dates between start and end (both Date objects)
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

  // Determine if session is morning (session1)
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


}
