import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientComponent } from './client.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { TabsListComponent } from './tabs-list/tabs-list.component';
import {JobsOfEndclientComponent} from './jobs-of-endclient/jobs-of-endclient.component'
import { ClientsOfGroupComponent } from './clients-of-group/clients-of-group.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';
const routes: Routes = [
  {
    path:'',component:ClientComponent, children:[
      {
        path:'create', component:CreateClientComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path:'all-client', component:ClientListComponent
      },
      {
        path:'update-client/:id', component:TabsListComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path:'end-client-jobs/:end-client-name/:client-id/:id', component: JobsOfEndclientComponent,
      },
      {
        path:'client-groups/:group-client-name/:client-id/:id', component: ClientsOfGroupComponent,
      },
      // {
      //   path:'update/:id', component:UpdateClientComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
