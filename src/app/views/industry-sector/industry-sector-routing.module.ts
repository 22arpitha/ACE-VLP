import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateIndustrySectorComponent } from './create-industry-sector/create-industry-sector.component';
import { IndustrySectorListComponent } from './industry-sector-list/industry-sector-list.component';
import { IndustrySectorComponent } from './industry-sector.component';
import { UpdateIndustryComponent } from './update-industry/update-industry.component';

const routes: Routes = [
  {
    path:'', component:IndustrySectorComponent, children:[
      {
        path:'create',component:CreateIndustrySectorComponent
      },
      {
        path:'list',component:IndustrySectorListComponent
      },
      {
        path:'update/:id/:page/:tableSize', component: UpdateIndustryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndustrySectorRoutingModule { }
