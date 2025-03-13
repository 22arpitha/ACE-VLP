import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllEmployeeComponent } from './all-employee/all-employee.component';
import { CreateUpdateEmployeeComponent } from './create-update-employee/create-update-employee.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    AllEmployeeComponent,
    CreateUpdateEmployeeComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
        FormModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatButtonModule,
        SharedModule,
  ],
  exports:[AllEmployeeComponent,CreateUpdateEmployeeComponent]
})
export class EmployeeModule { }
