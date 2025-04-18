import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { TimesheetDetailedReportComponent } from './timesheet-detailed-report/timesheet-detailed-report.component';
import { TimesheetSummaryReportComponent } from './timesheet-summary-report/timesheet-summary-report.component';
import { EmployeeDetailsComponent } from './timesheet-summary-report/employee-details/employee-details.component';
import { JobStatusReportComponent } from './job-status-report/job-status-report.component';
import { JobTimeReportsComponent } from './job-time-reports/job-time-reports.component';


@NgModule({
  declarations: [
    ReportsComponent,
    TimesheetDetailedReportComponent,
    TimesheetSummaryReportComponent,
    EmployeeDetailsComponent,
    JobStatusReportComponent,
    JobTimeReportsComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule { }
