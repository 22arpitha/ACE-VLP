import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetsComponent } from './timesheets.component';
import { AllTimesheetsComponent } from './all-timesheets/all-timesheets.component';
import { CreateUpdateTimesheetComponent } from './create-update-timesheet/create-update-timesheet.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';
import { DayEndReportsComponent } from './day-end-reports/day-end-reports.component';

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
        component: CreateUpdateTimesheetComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'update-timesheet/:id',
        component: CreateUpdateTimesheetComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'day-end-reports',
        component: DayEndReportsComponent,
        canDeactivate:[CanDeactivateGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetsRoutingModule { }
