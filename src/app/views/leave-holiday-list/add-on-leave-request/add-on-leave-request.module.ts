import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddOnLeaveRequestRoutingModule } from './add-on-leave-request-routing.module';
import { AddOnLeaveRequestComponent } from './add-on-leave-request.component';
import { YetApproveComponent } from './yet-approve/yet-approve.component';
import { ApprovedComponent } from './approved/approved.component';
import { DeclinedComponent } from './declined/declined.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../../shared/shared.module';
@NgModule({
  declarations: [
    AddOnLeaveRequestComponent,
    YetApproveComponent,
    ApprovedComponent,
    DeclinedComponent
  ],
  imports: [
    CommonModule,
    AddOnLeaveRequestRoutingModule,
    TabsModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    NgbTooltipModule,
    Ng2SearchPipeModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    SharedModule
  ],
  exports:[NgxPaginationModule]
})
export class AddOnLeaveRequestModule { }
