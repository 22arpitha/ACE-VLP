import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateDepartmentComponent } from './create-department/create-department.component';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentComponent } from './department.component';
import { UpdateDepartmentComponent } from './update-department/update-department.component';

const routes: Routes = [
  {
    path:'', component:DepartmentComponent, children:[
      {
        path:'create', component:CreateDepartmentComponent
      },
      {
        path:'list', component:DepartmentListComponent
      },
      {
        path:'update/:id',component:UpdateDepartmentComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }
