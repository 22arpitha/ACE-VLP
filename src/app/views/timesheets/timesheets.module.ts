import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsComponent } from './timesheets.component';
import { AllTimesheetsComponent } from './all-timesheets/all-timesheets.component';
import { CreateUpdateTimesheetComponent } from './create-update-timesheet/create-update-timesheet.component';


@NgModule({
  declarations: [
    TimesheetsComponent,
    AllTimesheetsComponent,
    CreateUpdateTimesheetComponent
  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
  ]
})
export class TimesheetsModule { }
