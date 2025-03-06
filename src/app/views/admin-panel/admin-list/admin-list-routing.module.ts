
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminListComponent} from '../../admin-panel/admin-list/admin-list.component'

const routes: Routes = [
    {
      path: '',
      component: AdminListComponent
    },
    ]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AdminListRoutingModule { }