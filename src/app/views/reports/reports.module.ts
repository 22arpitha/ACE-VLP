import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { TimesheetDetailedReportComponent } from './timesheet-detailed-report/timesheet-detailed-report.component';
import { TimesheetSummaryReportComponent } from './timesheet-summary-report/timesheet-summary-report.component';
import { EmployeeDetailsComponent } from './timesheet-summary-report/employee-details/employee-details.component';
import { ProductivityReportComponent } from './productivity-report/productivity-report.component';
import { ProductivityReportModule } from './productivity-report/productivity-report.module';
import { JobStatusReportComponent } from './job-status-report/job-status-report.component';
import { JobTimeReportsComponent } from './job-time-reports/job-time-reports.component';
import { JobTimeSheetDetailsPopupComponent } from './common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { NonProductiveHoursComponent } from './non-productive-hours/non-productive-hours.component';
import { TimesheetsSummaryReportComponent } from './timesheets-summary-report/timesheets-summary-report.component';
import { LeaveSummaryReportComponent } from './leave-summary-report/leave-summary-report.component';
import { LeaveTransactionReportComponent } from './leave-transaction-report/leave-transaction-report.component';


@NgModule({
  declarations: [
    ReportsComponent,
    TimesheetDetailedReportComponent,
    TimesheetSummaryReportComponent,
    EmployeeDetailsComponent,
    ProductivityReportComponent,
    JobStatusReportComponent,
    JobTimeReportsComponent,
    JobTimeSheetDetailsPopupComponent,
    NonProductiveHoursComponent,
    TimesheetsSummaryReportComponent,
    LeaveSummaryReportComponent,
    LeaveTransactionReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    ProductivityReportModule,
    SharedModule
  ]
})
export class ReportsModule { }
