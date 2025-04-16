import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs.component';
import { AllJobsComponent } from './all-jobs/all-jobs.component';
import { CreateUpdateJobComponent } from './create-update-job/create-update-job.component';
import { JobKpiComponent } from './job-kpi/job-kpi.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';

const routes: Routes = [
    {
      path: '',
      component:JobsComponent,
      children:[
         {
                path: 'all-jobs',
                component: AllJobsComponent,
              },
              {
                path: 'create-job',
                component: CreateUpdateJobComponent,
                canDeactivate:[CanDeactivateGuard]
              },
              {
                path: 'update-job/:id',
                component: CreateUpdateJobComponent,
                canDeactivate:[CanDeactivateGuard]
              },
              {
                path: 'update-kpi/:id',
                component: JobKpiComponent,
                canDeactivate:[CanDeactivateGuard]
              },
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule { }
