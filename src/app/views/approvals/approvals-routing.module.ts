import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApprovalsComponent } from './approvals.component';
import { LeaveRequestsComponent } from './leave-requests/leave-requests.component';

const routes: Routes = [
  { path: '', component: ApprovalsComponent,
    children: [
        {
            path: 'leave-requests',
            component:LeaveRequestsComponent
        }
    ]
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApprovalsRoutingModule {}
