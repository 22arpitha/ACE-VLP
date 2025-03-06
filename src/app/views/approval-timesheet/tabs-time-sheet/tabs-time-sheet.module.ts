import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabsTimeSheetRoutingModule } from './tabs-time-sheet-routing.module';
import { TabsTimeSheetComponent } from './tabs-time-sheet.component';
import { YetApproveComponent } from './yet-approve/yet-approve.component';
import { ApprovedComponent } from './approved/approved.component';
import { DeclinedComponent } from './declined/declined.component';
import { TimeSheetComponent } from './time-sheet/time-sheet.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TabsTimeSheetComponent,
    YetApproveComponent,
    ApprovedComponent,
    DeclinedComponent,
    TimeSheetComponent
  ],
  imports: [
    CommonModule,
    TabsModule.forRoot(),
    TabsTimeSheetRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  // exports:[
  //   TabsTimeSheetComponent
  // ]
})
export class TabsTimeSheetModule { }
