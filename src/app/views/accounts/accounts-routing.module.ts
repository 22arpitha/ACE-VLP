import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsComponent } from './accounts.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { SuccessPlanDetailsComponent } from './success-plan-details/success-plan-details.component';
import { TrailPlanDetailsComponent } from './trail-plan-details/trail-plan-details.component';
import { SubscriptionInvoiceDetailsComponent } from './subscription-invoice-details/subscription-invoice-details.component';

const routes: Routes = [
  {
    path:'', component:AccountsComponent,children:[
      {
        path:'subscription', component:SubscriptionComponent 
      },
      {
        path:'standardplan-history', component:SuccessPlanDetailsComponent
      },
      {
        path:'trialplan-history', component:TrailPlanDetailsComponent
      },
      {
        path:'invoice-data', component: SubscriptionInvoiceDetailsComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
