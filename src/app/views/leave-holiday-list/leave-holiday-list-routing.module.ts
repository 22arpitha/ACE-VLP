import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveDetailsComponent } from './leave-details/leave-details.component';
import { LeaveHolidayListComponent } from './leave-holiday-list.component';
import { LeaveMasterComponent } from './leave-master/leave-master.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { OfficeWorkingDaysComponent } from './office-working-days/office-working-days.component';
import { RequestAddLeaveComponent } from './request-add-leave/request-add-leave.component';
import { UpdateLeaveDetailsComponent } from './update-leave-details/update-leave-details.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';

const routes: Routes = [
  {
    path:'', component: LeaveHolidayListComponent, children:[
      {
        path:'myLeaves',component:MyLeavesComponent
      },
      {
        path:'leaveApplication',component:LeaveApplicationComponent
      },
      {
        path:'appliedApprovedLeaves', loadChildren:() => import('./applied-approved-leaves/applied-approved-leaves.module').then( m => m.AppliedApprovedLeavesModule)
      },
      {
        path:'leaveMaster', component:LeaveMasterComponent
      },
      {
        path:'officeWorkingDays',component:OfficeWorkingDaysComponent
      },
      {
        path:'addOnLeaveRequest',loadChildren:() => import('./add-on-leave-request/add-on-leave-request.module').then(m => m.AddOnLeaveRequestModule)
      },
      {
        path:'requestAddLeave', component:RequestAddLeaveComponent
      },
      {
        path:'leaveDetails', component:LeaveDetailsComponent
      },
      {
        path:'updateLeaveDetails/:id', component:UpdateLeaveDetailsComponent
      },
      {
        path:'holidayCalendar', component:HolidayCalendarComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveHolidayListRoutingModule { }
