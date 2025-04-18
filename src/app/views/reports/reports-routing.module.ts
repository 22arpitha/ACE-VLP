import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TimesheetDetailedReportComponent } from './timesheet-detailed-report/timesheet-detailed-report.component';
import { TimesheetSummaryReportComponent } from './timesheet-summary-report/timesheet-summary-report.component';
import { EmployeeDetailsComponent } from './timesheet-summary-report/employee-details/employee-details.component'
import { ProductivityReportComponent } from './productivity-report/productivity-report.component'
import { JobStatusReportComponent } from './job-status-report/job-status-report.component';
import {JobTimeReportsComponent} from './job-time-reports/job-time-reports.component'
const routes: Routes = [
  {
     path:'',component:ReportsComponent, children:[
      {path:'timesheet-detailed-report', component:TimesheetDetailedReportComponent},
      {path:'timesheet-summary-report', component:TimesheetSummaryReportComponent},
      {path:'employee-details', component:EmployeeDetailsComponent},
      {path:'job-productivity-report', component:ProductivityReportComponent },
      {path:'job-time-report', component: JobTimeReportsComponent},
      {path:'job-status-report', component:JobStatusReportComponent}
     ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
