import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LeaveComponent} from'./leave.component';
import {WorkCalendarComponent} from './work-calendar/work-calendar.component';
import { LeaveApplyComponent } from './leave-apply/leave-apply.component';
import { HolidayListComponent } from './holiday-list/holiday-list.component';

const routes: Routes = [
  {
    path:'',component: LeaveComponent, children:[
      {
        path:'work-calendar',
        component: WorkCalendarComponent,
      },
      {
        path:'leave-application',
        component: LeaveApplyComponent,
      },
      {
        path:'holidays',
        component: HolidayListComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule { }
