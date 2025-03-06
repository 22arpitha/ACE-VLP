import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalConfigurationComponent } from './approval-configuration/approval-configuration.component';
import { ApprovalTimesheetComponent } from './approval-timesheet.component';
import { DeadlineCrossedComponent } from './deadline-crossed/deadline-crossed.component';
import { MonthTimesheetComponent } from './month-timesheet/month-timesheet.component';
import { TodaysApprovalComponent } from './todays-approval/todays-approval.component';

const routes: Routes = [
  {
    path:'', component:ApprovalTimesheetComponent, children:[
      {
        path:'todayApproval',component:TodaysApprovalComponent
      },
      {
        path:'deadlineCrossed', component:DeadlineCrossedComponent
      },
      {
        path:'monthTimesheet', component:MonthTimesheetComponent
      },
      {
        path:'approvalConfiguration', component:ApprovalConfigurationComponent
      }
    ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalTimesheetRoutingModule { }
