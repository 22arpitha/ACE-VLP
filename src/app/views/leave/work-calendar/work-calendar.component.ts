import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service'
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-work-calendar',
  templateUrl: './work-calendar.component.html',
  styleUrls: ['./work-calendar.component.scss']
})
export class WorkCalendarComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Work Calendar';
  workCalendarForm: FormGroup
  minDate: any;
  weeks = [
    { week: 'Sunday' },
    { week: 'Monday' },
    { week: 'Tuesday' },
    { week: 'Wednesday' },
    { week: 'Thursday' },
    { week: 'Friday' },
    { week: 'Saturday' }
  ]
  definedWeekend = [];
  data: any = [];
  itemId: any;


  filteredWeekendDays: any = [];
  shouldDisableFields: boolean = false;
  accessPermissions = [];
  user_role_name: any;
  user_id: any;
  isEnabledEdit: boolean;
  initialFormValue: any;
  columnKeys: string[] = [];
  buttonName: string;


  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private apiService: ApiserviceService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private formErrorScrollService: FormErrorScrollUtilityService,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.initialform();
    this.getWorkCalendarData();
    this.getModuleAccess();
  }

  initialform() {
    this.workCalendarForm = this.fb.group({
      // week_starts_on: ['', Validators.required],
      work_week_starts_on: ['', Validators.required],
      work_week_ends_on: ['', Validators.required],
      year: [''],
      custom_year: ['', Validators.required],
      custom_year_start_date: [''],
      custom_year_end_date: [''],
      working_days: [this.filteredWeekendDays]
    })
    // this.initialFormValue = this.workCalendarForm?.getRawValue();
  }

  get f() {
    return this.workCalendarForm.controls;
  }

  getWorkCalendarData() {
    this.apiService.getData(`${environment.live_url}/${environment.work_calendar}/`).subscribe(
      (resData: any) => {
        // console.log(resData, 'work calendar')
        if (this.user_role_name === 'Admin') {
          this.isEnabledEdit = resData[0]?.id ? false : true;;
          this.shouldDisableFields = resData[0]?.id ? false : true;;
        } else {
          this.isEnabledEdit = true;
          this.shouldDisableFields = false;
        }
        this.workCalendarForm.patchValue({
          // week_starts_on: resData[0]?.week_starts_on,
          work_week_starts_on: resData[0]?.work_week_starts_on,
          work_week_ends_on: resData[0]?.work_week_ends_on,
          year: resData[0]?.year,
          custom_year: resData[0]?.custom_year,
          custom_year_start_date: resData[0]?.custom_year_start_date,
          custom_year_end_date: resData[0]?.custom_year_end_date,
          working_days: resData[0]?.working_days,
        });
        this.data = resData[0]?.working_days ? resData[0].working_days : resData.data;
        this.filteredWeekendDays = this.data;
        this.buildWeekendFromData();
        if (resData[0]?.id) {
          this.itemId = resData[0]?.id;
          this.selectedSartAndEndWork();
          this.rotateWeeks(resData[0]?.week_starts_on);
          this.buttonName = 'Save'
        } else {
          this.buttonName = 'Add'
        }
        // console.log(this.data, 'ddd')
        // console.log('filteredWeekendDays', this.filteredWeekendDays);

      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }

  enbleFields() {
    this.isEnabledEdit = true;
    this.shouldDisableFields = true
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        let temp = res.find((item: any) => item.name === 'End Clients');
        // console.log('temp',temp)
        this.accessPermissions = temp?.operations;
        // this.shouldDisableFields = this.accessPermissions[0]?.['create'];
        this.cdr.detectChanges();
      }
    )
  }
  onWeekStartChange(selectedDay: string) {
    this.rotateWeeks(selectedDay);
  }
  rotatedWeeks = [
    { week: 'Sunday' },
    { week: 'Monday' },
    { week: 'Tuesday' },
    { week: 'Wednesday' },
    { week: 'Thursday' },
    { week: 'Friday' },
    { week: 'Saturday' }
  ];
  rotateWeeks(startDay: string) {
    const index = this.weeks.findIndex(item => item.week === startDay);
    if (index !== -1) {
      this.rotatedWeeks = [
        ...this.weeks.slice(index),
        ...this.weeks.slice(0, index)
      ];
    }
  }

  selectedSartAndEndWork() {
    const weekStart = this.workCalendarForm.value.work_week_starts_on;
    const weekEnd = this.workCalendarForm.value.work_week_ends_on;
    const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startIndex = allDays.indexOf(weekStart);
    const endIndex = allDays.indexOf(weekEnd);

    if (startIndex < 0 || endIndex < 0) return;

    const selectedDays = startIndex <= endIndex
      ? allDays.slice(startIndex, endIndex + 1)
      : [...allDays.slice(startIndex), ...allDays.slice(0, endIndex + 1)];

    const existingMap = new Map((this.data || []).map(day => [day.day, day]));

    const keys = this.data?.find(d => d.data?.length)?.data.map(i => i.key)
      || ['all', ...Array(5).fill(null).map((_, i) => `${i + 1}st`)];

    this.filteredWeekendDays = selectedDays.map(day => {
      const existing = existingMap.get(day);
      return existing
        ? existing
        : { day, data: keys.map(key => ({ key, is_holiday: false })) };
    });

    this.columnKeys = keys;
  }
  onRadioChange(event: any): void {
    // console.log('Selected value:', event.value);
    const startCtrl = this.workCalendarForm?.get('custom_year_start_date');
    const endCtrl = this.workCalendarForm?.get('custom_year_end_date');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (!event.value) {
      startCtrl?.clearValidators();
      endCtrl?.clearValidators();
      startCtrl?.setValue(null);
      endCtrl?.setValue(null);
      this.minDate = '';
      this.workCalendarForm.patchValue({ year: currentYear })
    } else {
      startCtrl?.setValidators([Validators.required]);
      endCtrl?.setValidators([Validators.required]);
      this.workCalendarForm.patchValue({ year: null })
    }
    startCtrl?.updateValueAndValidity();
    endCtrl?.updateValueAndValidity();
  }
  startDateFun(event) {
    this.minDate = event.value
  }

  cancelAndBack() {
    this.isEnabledEdit = false;
    this.shouldDisableFields = false;
    this.resetFormState();
  }
  

  buildWeekendFromData() {
    if (this.data.length > 0) {
      this.columnKeys = this.data[0].data.map(item => item.key);
    }
  }

  getHolidayRef(day: any, key: string): any {
    return day.data.find((d: any) => d.key === key);
  }

  onCheckboxChange(day: any, changedKey: string) {
    const changed = day.data.find((d: any) => d.key === changedKey);
    if (!changed) return;

    // If "all" is changed, update 1st to 5th
    if (changedKey === 'all') {
      const allChecked = changed.is_holiday;
      day.data.forEach((d: any) => {
        if (d.key !== 'all') d.is_holiday = allChecked;
      });
    } else {
      // If all 1st–5th are true, set 'all' to true
      const weekChecks = day.data.filter((d: any) => d.key !== 'all');
      const allTrue = weekChecks.every(d => d.is_holiday);
      const allEntry = day.data.find((d: any) => d.key === 'all');
      if (allEntry) allEntry.is_holiday = allTrue;
    }
  }

  saveWorkCalendarData() {
    this.workCalendarForm.patchValue({ working_days: this.filteredWeekendDays })
    if (this.workCalendarForm.invalid) {
      this.workCalendarForm.markAllAsTouched();
    } else {
      this.workCalendarForm.patchValue({
        custom_year_start_date: this.datepipe.transform(this.workCalendarForm?.get('custom_year_start_date')?.value, 'yyyy-MM-dd'),
        custom_year_end_date: this.datepipe.transform(this.workCalendarForm?.get('custom_year_end_date')?.value, 'yyyy-MM-dd')
      })
      if (this.buttonName == 'Add') {
        this.apiService.postData(`${environment.live_url}/${environment.work_calendar}/`, this.workCalendarForm.value).subscribe(
          (respData: any) => {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
          },
          (error: any) => {
            console.log('error', error)
          }
        )
      } else {
        this.apiService.updateData(`${environment.live_url}/${environment.work_calendar}/${this.itemId}/`, this.workCalendarForm.value).subscribe(
          (respData: any) => {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
          },
          (error: any) => {
            console.log('error', error)
          }
        )
      }
    }
  }
  resetFormState() {
    this.formGroupDirective?.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    this.initialFormValue = this.workCalendarForm?.getRawValue();
    if (this.user_role_name === 'Admin') {
      this.isEnabledEdit = false
    } else {
      this.isEnabledEdit = true
    }
    this.getWorkCalendarData();
  }

}
