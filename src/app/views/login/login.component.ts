import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../service/apiservice.service';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { WebsocketService } from '../../service/websocket.service';
import { EmployeeStatusWebsocketService } from '../../service/employee-status-websocket.service';
import { UserAccessWebsocketService } from '../../service/user-access-websocket.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  permission: any;
  showFieldset: boolean = false;
  constructor(private builder: FormBuilder, private api: ApiserviceService, private router: Router,
    private websocketService:WebsocketService, private employeeSocket:EmployeeStatusWebsocketService,
    private useraccessSocket:UserAccessWebsocketService
  ) { }
  time = new Date();
  message = '';
  error: boolean;
  eyeState: boolean = false;
  eyeIcon = 'visibility_off'
  passwordType = "password";
  minValue = 0.01;
  ngOnInit(): void {
    this.getWelomeMessage();
    sessionStorage.clear();
    this.loginForm = this.builder.group({
      // username: ['', [Validators.required, Validators.email]],
      // password: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required]],
    })
  }


  get f() {
    return this.loginForm.controls;
  }
  getWelomeMessage(): any {
    let hours = this.time.getHours();

    if (hours < 12) {
      return this.message = 'Good Morning';
    }
    else if (hours >= 12 && hours < 15) {
      return this.message = 'Good Afternoon';
    }
    else if (hours >= 15 && hours < 19) {
      return this.message = 'Good Evening';
    }
    else if (hours >= 18 && hours < 23) {
      return this.message = 'Good Night';
    }

  }
  hide = true;


  login() {

    if (this.loginForm.invalid) {
      // this.api.showError('Please enter the mandatory fields')

      this.loginForm.markAllAsTouched()

    }
    else {

      this.api.postData(`${environment.live_url}/${environment.login}/`,this.loginForm.value).subscribe(response => {
        let status = Number(200)
        console.log(response)
        const token = response['token'];
        const decoded:any = jwtDecode(token);
        console.log(decoded)
        sessionStorage.setItem('token', response['token']),
        sessionStorage.setItem('logged_count', response['logged_in_time']);
        sessionStorage.setItem('user_id',decoded.user_id )
        this.api.showSuccess('Login successful!'); // remove this line once the user access api  is done
        
        this.api.getData(`${environment.live_url}/${environment.user_access}/${decoded.user_id}/`).subscribe(
          (data:any)=>{
            console.log('user access',data)
            sessionStorage.setItem('user_role_name', data.user_role);
            sessionStorage.setItem('user_name', data.user_info[0].first_name);
            this.router.navigate(['settings/country']) // remove this line once the user access api  is done
        //     sessionStorage.setItem('organization_id', data.organization_id);
        //     sessionStorage.setItem('designation', data.designation);
        //       let permissionArr: any = []
        //       permissionArr = JSON.parse(sessionStorage.getItem('permissionArr'));
        //       if(data.access_list.length!=0){
        //         this.router.navigate([data.access_list[0].url || data.access_list[0].children[0].url]);
        //       } else{
        //         this.router.navigate(['profile'])
        //       }
        //       if(sessionStorage.getItem('user_role_name')!='SuperAdmin'){
        //         this.websocketService.connectWebSocket();
        //       }
        //       if(sessionStorage.getItem('user_role_name')==='Employee'){
        //         this.employeeSocket.connectWebSocket();
        //         this.useraccessSocket.connectWebSocket();
        //       }
        //       this.api.showSuccess('Login successful!');
          },
          (error:any)=>{
           // console.log('error',error)
          }
        )

      }, (error: any) => {
       if(error.error.message){
        this.api.showError(error.error.message);
       }
        
      }

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

  preventSpace(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }

  }
  signUp(){
    this.router.navigate(['./register'])
  }
  
}
