import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ApiserviceService } from 'src/app/service/apiservice.service';
@Component({
  selector: 'app-forgot-change',
  templateUrl: './forgot-change.component.html',
  styleUrls: ['./forgot-change.component.scss']
})
export class ForgotChangeComponent implements OnInit {
  userId: any;
  changePassword: FormGroup;
  eyeIcon = 'visibility_off'
  passwordType = "password";
  eyeState: boolean = false;
  eyeIcon2 = 'visibility_off'
  passwordType2 = "password";
  eyeState2: boolean = false;
  constructor(private builder: FormBuilder, private platformLocation: PlatformLocation, private api: ApiserviceService, private router: Router) { }

  ngOnInit(): void {
    const user_id = sessionStorage.getItem('user_id')
    this.changePassword = this.builder.group({
      user_id: [user_id, [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      confirm_password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]]
    }, {
      validators: this.passwordMatchValidator
    })
    this.platformLocation.onPopState(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('password');
    const confirmPassword = control.get('confirm_password');

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
      this.api.forgotPassword(this.changePassword.value).subscribe(
        (response: any) => {
          if (response) {
            this.api.showSuccess(response['message']);
            this.router.navigate(['../login']);
          }
          else {
            this.api.showError(response['message']);
          }

        }, (error => {
          this.api.showError(error.error.message)
        })

      )
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
}
