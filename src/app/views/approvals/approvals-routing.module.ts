import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApprovalsComponent } from './approvals.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';
import {TimesheetRequestsComponent} from './timesheet-requests/timesheet-requests.component'
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';
const routes: Routes = [
  { path: '', component: ApprovalsComponent,
    children: [
        {
            path: 'leave-requests',
            component:LeaveRequestsComponent,
        },
        {
            path: 'timesheet-requests',
            component: TimesheetRequestsComponent,
        }
    ]
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalsRoutingModule {}