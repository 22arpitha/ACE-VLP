import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TimesheetDetailedReportComponent } from './timesheet-detailed-report/timesheet-detailed-report.component';
import { TimesheetSummaryReportComponent } from './timesheet-summary-report/timesheet-summary-report.component';
import { EmployeeDetailsComponent } from './timesheet-summary-report/employee-details/employee-details.component';
import { ProductivityReportComponent } from './productivity-report/productivity-report.component';
import { JobStatusReportComponent } from './job-status-report/job-status-report.component';
import { JobTimeReportsComponent } from './job-time-reports/job-time-reports.component';
import { NonProductiveHoursComponent } from './non-productive-hours/non-productive-hours.component';
import { TimesheetsSummaryReportComponent } from './timesheets-summary-report/timesheets-summary-report.component';
import { LeaveSummaryReportComponent } from './leave-summary-report/leave-summary-report.component';
import { LeaveTransactionReportComponent } from './leave-transaction-report/leave-transaction-report.component';
import { WfhLimitedFlexibilitySummaryReportComponent } from './wfh-limited-flexibility-summary-report/wfh-limited-flexibility-summary-report.component';
import { WfhLimitedFlexibilityTransactionReportComponent } from './wfh-limited-flexibility-transaction-report/wfh-limited-flexibility-transaction-report.component';
import { WfhProlongedHealthIssuesSummaryReportComponent } from './wfh-prolonged-health-issues-summary-report/wfh-prolonged-health-issues-summary-report.component';
import { WfhProlongedHealthIssuesTransactionReportComponent } from './wfh-prolonged-health-issues-transaction-report/wfh-prolonged-health-issues-transaction-report.component';
import { DashboardWfhComponent } from './dashboard-wfh/dashboard-wfh.component';
import { ItIssueReportsComponent } from './it-issue-reports/it-issue-reports.component';
import { NonProdSummaryComponent } from './productivity-report/non-prod-summary/non-prod-summary.component';
const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    children: [
      {
        path: 'timesheet-detailed-report',
        component: TimesheetDetailedReportComponent,
      },
      {
        path: 'week-timesheet-summary-report',
        component: TimesheetSummaryReportComponent,
      },
      {
        path: 'timesheets-summary-report',
        component: TimesheetsSummaryReportComponent,
      },
      { path: 'employee-details', component: EmployeeDetailsComponent },
      {
        path: 'job-productivity-report',
        component: ProductivityReportComponent,
      },
      { path: 'job-time-report', component: JobTimeReportsComponent },
      { path: 'job-status-report', component: JobStatusReportComponent },
      { path: 'non-productive-hours', component: NonProductiveHoursComponent },
      { path: 'leave-summary-report', component: LeaveSummaryReportComponent },
      {
        path: 'leave-transaction-report',
        component: LeaveTransactionReportComponent,
      },
      // {
      //   path: 'wfh-limited-flexibility-summary-report',
      //   component: WfhLimitedFlexibilitySummaryReportComponent,
      // },
         {
        path: 'wfh-limited-flexibility-summary-report',
        component: DashboardWfhComponent,
      },
      {
        path: 'wfh-limited-flexibility-transaction-report',
        component: WfhLimitedFlexibilityTransactionReportComponent,
      },
      // {
      //   path: 'wfh-prolonged-health-issues-summary-report',
      //   component: WfhProlongedHealthIssuesSummaryReportComponent,
      // },
        {
        path: 'wfh-prolonged-health-issues-summary-report',
        component: DashboardWfhComponent,
      },
      {
        path: 'wfh-prolonged-health-issues-transaction-report',
        component: WfhProlongedHealthIssuesTransactionReportComponent,
      },
      {
        path: 'it-issues',
        component: ItIssueReportsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
