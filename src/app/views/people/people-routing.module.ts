import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddCentersComponent } from './add-centers/add-centers.component';
import { AddNewTagComponent } from './add-new-tag/add-new-tag.component';
import { CentersListComponent } from './centers-list/centers-list.component';
import { CreatePeopleComponent } from './create-people/create-people.component';
import { CreatePrefixSuffixComponent } from './create-prefix-suffix/create-prefix-suffix.component';
import { PeopleListComponent } from './people-list/people-list.component';
import { PeopleComponent } from './people.component';
import { PrefixSuffixListComponent } from './prefix-suffix-list/prefix-suffix-list.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { UpdateCentreComponent } from './update-centre/update-centre.component';
import { UpdatePeopleComponent } from './update-people/update-people.component';
import { UpdatePrefixSuffixComponent } from './update-prefix-suffix/update-prefix-suffix.component';
import { UpdateTagComponent } from './update-tag/update-tag.component';

const routes: Routes = [
  {
    path:'', component:PeopleComponent, children:[
      {
        path:'create-people', component:CreatePeopleComponent
      },
      {
        path:'people-list', component: PeopleListComponent
      },
      {
        path:'create-prefix-suffix', component:CreatePrefixSuffixComponent
      },
      {
        path:'prefix-suffix-list', component: PrefixSuffixListComponent
      },
      {
        path:'centers-list', component: CentersListComponent
      },
      {
        path:'add-centers', component: AddCentersComponent
      },
      {
        path:'tag-list', component: TagListComponent
      },
      {
        path:'add-tag-list', component:AddNewTagComponent
      },
      {
        path:'updateTag/:id/:page/:tableSize', component: UpdateTagComponent
      },
      {
        path:'updateCenter/:id/:page/:tableSize', component:UpdateCentreComponent
      },
      {
        path:'updatePrefixSuffix/:id/:page/:tableSize', component:UpdatePrefixSuffixComponent
      },
      {
        path:'updatePeople/:id/:page/:tableSize', component:UpdatePeopleComponent
      },
      {
        path:'updatePeople', component:CreatePeopleComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeopleRoutingModule { }
