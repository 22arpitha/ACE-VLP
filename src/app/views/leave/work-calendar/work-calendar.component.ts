import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import {FormErrorScrollUtilityService} from '../../../service/form-error-scroll-utility-service.service'
import { Observable } from 'rxjs';
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
  definedWeekend = [
    // { week: 'Sunday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Monday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Tuesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Wednesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Thursday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Friday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    // { week: 'Saturday', all: false, first: false, second: false, third: false, fourth: false, fifth: false }
  ]
  data = [
    {
      "day": "Sunday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Monday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Tuesday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Wednesday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Thursday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Friday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    },
    {
      "day": "Saturday",
      "data": [
        {
          "key": "all",
          "is_holiday": false
        },
        {
          "key": "1st",
          "is_holiday": false
        },
        {
          "key": "2nd",
          "is_holiday": false
        },
        {
          "key": "3rd",
          "is_holiday": false
        },
        {
          "key": "4th",
          "is_holiday": false
        },
        {
          "key": "5th",
          "is_holiday": false
        }
      ]
    }

  ]



  filteredWeekendDays: any = this.data;
  shouldDisableFields: boolean = false;
  accessPermissions = [];
  user_role_name: any;
  user_id: any;
  isEnabledEdit: boolean;
  initialFormValue: any;
  columnKeys: string[] = [];


  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private apiService: ApiserviceService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private formErrorScrollService: FormErrorScrollUtilityService,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.initialform();
    this.getModuleAccess();
    this.buildWeekendFromData();
    this.workCalendarForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.workCalendarForm?.getRawValue();
      const isInvalid = this.workCalendarForm?.touched && this.workCalendarForm?.invalid;
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }

  initialform() {
    this.workCalendarForm = this.fb.group({
      week_starts_on: ['', Validators.required],
      work_week_starts_on: ['', Validators.required],
      work_week_ends_on: ['', Validators.required],
      year: [''],
      custom_year: ['', Validators.required],
      custom_year_start_date: [''],
      custom_year_end_date: [''],
      working_days: [this.filteredWeekendDays]
    })
    this.initialFormValue = this.workCalendarForm?.getRawValue();
    // console.log('david@yopmail.com', this.filteredWeekendDays)
  }

  get f() {
    return this.workCalendarForm.controls;
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
        if (this.user_role_name === 'Admin') {
          this.isEnabledEdit = false
        } else {
          this.isEnabledEdit = true
        }
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

  selectedSartAndEndWork(event: any) {
    const week_starts_on: any = this.workCalendarForm.value.work_week_starts_on;
    const week_ends_on: any = this.workCalendarForm.value.work_week_ends_on;
    const startIndex = this.data.findIndex(item => item.day === week_starts_on);
    const endIndex = this.data.findIndex(item => item.day === week_ends_on);
    if (startIndex === -1 || endIndex === -1) {
      this.filteredWeekendDays = [];
      return;
    }

    if (startIndex <= endIndex) {
      this.filteredWeekendDays = this.data.slice(startIndex, endIndex + 1);
    } else {
      this.filteredWeekendDays = [
        ...this.data.slice(startIndex),
        ...this.data.slice(0, endIndex + 1)
      ];
    }
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
      this.workCalendarForm.patchValue({ year: '' })
    }
    startCtrl?.updateValueAndValidity();
    endCtrl?.updateValueAndValidity();
  }
  startDateFun(event) {
    this.minDate = event.value
  }

  // onAllSelect(day: any) {
  //   const val = day.all;
  //   day.first = val;
  //   day.second = val;
  //   day.third = val;
  //   day.fourth = val;
  //   day.fifth = val;
  // }
  // OnSingleSelection(day: any) {
  //   // if()
  //   console.log(day)
  //   if (day.first && day.second && day.third && day.fourth && day.fifth) {
  //     day.all = true;
  //   } else {
  //     day.all = false;
  //   }
  //   day.first = day.first;
  //   day.second = day.second;
  //   day.third = day.third;
  //   day.fourth = day.fourth;
  //   day.fifth = day.fifth;
  //   // console.log(this.definedWeekend)
  // }
  
  cancelAndBack() {
    this.isEnabledEdit = false;
    this.shouldDisableFields = false;
    this.resetFormState();
  }
  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.workCalendarForm?.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged, this.workCalendarForm);
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
    if (this.workCalendarForm.invalid) {
      this.workCalendarForm.markAllAsTouched();
    } else {
      console.log(this.workCalendarForm.value)
      this.apiService.postData(`${environment.live_url}/${environment.work_calendar}`,this.workCalendarForm.value).subscribe(
        (respData:any)=>{
           this.apiService.showSuccess(respData['message']);
           this.resetFormState();
        }
      )
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
  }

}
