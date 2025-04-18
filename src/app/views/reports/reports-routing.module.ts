import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { TimesheetDetailedReportComponent } from './timesheet-detailed-report/timesheet-detailed-report.component';
import { TimesheetSummaryReportComponent } from './timesheet-summary-report/timesheet-summary-report.component';
import { EmployeeDetailsComponent } from './timesheet-summary-report/employee-details/employee-details.component'
import { ProductivityReportComponent } from './productivity-report/productivity-report.component'
const routes: Routes = [
  {
     path:'',component:ReportsComponent, children:[
      { path:'timesheet-detailed-report', component:TimesheetDetailedReportComponent },
      { path:'timesheet-summary-report', component:TimesheetSummaryReportComponent },
      { path:'employee-details', component:EmployeeDetailsComponent },
      { path:'job-productivity-report', component:ProductivityReportComponent },
      // {path:'job-time-report', component:TimesheetSummaryReportComponent},
      // {path:'job-productivity-report', component:TimesheetSummaryReportComponent},
      // {path:'job-leave-report', component:TimesheetSummaryReportComponent},
      // {path:'client-wise-job-status-report', component:TimesheetSummaryReportComponent},
      // {path:'client-wise-job-time-report', component:TimesheetSummaryReportComponent}
     ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
