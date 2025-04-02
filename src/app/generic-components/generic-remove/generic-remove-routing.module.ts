import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenericRemoveComponent } from './generic-remove.component';

const routes: Routes = [
  {
    path: '',
    component: GenericRemoveComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GenericRemoveRoutingModule { }
