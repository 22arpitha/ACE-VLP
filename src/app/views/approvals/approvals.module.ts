import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalsComponent } from './approvals.component';
import { ApprovalsRoutingModule } from './approvals-routing.module';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { SharedModule } from '../../shared/shared.module';
import { TimesheetRequestsComponent } from './timesheet-requests/timesheet-requests.component';
import { ViewTimesheetRequestComponent } from './view-timesheet-request/view-timesheet-request.component';



@NgModule({
  declarations: [
    ApprovalsComponent,
    LeaveRequestsComponent,
    TimesheetRequestsComponent,
    ViewTimesheetRequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ApprovalsRoutingModule
  ]
})
export class ApprovalsModule { }