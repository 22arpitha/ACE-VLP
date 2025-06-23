import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-work-calendar',
  templateUrl: './work-calendar.component.html',
  styleUrls: ['./work-calendar.component.scss']
})
export class WorkCalendarComponent implements OnInit {
  BreadCrumbsTitle: any = 'Work Calendar';
  workCalendarForm: FormGroup
  weeks = [
    { week: 'Sunday' },
    { week: 'Monday' },
    { week: 'Tuesday' },
    { week: 'Wednesday' },
    { week: 'Thursday' },
    { week: 'Friday' },
    { week: 'Sunday' }
  ]
  definedWeekend = [
    { week: 'Sunday', all: true, first: true, second: true, third: true, fourth: true, fifth: true },
    { week: 'Monday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Tuesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Wednesday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Thursday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Friday', all: false, first: false, second: false, third: false, fourth: false, fifth: false },
    { week: 'Sunday', all: false, first: false, second: false, third: false, fourth: false, fifth: false }
  ]
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
      week_starts_on: [''],
      work_week_starts_on: [''],
      work_week_ends_on: [''],
      half_work_day: ['']
    })
  }

  get f() {
    return this.workCalendarForm.controls;
  }
  onAllSelect(day: any) {
    const val = day.all;
    day.first = val;
    day.second = val;
    day.third = val;
    day.fourth = val;
    day.fifth = val;
  }
  OnSingleSelection(day:any){
    // if()
    console.log(day)
    if(day.first && day.second && day.third && day.fourth && day.fifth){
      day.all = true;
    } else{
      day.all = false;
    }
      day.first = day.first;
      day.second = day.second;
      day.third = day.third;
      day.fourth = day.fourth;
      day.fifth = day.fifth;
      // console.log(this.definedWeekend)
  }
}
