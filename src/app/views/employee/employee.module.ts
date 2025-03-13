import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllEmployeeComponent } from './all-employee/all-employee.component';
import { CreateUpdateEmployeeComponent } from './create-update-employee/create-update-employee.component';
import { SettingsRoutingModule } from '../settings/settings-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule, SharedModule } from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    AllEmployeeComponent,
    CreateUpdateEmployeeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
      SettingsRoutingModule,
      FormModule,
      ReactiveFormsModule,
      SharedModule,
  ],
  exports:[AllEmployeeComponent,CreateUpdateEmployeeComponent]
})
export class EmployeeModule { }
