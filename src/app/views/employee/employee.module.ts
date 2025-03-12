import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllEmployeeComponent } from './all-employee/all-employee.component';
import { CreateUpdateEmployeeComponent } from './create-update-employee/create-update-employee.component';



@NgModule({
  declarations: [
    AllEmployeeComponent,
    CreateUpdateEmployeeComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[AllEmployeeComponent,CreateUpdateEmployeeComponent]
})
export class EmployeeModule { }
