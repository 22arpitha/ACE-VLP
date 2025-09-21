import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LeaveComponent} from'./leave.component';
import {WorkCalendarComponent} from './work-calendar/work-calendar.component';
import { LeaveApplyComponent } from './leave-apply/leave-apply.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CompOffGrantComponent } from './comp-off-grant/comp-off-grant.component';

const routes: Routes = [
  {
    path:'',component: LeaveComponent, children:[
      {
        path:'work-calendar',
        component: WorkCalendarComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path:'leave-application',
        component: LeaveApplyComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path:'holidays',
        component: HolidayListComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path:'dashboard',
        component: DashboardComponent,
        canDeactivate:[CanDeactivateGuard]
      },
       {
        path:'comp-off-grant',
        component: CompOffGrantComponent,
        canDeactivate:[CanDeactivateGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule { }
