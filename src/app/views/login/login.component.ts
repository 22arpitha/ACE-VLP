import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
// import { WebsocketService } from '../../service/websocket.service';
// import { EmployeeStatusWebsocketService } from '../../service/employee-status-websocket.service';
// import { UserAccessWebsocketService } from '../../service/user-access-websocket.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  permission: any;
  showFieldset: boolean = false;
  constructor(private builder: FormBuilder, private api: ApiserviceService, private router: Router,private route: ActivatedRoute
    // private websocketService:WebsocketService, private employeeSocket:EmployeeStatusWebsocketService,
    // private useraccessSocket:UserAccessWebsocketService
  ) { }
  time = new Date();
  message = '';
  error!: boolean;
  eyeState: boolean = false;
  eyeIcon = 'visibility_off'
  passwordType = "password";
  minValue = 0.01;
  ngOnInit(): void {
    const sessionToken = sessionStorage.getItem('token');
    const localToken = localStorage.getItem('token');
      const forceUser = this.route.snapshot.queryParamMap.get('forceUser');
    console.log(forceUser)
    if (!forceUser && !sessionToken && localToken) {
      sessionStorage.setItem('token', localToken);

      const decoded: any = jwtDecode(localToken);
      sessionStorage.setItem('user_id', decoded.user_id);
      // this.getUserAccess(decoded.user_id);
    }
    this.getWelomeMessage();
    // sessionStorage.clear();
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

      this.api.postData(`${environment.live_url}/${environment.login}/`,this.loginForm.value).subscribe((response:any) => {
        let status = Number(200)
        // console.log(response)
        const token = response['token'];
        const decoded:any = jwtDecode(token);
        // console.log(decoded)
        const forceUser = this.route.snapshot.queryParamMap.get('forceUser');
        if (forceUser && forceUser != decoded.user_id) {
          this.api.showError('Please login with the correct account');
          sessionStorage.clear();
          localStorage.removeItem('token');
          return;
        }
        sessionStorage.setItem('token', response['token']),
        localStorage.setItem('token', response['token']),
        sessionStorage.setItem('logged_count', response['logged_in_time']);
        sessionStorage.setItem('user_id',decoded.user_id )

        this.api.getData(`${environment.live_url}/${environment.user_access}/${decoded.user_id}/`).subscribe(
          (data:any)=>{
            // console.log('user access',data)
            if (data.user_role == 'Employee') {
              sessionStorage.setItem('user_role_name', data.designation);
              sessionStorage.setItem('designation', data.sub_designation);
            } else {
              sessionStorage.setItem('user_role_name', data.user_role);
            }
            sessionStorage.setItem('user_name', data.user_info[0].first_name);
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
            //  If user came from email link, go there first
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
              this.api.showSuccess('Login ttttttt!');
              return;
            }
            let access = data.access_list.find((data: { name: string; })=>data.name==='Jobs')
            // console.log(access)
            if(data.access_list.length!=0){
              if(access){
              this.router.navigate([access.url])
            } else{
              this.router.navigate([data.access_list[0].url || data.access_list[0].children[0].url])
            }
            this.api.showSuccess('Login successful!');
            }
          },
          (error:any)=>{
           console.log('error',error.error.detail)
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

  getUserAccess(user_id:any){
    this.api.getData(`${environment.live_url}/${environment.user_access}/${user_id}/`).subscribe(
          (data:any)=>{
            console.log('rrrrrrrrrr access',data)
            if (data.user_role == 'Employee') {
              sessionStorage.setItem('user_role_name', data.designation);
              sessionStorage.setItem('designation', data.sub_designation);
            } else {
              sessionStorage.setItem('user_role_name', data.user_role);
            }
            sessionStorage.setItem('user_name', data.user_info[0].first_name);
          },
          (error:any)=>{
           console.log('error',error.error.detail)
          }
        )
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
