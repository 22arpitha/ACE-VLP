import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetsComponent } from './timesheets.component';
import { AllTimesheetsComponent } from './all-timesheets/all-timesheets.component';
import { CreateUpdateTimesheetComponent } from './create-update-timesheet/create-update-timesheet.component';

const routes: Routes = [
  {
    path:'',
    component: TimesheetsComponent,
    children:[
      {
        path: 'all-timesheets',
        component: AllTimesheetsComponent
      },
      {
        path: 'create-timesheet',
        component: CreateUpdateTimesheetComponent
      },
      {
        path: 'update-timesheet/:id',
        component: CreateUpdateTimesheetComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetsRoutingModule { }
