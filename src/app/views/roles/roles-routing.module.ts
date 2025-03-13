import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRoleComponent } from './create-role/create-role.component';
import { RolesComponent } from './roles.component';
import { UpdateRoleComponent } from './update-role/update-role.component';
import { RolesAccessComponent } from '../settings/roles-access/roles-access.component';
import { AccountsConfigComponent } from './accounts-config/accounts-config.component';
import { RolesConfigComponent } from './roles-config/roles-config.component';
import { DepartmentConfigComponent } from './department-config/department-config.component';
import { PeopleConfigComponent } from './people-config/people-config.component';
import { LeaveHolidayConfigComponent } from './leave-holiday-config/leave-holiday-config.component';
import { TimesheetConfigComponent } from './timesheet-config/timesheet-config.component';
import { IndustrysectorConfigComponent } from './industrysector-config/industrysector-config.component';
import { ClientConfigComponent } from './client-config/client-config.component';
import { ProjectStatusConfigComponent } from './project-status-config/project-status-config.component';
import { ProjectTaskConfigComponent } from './project-task-config/project-task-config.component';
import { ProjectsComponent } from './projects/projects.component';
import { OrganizationConfigComponent } from './organization-config/organization-config.component';
import { ReviewConfigComponent } from './review-config/review-config.component';

const routes: Routes = [
  {
    path:'', component:RolesComponent, children:[
      
      {
        path:'create', component:CreateRoleComponent
      },
      {
        path:'update/:id', component:UpdateRoleComponent
      },
      {
        path:'roles-access/:id', component:RolesAccessComponent,children:[
          {
            path:'accounts-config', component:AccountsConfigComponent
          },
          {
            path:'roles-config',component:RolesConfigComponent
          },
          {
            path:'department-config',component:DepartmentConfigComponent
          },
          {
            path:'people-config',component:PeopleConfigComponent
          },
          {
            path:'leave/holiday-config',component:LeaveHolidayConfigComponent
          },
          {
            path:'timesheet-config',component:TimesheetConfigComponent
          },
          {
            path:'industry-config',component:IndustrysectorConfigComponent
          },
          {
            path:'clients-config',component:ClientConfigComponent
          },
          {
            path:'project-status-config',component:ProjectStatusConfigComponent
          },
          {
            path:'project-task-config',component:ProjectTaskConfigComponent
          },
          {
            path:'projects',component:ProjectsComponent
          },
          {
            path:'organization',component:OrganizationConfigComponent
          },
          {
            path:'review',component:ReviewConfigComponent
          }
        ]
      },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
