import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsComponent } from './timesheets.component';
import { AllTimesheetsComponent } from './all-timesheets/all-timesheets.component';
import { CreateUpdateTimesheetComponent } from './create-update-timesheet/create-update-timesheet.component';
import { DayEndReportsComponent } from './day-end-reports/day-end-reports.component';
import { JobTimeDailyReportComponent } from './job-time-daily-report/job-time-daily-report.component';
import { JobStatusDailyReportComponent } from './job-status-daily-report/job-status-daily-report.component';
import { RequestUnlockComponent } from './request-unlock/request-unlock.component';


@NgModule({
  declarations: [
    TimesheetsComponent,
    AllTimesheetsComponent,
    CreateUpdateTimesheetComponent,
    DayEndReportsComponent,
    JobTimeDailyReportComponent,
    JobStatusDailyReportComponent,
    RequestUnlockComponent
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
  ]
})
export class TimesheetsModule { }
