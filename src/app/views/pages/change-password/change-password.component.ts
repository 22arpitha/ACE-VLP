import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
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
    private location: Location
  ) { }

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('user_id')
    this.changePassword = this.builder.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      confirm_password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      user_id: [this.userId, [Validators.required]]
    },
    {
      validators: this.passwordMatchValidator
    },
  )
  }
  
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('new_password');
    const confirmPassword = control.get('confirm_password');

    if (newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  get f() {
    return this.changePassword.controls;
  }

  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

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
        this.api.postData(`${environment.live_url}/${environment.set_new_password}/`,this.changePassword.value).subscribe(
          (response: any) => {
            if (response) {
              //console.log(response)

              this.router.navigate(['../login']);
              this.api.showSuccess("Password changed successfully!");
            }
            else {
              this.api.showError('Error !')
            }

          }, ((error: any) => {
            this.api.showError(error ? error.error.error.message : 'Error !')
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
  getRedirectLink() {
    this.location.back();
  }
}
