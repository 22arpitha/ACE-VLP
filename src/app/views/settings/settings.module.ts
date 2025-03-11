import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { FormModule } from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CountryComponent } from './country/country.component';
import { JobTypeComponent } from './job-type/job-type.component';
import { SourceComponent } from './source/source.component';
import { StatusGroupComponent } from './status-group/status-group.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { SharedModule } from '../../shared/shared.module';
import { ServicesComponent } from './services/services.component';


@NgModule({
  declarations: [
    SettingsComponent,
    CountryComponent,
    JobTypeComponent,
    SourceComponent,
    StatusGroupComponent,
    JobStatusComponent,
    LeaveTypeComponent,
    ServicesComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class SettingsModule { }
