import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill';
import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { ClientListComponent } from './client-list/client-list.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UpdateClientComponent } from './update-client/update-client.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ClientComponent,
    ClientListComponent,
    CreateClientComponent,
    UpdateClientComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule,
    QuillModule.forRoot()
  ]
})
export class ClientModule { }
