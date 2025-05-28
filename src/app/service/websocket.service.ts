import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ApiserviceService } from './apiservice.service'
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { EmployeeStatusWebsocketService } from './employee-status-websocket.service';
import { UserAccessWebsocketService } from './user-access-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  baseurl = environment.socket_url;
  organization_id : any

  private socket$: WebSocketSubject<any> | null = null;

  constructor(private api: ApiserviceService, private router: Router, private employeeSocket:EmployeeStatusWebsocketService,
     private useraccessSocket:UserAccessWebsocketService) {
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role!='SuperAdmin') {
      // console.log(' after refresh...');
      // this.connectWebSocket();
    }
  }

  connectWebSocket(): void {
    if (this.socket$ && !this.socket$.closed) {
      // console.log('WebSocket already connected. Skipping reconnection.');
      return;
    }

    this.socket$ = new WebSocketSubject(`wss://${this.baseurl}/ws/check-deactivated/`);

    this.organization_id = sessionStorage.getItem('organization_id')
    this.socket$.subscribe(
      (message) => {
        console.log('WebSocket message:', message);
        // console.log(message?.organization,this.organization_id)
        if (message?.organization==this.organization_id && message?.message?.is_active === 'False') {
          this.api.showSuccess('You have been logged out!')
          this.closeWebSocket();
          this.employeeSocket.closeWebSocket();
          this.useraccessSocket.closeWebSocket();
          localStorage.clear();
          sessionStorage.clear()
          this.router.navigate(['/login'])
        }
      },
      (error) => {
        console.error('WebSocket error:', error)
      },
      () => console.warn('WebSocket connection closed')
    );
  }

  closeWebSocket(): void {
    if (this.socket$) {
      // console.log('Closing WebSocket...');
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  reConnect():void{
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role!='SuperAdmin') {
      // console.log('after refresh...');
      // this.connectWebSocket();
    }
  }

}

