import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { CountryComponent } from './country/country.component';
import { JobTypeComponent } from './job-type/job-type.component';
import { SourceComponent } from './source/source.component';
import { StatusGroupComponent } from './status-group/status-group.component';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { LeaveConfigurationComponent } from './leave-configuration/leave-configuration.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { ServicesComponent } from './services/services.component';
import { AllEmployeeComponent } from '../employee/all-employee/all-employee.component';
import { CreateUpdateEmployeeComponent } from '../employee/create-update-employee/create-update-employee.component';
import { RoleListComponent } from './role-list/role-list.component';
import { DesignationsComponent } from './designations/designations.component';
import { RolesAccessComponent } from './roles-access/roles-access.component';
import { PeriodicityComponent } from './periodicity/periodicity.component';
import { PeriodComponent } from './period/period.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';
import { TabsOfEmployeeComponent } from '../employee/tabs-of-employee/tabs-of-employee.component';



const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'country',
        component: CountryComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'job-type',
        component: JobTypeComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'source',
        component: SourceComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'status-group',
        component: StatusGroupComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'job-status',
        component: JobStatusComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'leave-type',
        component: LeaveTypeComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'leave-config',
        component: LeaveConfigurationComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'leave-config/:id',
        component: LeaveConfigurationComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'services',
        component: ServicesComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'all-employee',
        component: AllEmployeeComponent,
      },
      {
        path: 'create-employee',
        component: CreateUpdateEmployeeComponent,
        canDeactivate:[CanDeactivateGuard]

      },
      // {
      //   path: 'update-employee/:id',
      //   component: CreateUpdateEmployeeComponent,
      //   canDeactivate:[CanDeactivateGuard]

      // },
      {
        path: 'update-employee/:id',
        component: TabsOfEmployeeComponent,
        canDeactivate:[CanDeactivateGuard]

      },
      {
        path: 'roles',
        component: RoleListComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      { path: 'roles-access/:id',
        component: RolesAccessComponent
      },
      {
        path: 'designation',
        component: DesignationsComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'periodicity',
        component: PeriodicityComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'period',
        component: PeriodComponent,
        canDeactivate:[CanDeactivateGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
