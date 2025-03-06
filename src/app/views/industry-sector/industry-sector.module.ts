import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndustrySectorRoutingModule } from './industry-sector-routing.module';
import { IndustrySectorComponent } from './industry-sector.component';
import { CreateIndustrySectorComponent } from './create-industry-sector/create-industry-sector.component';
import { IndustrySectorListComponent } from './industry-sector-list/industry-sector-list.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { UpdateIndustryComponent } from './update-industry/update-industry.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    IndustrySectorComponent,
    CreateIndustrySectorComponent,
    IndustrySectorListComponent,
    UpdateIndustryComponent,
    
  ],
  imports: [
    CommonModule,
    IndustrySectorRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule
  ]
})
export class IndustrySectorModule { }
