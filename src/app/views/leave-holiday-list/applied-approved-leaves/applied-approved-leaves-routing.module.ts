import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppliedApprovedLeavesComponent } from './applied-approved-leaves.component';

const routes: Routes = [
  {
    path:'', component:AppliedApprovedLeavesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppliedApprovedLeavesRoutingModule { }
