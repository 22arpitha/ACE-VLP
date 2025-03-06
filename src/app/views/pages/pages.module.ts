import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { ButtonModule, CardModule, FormModule, GridModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ToastrModule } from 'ngx-toastr';
import { OtpComponent } from './otp/otp.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RouterModule } from '@angular/router';
import { CreateRoleComponent } from './create-role/create-role.component';
import { SharedModule } from '../../shared/shared.module';
import { ForgotChangeComponent } from './forgot-change/forgot-change.component';
import { NotificationComponent } from './notification/notification.component';
import { NoInternetComponent } from './no-internet/no-internet.component';
import { Page504Component } from './page504/page504.component';
import { Page503Component } from './page503/page503.component';
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    Page404Component,
    Page500Component,
    ForgotPasswordComponent,
    OtpComponent,
    ChangePasswordComponent,
    CreateRoleComponent,
    ForgotChangeComponent,
    NotificationComponent,
    NoInternetComponent,
    Page504Component,
    Page503Component
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    CardModule,
    ButtonModule,
    GridModule,
    IconModule,
    FormModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-full-width'
    }),
    RouterModule
  ],
})
export class PagesModule {
}
