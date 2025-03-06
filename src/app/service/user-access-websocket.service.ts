import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ApiserviceService } from './apiservice.service'
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UseraccessInfoPopupComponent } from '../views/useraccess-info-popup/useraccess-info-popup.component';

@Injectable({
  providedIn: 'root'
})
export class UserAccessWebsocketService {
  baseurl = environment.socket_url;
  organization_id : any;
  designation:any
  user_role:string
  token:string
  private socketOfAccess$: WebSocketSubject<any> | null = null;

  constructor(private api: ApiserviceService, private router: Router, private modalService: NgbModal,) {
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role==='Employee') {
      this.connectWebSocket();
    }
  }

  connectWebSocket(): void {
    if (this.socketOfAccess$ && !this.socketOfAccess$.closed) {
      // console.log('user-access WS already connected. Skipping reconnection.');
      return;
    }

    this.socketOfAccess$ = new WebSocketSubject(`wss://${this.baseurl}/ws/check-designation-access-changed/`);

    this.organization_id = sessionStorage.getItem('organization_id');
    this.designation = sessionStorage.getItem('designation');
    
    this.socketOfAccess$.subscribe(
      (message) => {
        // console.log('user-access WS message:', message);
        if ( message?.organization===this.organization_id && message?.designation_name===this.designation && message?.message?.is_changed === true) {
          this.openWelcomeDialog()
        }
      },
      (error) => {
        console.error('user-access WS error:', error)
      },
      () => console.warn('user-access WS connection closed')
    );
  }

  closeWebSocket(): void {
    if (this.socketOfAccess$) {
      // console.log('Closing user-access WS...');
      this.socketOfAccess$.complete();
      this.socketOfAccess$ = null;
    }
  }

  reConnect():void{
    const token = sessionStorage.getItem('token');
    const user_role = sessionStorage.getItem('user_role_name');
    if (token && user_role==='Employee') { 
      this.connectWebSocket();
    }
  }

  isModalOpen = false;
  openWelcomeDialog(){
      this.isModalOpen = true;
      let data = {
        title: 'Info',
        message1: `Admin has modified the designation access`,
        message2: ``,
        isModalOpen: this.isModalOpen
      }
      const modelRef = this.modalService.open(UseraccessInfoPopupComponent, {
        size: <any>'sm',
        backdrop: 'static',
        centered: true,
        windowClass: 'welcome-msg'
  
      });
      modelRef.componentInstance.data = data;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          modelRef.close();
          window.location.reload();
        }
        else {
          modelRef.close();
          this.isModalOpen = false;
        }
      })
    }
}