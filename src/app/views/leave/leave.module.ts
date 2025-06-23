import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LeaveRoutingModule } from './leave-routing.module';
import { WorkCalendarComponent } from './work-calendar/work-calendar.component';
import { LeaveApplyComponent } from './leave-apply/leave-apply.component';
import { SharedModule } from '../../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { LeaveComponent } from './leave.component';

@NgModule({
  declarations: [
    WorkCalendarComponent,
    LeaveApplyComponent,
    LeaveComponent
  ],
  imports: [
    CommonModule,
    LeaveRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
    RouterModule
  ]
})
export class LeaveModule { }
