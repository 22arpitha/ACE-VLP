import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkFromHomeComponent } from './work-from-home.component';
import { WfhRequestsComponent } from './wfh-requests/wfh-requests.component';
import { ApplyWorkFromHomeComponent } from './apply-work-from-home/apply-work-from-home.component';

const routes: Routes = [
  {
    path: '',
    component: WorkFromHomeComponent,
    children: [
      {
        path: 'wfh-requests',
        component: WfhRequestsComponent,
      },
      {
        path: 'apply-wfh',
        component: ApplyWorkFromHomeComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkFromHomeRoutingModule {}
