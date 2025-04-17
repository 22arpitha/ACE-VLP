import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {InvoiceComponent} from './invoice.component';
import {AllInvoiceComponent} from './all-invoice/all-invoice.component';
import {CreateInvoiceComponent} from './create-invoice/create-invoice.component';
import {ViewInvoiceComponent} from './view-invoice/view-invoice.component';
import { CanDeactivateGuard } from '../../auth-guard/can-deactivate.guard';

const routes: Routes = [
  {
    path:'',
    component: InvoiceComponent,
    children:[
      {
        path: 'all-invoice',
        component:AllInvoiceComponent
      },
      {
        path: 'create-invoice',
        component: CreateInvoiceComponent,
        canDeactivate:[CanDeactivateGuard]
      },
      {
        path: 'view-invoice/:id',
        component: ViewInvoiceComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
