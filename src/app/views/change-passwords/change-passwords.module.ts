import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChangePasswordsRoutingModule } from './change-passwords-routing.module';
import { ChangePasswordsComponent } from './change-passwords.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import { ButtonModule, CardModule, FormModule, GridModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ChangePasswordsComponent,
    
  ],
  imports: [
    CommonModule,
    ChangePasswordsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    IconModule,
    ToastrModule,
    SharedModule
  ]
})
export class ChangePasswordsModule { }
