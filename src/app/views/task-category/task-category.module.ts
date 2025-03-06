import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskCategoryRoutingModule } from './task-category-routing.module';
import { TaskCategoryComponent } from './task-category.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { AddNewCategoryComponent } from './add-new-category/add-new-category.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UpdateTaskCategoryComponent } from './update-task-category/update-task-category.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    TaskCategoryComponent,
    CategoryListComponent,
    AddNewCategoryComponent,
    UpdateTaskCategoryComponent
    
  ],
  imports: [
    CommonModule,
    TaskCategoryRoutingModule,
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
export class TaskCategoryModule { }
