import { NgModule} from '@angular/core';
import { RouterModule,Routes } from '@angular/router';
import { OrganizationComponent } from './organization.component'
//import { CreateOrganizationComponent } from './create-organization/create-organization.component';
import { UpdateOrganizationComponent } from './update-organization/update-organization.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { AddOrganizationComponent } from './add-organization/add-organization.component';
import { SubscriptionConfigComponent } from './subscription-config/subscription-config.component';

const routes: Routes = [
    {
      path:'', component:OrganizationComponent,
      children:[
      {
        path:'createOrg',component:AddOrganizationComponent
      },
      {
        path:'updateOrg/:id',component:UpdateOrganizationComponent
      },
      {
        path:'orgList',component:OrganizationListComponent
      },
      
    ]
    },
    
  ];


  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })


export class OrganizationRoutingModule{}