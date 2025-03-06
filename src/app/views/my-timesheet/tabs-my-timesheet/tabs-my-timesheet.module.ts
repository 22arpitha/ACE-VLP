import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabsMyTimesheetRoutingModule } from './tabs-my-timesheet-routing.module';
import { TabsMyTimesheetComponent } from './tabs-my-timesheet.component';
import { YetToApproveComponent } from './yet-to-approve/yet-to-approve.component';
import { ApprovedComponent } from './approved/approved.component';
import { DeclineComponent } from './decline/decline.component';
import { FlaggedComponent } from './flagged/flagged.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
@NgModule({
  declarations: [
    TabsMyTimesheetComponent,
    YetToApproveComponent,
    ApprovedComponent,
    DeclineComponent,
    FlaggedComponent
  ],
  imports: [
    CommonModule,
    TabsMyTimesheetRoutingModule,
    TabsModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot(),
    NgbTooltipModule,
    NgxPaginationModule,
    Ng2SearchPipeModule
  ],
  exports: [
    TabsMyTimesheetComponent
  ]
})
export class TabsMyTimesheetModule { }
