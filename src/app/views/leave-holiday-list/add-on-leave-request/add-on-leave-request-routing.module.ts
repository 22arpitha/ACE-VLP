import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddOnLeaveRequestComponent } from './add-on-leave-request.component';

const routes: Routes = [
  {
    path:'',component:AddOnLeaveRequestComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddOnLeaveRequestRoutingModule { }
