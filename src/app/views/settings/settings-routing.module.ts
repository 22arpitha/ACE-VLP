import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { CountryComponent } from './country/country.component';
import { JobTypeComponent } from './job-type/job-type.component';
import { SourceComponent } from './source/source.component';
import { StatusGroupComponent } from './status-group/status-group.component';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { JobStatusComponent } from './job-status/job-status.component';


const routes: Routes = [
  {
      path: '',
      component: SettingsComponent,
      children:[
        {
          path: 'country',
          component: CountryComponent,
        },
        {
          path: 'job-type',
          component: JobTypeComponent,
        },
        {
          path: 'source',
          component: SourceComponent,
        },
        {
          path: 'status-group',
          component: StatusGroupComponent,
        },
        {
          path: 'job-status',
          component: JobStatusComponent,
        },
        {
          path: 'leave-type',
          component: LeaveTypeComponent,
        },
      ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
