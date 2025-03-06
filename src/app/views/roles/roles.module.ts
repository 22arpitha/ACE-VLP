import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { RoleListComponent } from './role-list/role-list.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UpdateRoleComponent } from './update-role/update-role.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RolesAccessComponent } from './roles-access/roles-access.component';
import { RolesConfigComponent } from './roles-config/roles-config.component';
import { AccountsConfigComponent } from './accounts-config/accounts-config.component';
import { DepartmentConfigComponent } from './department-config/department-config.component';
import { PeopleConfigComponent } from './people-config/people-config.component';
import { LeaveHolidayConfigComponent } from './leave-holiday-config/leave-holiday-config.component';
import { TimesheetConfigComponent } from './timesheet-config/timesheet-config.component';
import { IndustrysectorConfigComponent } from './industrysector-config/industrysector-config.component';
import { ClientConfigComponent } from './client-config/client-config.component';
import { ProjectStatusConfigComponent } from './project-status-config/project-status-config.component';
import { ProjectTaskConfigComponent } from './project-task-config/project-task-config.component';
import { ProjectsComponent } from './projects/projects.component';
import { ReviewConfigComponent } from './review-config/review-config.component';
import { OrganizationConfigComponent } from './organization-config/organization-config.component';
import { AccessToModulesComponent } from './access-to-modules/access-to-modules.component';




@NgModule({
  declarations: [
    RolesComponent,
    RoleListComponent,
    CreateRoleComponent,
    UpdateRoleComponent,
    RolesAccessComponent,
    RolesConfigComponent,
    AccountsConfigComponent,
    DepartmentConfigComponent,
    PeopleConfigComponent,
    LeaveHolidayConfigComponent,
    TimesheetConfigComponent,
    IndustrysectorConfigComponent,
    ClientConfigComponent,
    ProjectStatusConfigComponent,
    ProjectTaskConfigComponent,
    ProjectsComponent,
    ReviewConfigComponent,
    OrganizationConfigComponent,
    AccessToModulesComponent
    ],
  imports: [
    CommonModule,
    RolesRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule,
    DragDropModule
  ]
})
export class RolesModule { }
