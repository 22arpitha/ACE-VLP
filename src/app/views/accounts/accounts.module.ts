import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { SharedModule } from '../../shared/shared.module';
import { TrialAlertComponent } from './trial-alert/trial-alert.component';
import { TrialSuccessComponent } from './trial-success/trial-success.component';
import { BuyStandardplanComponent } from './buy-standardplan/buy-standardplan.component';
import { SuccessPlanDetailsComponent } from './success-plan-details/success-plan-details.component';
import { CancelSubscriptionComponent } from './cancel-subscription/cancel-subscription.component';
import { ExistStandardPlanComponent } from './exist-standard-plan/exist-standard-plan.component';
import { TrailPlanDetailsComponent } from './trail-plan-details/trail-plan-details.component';
import { StandardSubscriptionComponent } from './standard-subscription/standard-subscription.component';
import { LimitReachedComponent } from './limit-reached/limit-reached.component';
import { PlanSelectionComponent } from './plan-selection/plan-selection.component';
import { SubscriptionInvoiceDetailsComponent } from './subscription-invoice-details/subscription-invoice-details.component';
import { TransactionFailedComponent } from './transaction-failed/transaction-failed.component';
import { HelpTextComponent } from './help-text/help-text.component';
@NgModule({
  declarations: [
    AccountsComponent,
    SubscriptionComponent,
    TrialAlertComponent,
    TrialSuccessComponent,
    BuyStandardplanComponent,
    SuccessPlanDetailsComponent,
    CancelSubscriptionComponent,
    ExistStandardPlanComponent,
    TrailPlanDetailsComponent,
    StandardSubscriptionComponent,
    LimitReachedComponent,
    PlanSelectionComponent,
    SubscriptionInvoiceDetailsComponent,
    TransactionFailedComponent,
    HelpTextComponent,
  ],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    SharedModule
  ]
})
export class AccountsModule { }
