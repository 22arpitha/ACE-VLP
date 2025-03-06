import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ApiserviceService } from './apiservice.service'
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { WebsocketService } from './websocket.service';
import { UserAccessWebsocketService } from './user-access-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeStatusWebsocketService {
  baseurl = environment.socket_url;
  organization_id : any;
  user_id:any;

  private socketOfEmp$: WebSocketSubject<any> | null = null;

  constructor(private api: ApiserviceService, private router: Router ) {
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role==='Employee') {
      // console.log(' after refresh...');
      this.connectWebSocket();
    }
  }

  connectWebSocket(): void {
    if (this.socketOfEmp$ && !this.socketOfEmp$.closed) {
      // console.log('Emp WS already connected. Skipping reconnection.');
      return;
    }

    this.socketOfEmp$ = new WebSocketSubject(`wss://${this.baseurl}/ws/check-employee-deactivated/`);

    this.organization_id = sessionStorage.getItem('organization_id');
    this.user_id = sessionStorage.getItem('user_id');
    this.socketOfEmp$.subscribe(
      (message) => {
        // console.log('Emp WS message:', message);
        // console.log(typeof message?.user_id ,typeof this.user_id)
        if (message?.user_id===this.user_id && message?.message?.is_active === false) {
          this.api.showSuccess('You have been logged out!')
          this.closeWebSocket();
          // this.webSocket.closeWebSocket();
          // this.useraccessSocket.closeWebSocket();
          localStorage.clear();
          sessionStorage.clear()
          this.router.navigate(['/login'])
        }
      },
      (error) => {
        console.error('Emp WS error:', error)
      },
      () => console.warn('Emp WS connection closed')
    );
  }

  closeWebSocket(): void {
    if (this.socketOfEmp$) {
      // console.log('Closing Emp WS...');
      this.socketOfEmp$.complete();
      this.socketOfEmp$ = null;
    }
  }

  reConnect():void{
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role==='Employee'){
      // console.log('after refresh...');
      this.connectWebSocket();
    }
  }

}