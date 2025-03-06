import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNewCategoryComponent } from './add-new-category/add-new-category.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { TaskCategoryComponent } from './task-category.component';
import { UpdateTaskCategoryComponent } from './update-task-category/update-task-category.component';

const routes: Routes = [
  {
    path:'', component:TaskCategoryComponent, children:[
      {
        path:'add', component: AddNewCategoryComponent
      },
      {
        path:'list', component: CategoryListComponent
      },
      {
        path:'update/:id/:page/:tableSize', component:UpdateTaskCategoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskCategoryRoutingModule { }
