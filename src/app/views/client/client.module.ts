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
import {MatTabsModule} from '@angular/material/tabs';
import { TabsListComponent } from './tabs-list/tabs-list.component';
import { EditClientComponent } from './edit-client/edit-client.component';
import { GroupComponent } from './group/group.component';
import { JobsOfEndclientComponent } from './jobs-of-endclient/jobs-of-endclient.component';
import { ClientsOfGroupComponent } from './clients-of-group/clients-of-group.component';

@NgModule({
  declarations: [
    ClientComponent,
    ClientListComponent,
    CreateClientComponent,
    UpdateClientComponent,
    GroupComponent,
    TabsListComponent,
    EditClientComponent,
    JobsOfEndclientComponent,
    ClientsOfGroupComponent
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
    QuillModule.forRoot(),
    MatTabsModule
  ]
})
export class ClientModule { }
