import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateMainCategoryListComponent } from './create-main-category-list/create-main-category-list.component';
import { CreateSubCategoryListComponent } from './create-sub-category-list/create-sub-category-list.component';
import { MainCategoryListComponent } from './main-category-list/main-category-list.component';
import { ProjectStatusComponent } from './project-status.component';
import { SubCategoryListComponent } from './sub-category-list/sub-category-list.component';
import { UpdateMainCategoryComponent } from './update-main-category/update-main-category.component';
import { UpdateSubCategoryComponent } from './update-sub-category/update-sub-category.component';

const routes: Routes = [
  {
    path:'', component:ProjectStatusComponent, children:[
      {
        path:'sublist', component:SubCategoryListComponent
      },
      {
        path:'mainlist', component:MainCategoryListComponent
      },
      {
        path:'createSubCategory', component:CreateSubCategoryListComponent
      },
      {
        path:'createMainCategory', component: CreateMainCategoryListComponent
      },
      {
        path:'updateMainCategory/:id/:page/:tableSize', component:UpdateMainCategoryComponent
      },
      {
        path:'updateSubCategory/:id/:page/:tableSize', component:UpdateSubCategoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectStatusRoutingModule { }
