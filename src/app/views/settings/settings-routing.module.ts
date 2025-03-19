import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { CountryComponent } from './country/country.component';
import { JobTypeComponent } from './job-type/job-type.component';
import { SourceComponent } from './source/source.component';
import { StatusGroupComponent } from './status-group/status-group.component';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { ServicesComponent } from './services/services.component';
import { AllEmployeeComponent } from '../employee/all-employee/all-employee.component';
import { CreateUpdateEmployeeComponent } from '../employee/create-update-employee/create-update-employee.component';
import { RoleListComponent } from './role-list/role-list.component';
import { DesignationsComponent } from './designations/designations.component';
import { RolesAccessComponent } from './roles-access/roles-access.component';



const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
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
      {
        path: 'services',
        component: ServicesComponent,
      },
      {
        path: 'all-employee',
        component: AllEmployeeComponent,
      },
      {
        path: 'create-employee',
        component: CreateUpdateEmployeeComponent,
      },
      {
        path: 'update-employee/:id',
        component: CreateUpdateEmployeeComponent,
      },
      {
        path: 'roles',
        component: RoleListComponent,

      },
      { path: 'roles-access/:id', 
        component: RolesAccessComponent 
      },
      {
        path: 'designation',
        component: DesignationsComponent,
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
