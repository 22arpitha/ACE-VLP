import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { AllInvoiceComponent } from './all-invoice/all-invoice.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';


@NgModule({
  declarations: [
    InvoiceComponent,
    CreateInvoiceComponent,
    ViewInvoiceComponent,
    AllInvoiceComponent,
    EditInvoiceComponent
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule
  ]
})
export class InvoiceModule { }
