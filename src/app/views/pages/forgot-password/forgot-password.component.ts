import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  
  constructor(private builder:FormBuilder, private api:ApiserviceService, private router:Router) { }
  
  disableButton:boolean = false;
  ngOnInit(): void {
  }
  forgotForm = this.builder.group({
    email:['',[Validators.required, Validators.email]],
 
  })

  get f(){
    return this.forgotForm.controls;
  }
 


  forgot(){
    if(this.forgotForm.invalid){
      this.forgotForm.markAllAsTouched()
      this.api.showError('Invalid!')
    }
    else{
      this.disableButton = true;
      this.api.ForgotPasswordDetails(this.forgotForm.value).subscribe(
        (response:any)=>{
          if(response){
            //  //console.log(response.result.details,response)
            this.api.showSuccess(response.message)
            this.disableButton  = false;
            sessionStorage.setItem('email_id',this.forgotForm.value.email)
            this.router.navigate(['/otp']);
           }
          else{
            //console.log('error message')
            this.api.showError(response.error.message)
            this.api.showError('ERROR !');
            this.disableButton = false;
          }
         
        },(error  =>{
          //console.log(error,"MESSAGE")
          this.api.showError(error.error.message)
        })
        
        
      )
    }

  }
  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

}
