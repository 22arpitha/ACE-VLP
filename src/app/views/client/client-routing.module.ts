import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientComponent } from './client.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { UpdateClientComponent } from './update-client/update-client.component';

const routes: Routes = [
  {
    path:'',component:ClientComponent, children:[
      {
        path:'create', component:CreateClientComponent
      },
      {
        path:'list', component:ClientListComponent
      },
      {
        path:'update/:id/:page/:tableSize', component:UpdateClientComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
