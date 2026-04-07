import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class ApiserviceService {
  baseurl = environment.live_url;
  newUrl = environment.live_url;
  org_id: any;
  accessArr: any = [];
  token: any;
  headers: any;
  constructor(private http: HttpClient, private toastr: ToastrService) {}
  ngOnInit() {
    // this.token = sessionStorage.getItem('token');
    this.token = localStorage.getItem('token');
    this.org_id = sessionStorage.getItem('org_id');
    // this.headers = {'Authorization':this.token}
  }


restoreSessionFromToken() {
  const token = localStorage.getItem('token');
  // No token → nothing to restore
  if (!token) {
    return;
  }
  // If already restored in this tab → do nothing
  const userId = sessionStorage.getItem('user_id');
  if (userId) {
    return;
  }
  try {
    const decoded: any = jwtDecode(token);
    const restoredUserId = decoded.user_id;
    //  Restore minimal session
    sessionStorage.setItem('user_id', restoredUserId);
    //  Optionally restore role & name by calling API
    this.getData(`${environment.live_url}/${environment.user_access}/${restoredUserId}/`)
      .subscribe((data: any) => {
        if (data.user_role == 'Employee') {
          sessionStorage.setItem('user_role_name', data.designation);
          sessionStorage.setItem('designation', data.sub_designation);
        } else {
          sessionStorage.setItem('user_role_name', data.user_role);
        }
        sessionStorage.setItem('user_name', data.user_info[0].first_name);
      });

  } catch (e) {
    // Token invalid → force logout
    localStorage.removeItem('token');
  }
}


  private isComponentLoadedSubject = new BehaviorSubject<boolean>(false);
  isComponentLoaded$ = this.isComponentLoadedSubject.asObservable();
  setComponentLoadedStatus(status: boolean) {
    this.isComponentLoadedSubject.next(status);
  }

  private subModulesSubject = new BehaviorSubject<any[]>([]);
  subModules$ = this.subModulesSubject.asObservable();
  setSubModules(array: any[]) {
    this.subModulesSubject.next(array);
  }
  // Success Message
  showSuccess(message: any) {
    this.toastr.success(message);
  }
  // Error Message
  showError(message: any) {
    this.toastr.error(message);
  }
  // Warning Message
  showWarning(message: any) {
    this.toastr.warning(message);
  }
    getData(params: string) {
    return this.http.get(params);
  }

  // new profile url
  getProfileDetails(params: any) {
    return this.http.get(`${this.baseurl}/user/${params}`);
  }
  updateUserProfileDetails(user_id: any, data: any) {
    return this.http.put(`${this.baseurl}/user/${user_id}/`, data);
  }
  // profile ends here
  getDataWithHeaders(params: string) {
    return this.http.get(params);
  }
  postData(url: string, data: any) {
    return this.http.post(url, data);
  }
  updateData(url: string, data: any) {
    return this.http.put(url, data);
  }
  patchData(url: string, data: any) {
    return this.http.patch(url, data);
  }
  delete(id: any) {
    return this.http.delete(id);
  }
  loginDetails(data: any) {
    return this.http.post(`${this.baseurl}/login/`, data);
  }
  userAccess(user_id: any) {
    return this.http.get(`${this.baseurl}/user-access/${user_id}/`);
  }
  // Login
  //Register
  register(data: any) {
    return this.http.post(`${this.baseurl}/register`, data);
  }
  //Register
  // Forgot Password
  ForgotPasswordDetails(data: any) {
    return this.http.post(`${this.baseurl}/forgot-password/`, data);
  }
  // Forgot Password
  // Otp
  otp(data: any) {
    return this.http.post(`${this.baseurl}/verify-otp/`, data);
  }
  // Otp
  // Reset Forgot Password
  resetPassword(data: any) {
    return this.http.post(`${this.baseurl}/password-reset`, data);
  }
  // Reset Forgot Password
  

  // change password
  addChangePassword(data: any) {
    return this.http.post(`${this.baseurl}/change-password/`, data);
  }
  forgotPassword(data: any) {
    return this.http.post(`${this.baseurl}/set-new-password/`, data);
  }
  // change password
 
  getAllEmployees2() {
    return this.http.get(`${this.baseurl}/all-employees/`);
  }

  getUserById(id: any) {
    return this.http.get(`${this.baseurl}/user/${id}/`);
  }
}
