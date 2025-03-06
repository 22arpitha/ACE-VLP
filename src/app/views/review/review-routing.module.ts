import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewComponent } from './review.component';
import { ManagerReviewComponent } from './manager-review/manager-review.component';

const routes: Routes = [
  {path:'',component:ReviewComponent,children:[
    {path:'review',component:ManagerReviewComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewRoutingModule { }
