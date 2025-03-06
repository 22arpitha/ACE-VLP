import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenericDeleteComponent } from './generic-delete.component';

const routes: Routes = [
    {
      path: '',
      component: GenericDeleteComponent
    },
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class GenericDeleteRoutingModule{}