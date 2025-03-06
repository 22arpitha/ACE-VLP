import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApprovalTimesheetRoutingModule } from './approval-timesheet-routing.module';
import { ApprovalTimesheetComponent } from './approval-timesheet.component';
import { TodaysApprovalComponent } from './todays-approval/todays-approval.component';
import { DeadlineCrossedComponent } from './deadline-crossed/deadline-crossed.component';
import { MonthTimesheetComponent } from './month-timesheet/month-timesheet.component';
import { ApprovalConfigurationComponent } from './approval-configuration/approval-configuration.component';
import { TabsTimeSheetModule } from './tabs-time-sheet/tabs-time-sheet.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ApprovedComponent } from './todays-approval/approved/approved.component';
import { DeclinedComponent } from './todays-approval/declined/declined.component';
import { TimeSheetComponent } from './todays-approval/time-sheet/time-sheet.component';
import { YetApproveComponent } from './todays-approval/yet-approve/yet-approve.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MonthTimeSheetComponent } from './month-timesheet/month-time-sheet/month-time-sheet.component';
import { MonthDeclinedComponent } from './month-timesheet/month-declined/month-declined.component';
import { MonthYetApproveComponent } from './month-timesheet/month-yet-approve/month-yet-approve.component';
import { MonthApproveComponent } from './month-timesheet/month-approve/month-approve.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeadlineYettoApproveComponent } from './deadline-crossed/deadline-yetto-approve/deadline-yetto-approve.component';

@NgModule({
  declarations: [
    ApprovalTimesheetComponent,
    TodaysApprovalComponent,
    DeadlineCrossedComponent,
    MonthTimesheetComponent,
    ApprovalConfigurationComponent,
    ApprovedComponent,
    DeclinedComponent,
    TimeSheetComponent,
    YetApproveComponent,
    MonthTimeSheetComponent,
    MonthDeclinedComponent,
    MonthYetApproveComponent,
    MonthApproveComponent,
    DeadlineYettoApproveComponent,


  ],
  imports: [
    CommonModule,
    ApprovalTimesheetRoutingModule,
    TabsModule.forRoot(),
    TabsTimeSheetModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    Ng2SearchPipeModule,
    NgxPaginationModule,
    MatCardModule,
    MatRippleModule,
    NgbTooltipModule,
    NgbDropdownModule,
    SharedModule
  ]
})
export class ApprovalTimesheetModule { }
