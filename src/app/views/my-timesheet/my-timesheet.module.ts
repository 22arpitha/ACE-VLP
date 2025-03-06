import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyTimesheetRoutingModule } from './my-timesheet-routing.module';
import { MyTimesheetComponent } from './my-timesheet.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { CalenderComponent } from './calender/calender.component';
import { CreateTimesheetComponent } from './create-timesheet/create-timesheet.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TabsMyTimesheetModule } from './tabs-my-timesheet/tabs-my-timesheet.module';

import { ModalModule } from 'ngx-bootstrap/modal';
import { MatTimepickerModule } from 'mat-timepicker';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ApprovedComponent } from './timesheet/approved/approved.component';
import { DeclineComponent } from './timesheet/decline/decline.component';
import { FlaggedComponent } from './timesheet/flagged/flagged.component';
import { YetToApproveComponent } from './timesheet/yet-to-approve/yet-to-approve.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  declarations: [
    MyTimesheetComponent,
    TimesheetComponent,
    CalenderComponent,
    CreateTimesheetComponent,
    ApprovedComponent,
    DeclineComponent,
    FlaggedComponent,
    YetToApproveComponent
  ],
  imports: [
    CommonModule,
    MyTimesheetRoutingModule,
    TabsModule.forRoot(),
    TabsMyTimesheetModule,
    ModalModule ,
    MatTimepickerModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FullCalendarModule,
    ToastrModule.forRoot(),
    NgbTooltipModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    SharedModule,
    NgMultiSelectDropDownModule
  ],
  
  
})
export class MyTimesheetModule { }
