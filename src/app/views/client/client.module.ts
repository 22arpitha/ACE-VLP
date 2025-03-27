import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { schema } from 'ngx-editor/schema';
import { ClientRoutingModule } from './client-routing.module';
import { ClientComponent } from './client.component';
import { ClientListComponent } from './client-list/client-list.component';
import { CreateClientComponent } from './create-client/create-client.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UpdateClientComponent } from './update-client/update-client.component';
import { SharedModule } from '../../shared/shared.module';
import {MatTabsModule} from '@angular/material/tabs';
import { TabsListComponent } from './tabs-list/tabs-list.component';
import { GroupComponent } from './group/group.component';
import { JobsOfEndclientComponent } from './jobs-of-endclient/jobs-of-endclient.component';
import { ClientsOfGroupComponent } from './clients-of-group/clients-of-group.component';
import { ClientContactDetailsPopupComponent } from './client-contact-details-popup/client-contact-details-popup.component';
import {EditClientComponent} from './edit-client/edit-client.component';
import { JobsOfClientsComponent } from './jobs-of-clients/jobs-of-clients.component'
@NgModule({
  declarations: [
    ClientComponent,
    ClientListComponent,
    CreateClientComponent,
    UpdateClientComponent,
    GroupComponent,
    EditClientComponent,
    TabsListComponent,
    JobsOfEndclientComponent,
    ClientsOfGroupComponent,
    ClientContactDetailsPopupComponent,
    JobsOfClientsComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    NgxEditorModule.forRoot({
      locals: {
        // menu
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        blockquote: 'Blockquote',
        underline: 'Underline',
        strike: 'Strike',
        bullet_list: 'Bullet List',
        ordered_list: 'Ordered List',
        heading: 'Heading',
        h1: 'Header 1',
        h2: 'Header 2',
        h3: 'Header 3',
        h4: 'Header 4',
        h5: 'Header 5',
        h6: 'Header 6',
        align_left: 'Left Align',
        align_center: 'Center Align',
        align_right: 'Right Align',
        align_justify: 'Justify',
        text_color: 'Text Color',
        background_color: 'Background Color',

        // popups, forms, others...
        url: 'URL',
        text: 'Text',
        openInNewTab: 'Open in new tab',
        insert: 'Insert',
        altText: 'Alt Text',
        title: 'Title',
        remove: 'Remove',
        enterValidUrl: 'Please enter a valid URL',
      },
    }),
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule,
    MatTabsModule
  ]
})
export class ClientModule { }
