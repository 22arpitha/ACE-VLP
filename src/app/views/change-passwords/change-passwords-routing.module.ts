import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordsComponent } from './change-passwords.component';

const routes: Routes = [
  {
    path:'', component:ChangePasswordsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChangePasswordsRoutingModule { }
