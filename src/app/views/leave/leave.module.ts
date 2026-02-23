import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LeaveRoutingModule } from './leave-routing.module';
import { WorkCalendarComponent } from './work-calendar/work-calendar.component';
import { LeaveApplyComponent } from './leave-apply/leave-apply.component';
import { SharedModule } from '../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LeaveComponent } from './leave.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';
import { CreateUpdateHolidayComponent } from './create-update-holiday/create-update-holiday.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomizeBalanceComponent } from './customize-balance/customize-balance.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { CompensatoryRequestComponent } from './compensatory-request/compensatory-request.component';
import { AddCompoffRequestComponent } from './add-compoff-request/add-compoff-request.component';
import { AddCustomizeBalanceComponent } from './add-customize-balance/add-customize-balance.component';
import { ViewLeaveRequestComponent } from './view-leave-request/view-leave-request.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { CompOffGrantComponent } from './comp-off-grant/comp-off-grant.component';
import { LeaveApplyAdminComponent } from './leave-apply-admin/leave-apply-admin.component';
import { ResourceAvailabilityComponent } from './resource-availability/resource-availability.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { WorkFromHomeComponent } from './work-from-home/work-from-home.component';
import { WfhRequestsComponent } from './wfh-requests/wfh-requests.component';
import { ViewWfhRequestComponent } from './view-wfh-request/view-wfh-request.component';
import { MatDialogModule } from '@angular/material/dialog';
@NgModule({
  declarations: [
    WorkCalendarComponent,
    LeaveApplyComponent,
    LeaveComponent,
    HolidayListComponent,
    CreateUpdateHolidayComponent,
    DashboardComponent,
    CustomizeBalanceComponent,
    LeaveRequestComponent,
    CompensatoryRequestComponent,
    AddCompoffRequestComponent,
    AddCustomizeBalanceComponent,
    ViewLeaveRequestComponent,
    UserDashboardComponent,
    MyLeavesComponent,
    CompOffGrantComponent,
    LeaveApplyAdminComponent,
    ResourceAvailabilityComponent,
    WorkFromHomeComponent,
    WfhRequestsComponent,
    ViewWfhRequestComponent,
  ],
  imports: [
    CommonModule,
    LeaveRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
    RouterModule,
    NgMultiSelectDropDownModule,
    FullCalendarModule,
    MatDialogModule
  ]
})
export class LeaveModule { }
