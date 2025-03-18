import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
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
  urlIdPresent:boolean = false;
  title:string
  constructor(private builder: FormBuilder, private platformLocation: PlatformLocation, private api: ApiserviceService, private router: Router,
    private activeRoute:ActivatedRoute
  ) {
    if(this.activeRoute.snapshot.queryParamMap.get('employee-id')){
      this.urlIdPresent = true;
      this.title = 'Set New Password'
      this.userId= Number(this.activeRoute.snapshot.queryParamMap.get('employee-id'));
      console.log(this.urlIdPresent, this.userId,'p')
    } else{
      this.urlIdPresent = false;
      this.title = ''
      this.userId = sessionStorage.getItem('user_id')
      console.log(this.urlIdPresent,'n')
    }
   }

  ngOnInit(): void {
    this.changePassword = this.builder.group({
      user_id: [this.userId, [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{7,}$/)]],
      confirm_password: ['', [Validators.required]]
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
      // this.api.showError('Invalid!')
      this.changePassword.markAllAsTouched()
      console.log(this.changePassword.value)
    }
    else {
      this.api.postData(`${environment.live_url}/${environment.set_new_password}/`,this.changePassword.value).subscribe(
        (response: any) => {
          if (response) {
            if(this.urlIdPresent){
              this.api.showSuccess('Password added successfully');
              this.router.navigate(['../../login'])
            } else{
              this.api.showSuccess(response['message']);
              this.router.navigate(['../login'])
            }
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

  back(){
    if(this.urlIdPresent){
      this.router.navigate(['../../login'])
    } else{
      this.router.navigate(['../login'])
    }
  }
}
