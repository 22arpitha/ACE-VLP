import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNewProjectComponent } from './create-new-project/create-new-project.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectComponent } from './project.component';
import { UpdateProjectComponent } from './update-project/update-project.component';

const routes: Routes = [
  {
    path:'', component: ProjectComponent, children:[
      {
        path:'create', component: CreateNewProjectComponent
      },
      {
        path:'list', component: ProjectListComponent
      },
      {
        path:'update/:id', component: UpdateProjectComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
