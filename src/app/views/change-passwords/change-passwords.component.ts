import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-change-passwords',
  templateUrl: './change-passwords.component.html',
  styleUrls: ['./change-passwords.component.scss']
})
export class ChangePasswordsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Change password';
  userId
  changePassword: FormGroup;
  eyeIcon = 'visibility_off'
  passwordType = "password";
  eyeState: boolean = false;
  eyeIcon2 = 'visibility_off'
  passwordType2 = "password";
  eyeState2: boolean = false;
  eyeIcon3 = 'visibility_off'
  passwordType3 = "password";
  eyeState3: boolean = false;
  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private router: Router,
    private common_service: CommonServiceService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.userId = sessionStorage.getItem('user_id')
    this.changePassword = this.builder.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      confirm_new_password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      user_id: [this.userId, [Validators.required]]
    },
      {
        validators: this.passwordMatchValidator
      },
    )
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('new_password');
    const confirmPassword = control.get('confirm_new_password');

    if (newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  get f() {
    return this.changePassword.controls;
  }



  sendChangePassword() {
    if (this.changePassword.invalid) {
      this.api.showError('Invalid!')
      this.changePassword.markAllAsTouched()
      console.log(this.changePassword.value)
    }
    else {
      if (this.changePassword.value.old_password === this.changePassword.value.new_password) {
        this.api.showError('Old password and new password both should not be same')
      }
      else {
        console.log(this.changePassword.value)
        this.api.addChangePassword(this.changePassword.value).subscribe(
          (response: any) => {
            if (response) {
              //console.log(response)
              this.api.showSuccess(response.message);
              this.changePassword.reset();
              setTimeout(() => {
                this.router.navigate(['../login']);
                sessionStorage.clear()
                localStorage.clear();
              }, 3000);
            }
            else {
              this.api.showError('Error !')
            }

          }, ((error: any) => {
            this.api.showError(error.error.message)
          })

        )
      }

    }

  }
  showPassword() {
    this.eyeState = !this.eyeState
    if (this.eyeState == true) {
      this.eyeIcon = 'visibility'
      this.passwordType = 'text'
    }
    else {
      this.eyeIcon = 'visibility_off'
      this.passwordType = 'password'
    }

  }
  showPasswordtwo() {
    this.eyeState2 = !this.eyeState2
    if (this.eyeState2 == true) {
      this.eyeIcon2 = 'visibility'
      this.passwordType2 = 'text'
    }
    else {
      this.eyeIcon2 = 'visibility_off'
      this.passwordType2 = 'password'
    }

  }
  showPasswordthree() {
    this.eyeState3 = !this.eyeState3
    if (this.eyeState3 == true) {
      this.eyeIcon3 = 'visibility'
      this.passwordType3 = 'text'
    }
    else {
      this.eyeIcon3 = 'visibility_off'
      this.passwordType3 = 'password'
    }

  }
}
