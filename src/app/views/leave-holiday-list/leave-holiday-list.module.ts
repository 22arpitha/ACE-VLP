import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeaveHolidayListRoutingModule } from './leave-holiday-list-routing.module';
import { LeaveHolidayListComponent } from './leave-holiday-list.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { LeaveApplicationComponent } from './leave-application/leave-application.component';
import { LeaveMasterComponent } from './leave-master/leave-master.component';
import { OfficeWorkingDaysComponent } from './office-working-days/office-working-days.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { RequestAddLeaveComponent } from './request-add-leave/request-add-leave.component';
import { LeaveDetailsComponent } from './leave-details/leave-details.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UpdateLeaveDetailsComponent } from './update-leave-details/update-leave-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../../shared/shared.module';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';


@NgModule({
  declarations: [
    LeaveHolidayListComponent,
    MyLeavesComponent,
    LeaveApplicationComponent,
    LeaveMasterComponent,
    OfficeWorkingDaysComponent,
    RequestAddLeaveComponent,
    LeaveDetailsComponent,
    UpdateLeaveDetailsComponent,
    HolidayCalendarComponent
  ],
  imports: [ 
    CommonModule,
    LeaveHolidayListRoutingModule,
    TabsModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    NgMultiSelectDropDownModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    
  ]
})
export class LeaveHolidayListModule { }
