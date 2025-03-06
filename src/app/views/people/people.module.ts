import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeopleRoutingModule } from './people-routing.module';
import { PeopleComponent } from './people.component';
import { CreatePeopleComponent } from './create-people/create-people.component';
import { PeopleListComponent } from './people-list/people-list.component';
import { PrefixSuffixListComponent } from './prefix-suffix-list/prefix-suffix-list.component';
import { CreatePrefixSuffixComponent } from './create-prefix-suffix/create-prefix-suffix.component';
import { CentersListComponent } from './centers-list/centers-list.component';
import { AddCentersComponent } from './add-centers/add-centers.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { AddNewTagComponent } from './add-new-tag/add-new-tag.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UpdateTagComponent } from './update-tag/update-tag.component';
import { UpdateCentreComponent } from './update-centre/update-centre.component';
import { UpdatePrefixSuffixComponent } from './update-prefix-suffix/update-prefix-suffix.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UpdatePeopleComponent } from './update-people/update-people.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../../shared/shared.module';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [
    
    PeopleComponent,
    CreatePeopleComponent,
    PeopleListComponent,
    PrefixSuffixListComponent,
    CreatePrefixSuffixComponent,
    CentersListComponent,
    AddCentersComponent,
    TagListComponent,
    AddNewTagComponent,
    UpdateTagComponent,
    UpdateCentreComponent,
    UpdatePrefixSuffixComponent,
    UpdatePeopleComponent
  ],
  imports: [
    CommonModule,
    PeopleRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    NgMultiSelectDropDownModule,
    SharedModule,
    MatButtonModule
  ],
  exports:[
    NgbTooltipModule
  ]
  
})
export class PeopleModule { }
