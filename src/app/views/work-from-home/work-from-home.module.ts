import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkFromHomeRoutingModule } from './work-from-home-routing.module';
import { WorkFromHomeComponent } from './work-from-home.component';
import { ApplyWorkFromHomeComponent } from './apply-work-from-home/apply-work-from-home.component';
import { WfhRequestsComponent } from './wfh-requests/wfh-requests.component';
import { ViewWfhRequestComponent } from './view-wfh-request/view-wfh-request.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [
    WorkFromHomeComponent,
    ApplyWorkFromHomeComponent,
    WfhRequestsComponent,
    ViewWfhRequestComponent,
  ],
  imports: [CommonModule, WorkFromHomeRoutingModule,  ReactiveFormsModule,
      FormsModule,
      SharedModule,
      HttpClientModule,
      RouterModule,
      NgMultiSelectDropDownModule,
      FullCalendarModule,],
})
export class WorkFromHomeModule {}
