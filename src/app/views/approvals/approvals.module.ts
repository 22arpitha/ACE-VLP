import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalsComponent } from './approvals.component';
import { ApprovalsRoutingModule } from './approvals-routing.module';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    ApprovalsComponent,
    LeaveRequestsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ApprovalsRoutingModule
  ]
})
export class ApprovalsModule { }
