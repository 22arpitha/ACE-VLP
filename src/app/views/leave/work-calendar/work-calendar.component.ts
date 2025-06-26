import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-work-calendar',
  templateUrl: './work-calendar.component.html',
  styleUrls: ['./work-calendar.component.scss']
})
export class WorkCalendarComponent implements OnInit {
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
    { week: 'Sunday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Monday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Tuesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Wednesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Thursday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Friday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Saturday', all: false, first: false, second: false, third: false, fourth: false, fifth: false }
  ]
  filteredWeekendDays: any = this.definedWeekend;
  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private apiService: ApiserviceService,
    private fb: FormBuilder,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    // console.log('weeks', this.definedWeekend)
    this.initialform();
  }

  initialform() {
    this.workCalendarForm = this.fb.group({
      week_starts_on: ['', Validators.required],
      work_week_starts_on: ['', Validators.required],
      work_week_ends_on: ['', Validators.required],
      current_year: ['', Validators.required],
      custom_start_date: [''],
      custom_end_date: [''],
    })
  }

  get f() {
    return this.workCalendarForm.controls;
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
    console.log(week_starts_on, week_ends_on)
    const startIndex = this.definedWeekend.findIndex(item => item.week === week_starts_on);
    const endIndex = this.definedWeekend.findIndex(item => item.week === week_ends_on);
    if (startIndex === -1 || endIndex === -1) {
      this.filteredWeekendDays = [];
      return;
    }

    if (startIndex <= endIndex) {
      this.filteredWeekendDays = this.definedWeekend.slice(startIndex, endIndex + 1);
    } else {
      this.filteredWeekendDays = [
        ...this.definedWeekend.slice(startIndex),
        ...this.definedWeekend.slice(0, endIndex + 1)
      ];
    }
  }
  onRadioChange(event: any): void {
    console.log('Selected value:', event.value);
    const startCtrl = this.workCalendarForm?.get('custom_start_date');
    const endCtrl = this.workCalendarForm?.get('custom_end_date');
    if (event.value != 'Custom') {
      startCtrl?.clearValidators();
      endCtrl?.clearValidators();
      startCtrl?.setValue(null);
      endCtrl?.setValue(null);
      this.minDate = '';
    } else {
      startCtrl?.setValidators([Validators.required]);
      endCtrl?.setValidators([Validators.required]);
    }
    startCtrl?.updateValueAndValidity();
    endCtrl?.updateValueAndValidity();
  }
  startDateFun(event) {
    this.minDate = event.value
  }

  onAllSelect(day: any) {
    const val = day.all;
    day.first = val;
    day.second = val;
    day.third = val;
    day.fourth = val;
    day.fifth = val;
  }
  OnSingleSelection(day: any) {
    // if()
    console.log(day)
    if (day.first && day.second && day.third && day.fourth && day.fifth) {
      day.all = true;
    } else {
      day.all = false;
    }
    day.first = day.first;
    day.second = day.second;
    day.third = day.third;
    day.fourth = day.fourth;
    day.fifth = day.fifth;
    // console.log(this.definedWeekend)
  }
  saveWorkCalendarData() {
    if (this.workCalendarForm.invalid) {
      this.workCalendarForm.markAllAsTouched();
    } else {
      console.log(this.workCalendarForm.value)
    }
  }
  cancelAndBack() {

  }
}
