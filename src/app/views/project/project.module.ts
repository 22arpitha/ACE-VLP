import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { CreateNewProjectComponent } from './create-new-project/create-new-project.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UpdateProjectComponent } from './update-project/update-project.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../../shared/shared.module';




@NgModule({
  declarations: [
    ProjectComponent,
    ProjectListComponent,
    CreateNewProjectComponent,
    UpdateProjectComponent,
    // SortPipe
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    NgMultiSelectDropDownModule,
    SharedModule
  ]
})
export class ProjectModule { }
