import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalenderComponent } from './calender/calender.component';
import { CreateTimesheetComponent } from './create-timesheet/create-timesheet.component';
import { MyTimesheetComponent } from './my-timesheet.component';
import { TimesheetComponent } from './timesheet/timesheet.component';

const routes: Routes = [
  {
    path:'', component:MyTimesheetComponent, children:[
      {
        path:'timesheet',component:TimesheetComponent
      },
      {
        path:'calender', component:CalenderComponent
      },
      {
        path:'create', component:CreateTimesheetComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyTimesheetRoutingModule { }
