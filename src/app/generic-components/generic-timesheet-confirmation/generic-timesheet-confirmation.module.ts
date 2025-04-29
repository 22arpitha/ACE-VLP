import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenericTimesheetConfirmationRoutingModule } from './generic-timesheet-confirmation-routing.module';
import { GenericTimesheetConfirmationComponent } from './generic-timesheet-confirmation.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    GenericTimesheetConfirmationComponent
  ],
  imports: [
    CommonModule,
    GenericTimesheetConfirmationRoutingModule,
    SharedModule
  ],
  exports:[
    GenericTimesheetConfirmationComponent
  ]
})
export class GenericTimesheetConfirmationModule { }
