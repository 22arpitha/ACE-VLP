import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppliedApprovedLeavesRoutingModule } from './applied-approved-leaves-routing.module';
import { AppliedApprovedLeavesComponent } from './applied-approved-leaves.component';
import { YetToApproveComponent } from './yet-to-approve/yet-to-approve.component';
import { ApprovedComponent } from './approved/approved.component';
import { DeclinedComponent } from './declined/declined.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { PaginationControlsComponent } from './pagination-controls/pagination-controls.component'
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    AppliedApprovedLeavesComponent,
    YetToApproveComponent,
    ApprovedComponent,
    DeclinedComponent,
    PaginationControlsComponent
  ],
  imports: [
    CommonModule,
    AppliedApprovedLeavesRoutingModule,
    TabsModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbTooltipModule,
    SharedModule,
    MatButtonModule
  ]
})
export class AppliedApprovedLeavesModule { }
