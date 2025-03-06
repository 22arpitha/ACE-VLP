import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectStatusRoutingModule } from './project-status-routing.module';
import { ProjectStatusComponent } from './project-status.component';
import { SubCategoryListComponent } from './sub-category-list/sub-category-list.component';
import { MainCategoryListComponent } from './main-category-list/main-category-list.component';
import { CreateSubCategoryListComponent } from './create-sub-category-list/create-sub-category-list.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { CreateMainCategoryListComponent } from './create-main-category-list/create-main-category-list.component';
import { UpdateMainCategoryComponent } from './update-main-category/update-main-category.component';
import { UpdateSubCategoryComponent } from './update-sub-category/update-sub-category.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';




@NgModule({
  declarations: [
    ProjectStatusComponent,
    SubCategoryListComponent,
    MainCategoryListComponent,
    CreateSubCategoryListComponent,
    CreateMainCategoryListComponent,
    UpdateMainCategoryComponent,
    UpdateSubCategoryComponent
    
  ],
  imports: [
    CommonModule,
    ProjectStatusRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule
  ]
})
export class ProjectStatusModule { }
