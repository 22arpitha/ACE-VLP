import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {
  otpForm: FormGroup;
  @ViewChild('el', { static: false }) el: ElementRef;
  @ViewChild('num3', { static: false }) num3: ElementRef;

  constructor(private builder: FormBuilder, private api: ApiserviceService, private router: Router) { }
  countdown: number = 59;
  isButtonEnabled: boolean = false;
  timer: any;
  resendButtonClicked: boolean = false;
  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.otpForm = this.builder.group({
      num1: ['', Validators.required],
      num2: ['', Validators.required],
      num3: ['', Validators.required],
      num4: ['', Validators.required],
      num5: ['', Validators.required],
      num6: ['', Validators.required],
    })
    setTimeout(() => {
      this.startCountdown();
    }, 1000);
  }
  startCountdown() {
    this.isButtonEnabled = false;
    this.resendButtonClicked = false;
    this.countdown = 59;
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
        this.isButtonEnabled = true;
      }
    }, 1000);
  }
  resendOtp() {
    this.resendButtonClicked = true;
    let data = {
      email: sessionStorage.getItem('email_id')
    }
    this.api.postData(`${environment.live_url}/${environment.forgot_password}/`,data).subscribe(
      (response: any) => {
        if (response) {
          //  //console.log(response.result.details,response)
          this.api.showSuccess(response.message)
          this.initForm();
          setTimeout(() => {
            this.startCountdown();
          }, 1000);
        }
        else {
          //console.log('error message')
          this.api.showError(response.error.message)
          this.api.showError('ERROR !')
        }

      }, (error => {
        //console.log(error,"MESSAGE")
        this.api.showError(error.error.message)
      })
    )
  }
  sendOTP() {
    // let int = this.otpForm.value.num1
    // const otp: string = int.concat(this.otpForm.value.num2, this.otpForm.value.num3, this.otpForm.value.num4, this.otpForm.value.num5, this.otpForm.value.num6)
    const otp: string = Object.values(this.otpForm.value).join('');
    const userName = sessionStorage.getItem('email_id')
    const otpdata = {
      otp: Number(otp),
      email: userName
    }
    if (this.otpForm.invalid) {
      this.api.showError('Please enter the otp')

    }
    else {
      this.api.postData(`${environment.live_url}/${environment.verify_otp}/`,otpdata).subscribe((res: any) => {
        if (res) {
          this.api.showSuccess(res['message'])
          sessionStorage.setItem('user_id', res['user_id'])
          this.router.navigate(['/forgotChange'], { replaceUrl: true });
        }
        else {
          this.api.showError(res['message']);
        }


      }, (error => {
        this.api.showError(error.error.message)
      }))
    }


  }


  handleBackspace(event, currentControlName) {
    // console.log(event,event.key,"EVENT>KEY")
    if (event.keyCode === 8 && event.target.value == '') {
      event.preventDefault();
      const currentControl = this.otpForm.get(currentControlName);
      currentControl.setValue("");

      const previousControlName = this.getPreviousControlName(currentControlName);
      if (previousControlName) {
        const previousControl = this.otpForm.get(previousControlName);
        this.setFocus(previousControlName);
        previousControl.setValue("");
      }
    }
  }

  getPreviousControlName(currentControlName) {
    const controlNames = Object.keys(this.otpForm.controls);
    const currentIndex = controlNames.indexOf(currentControlName);
    if (currentIndex > 0) {
      return controlNames[currentIndex - 1];
    }
    return null;
  }

  setFocus(controlName) {
    const invalidControl = this.el.nativeElement.querySelector('[formControlName="' + controlName + '"]');
    if (invalidControl) {
      invalidControl.focus();
    }
  }

  valCheck() {
    for (const key of Object.keys(this.otpForm.controls)) {
      if (this.otpForm.controls[key].invalid) {
        this.setFocus(key);
        break;
      }
    }
  }


  // valCheck() {
  //   for (const key of Object.keys(this.otpForm.controls)) {
  //     if (this.otpForm.controls[key].invalid) {
  //       var invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
  //       invalidControl.focus();
  //       break;
  //     }
  //   }
  // }



}
