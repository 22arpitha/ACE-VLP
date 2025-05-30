import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { ViewInvoiceComponent } from './view-invoice/view-invoice.component';
import { AllInvoiceComponent } from './all-invoice/all-invoice.component';
import { EditInvoiceComponent } from './edit-invoice/edit-invoice.component';
import { SharedModule } from '../../shared/shared.module';
// import { MatNativeDateModule } from '@angular/material/core';

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
    InvoiceRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    SharedModule,
  ]
})
export class InvoiceModule { }
