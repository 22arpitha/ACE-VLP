import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
// import { WebsocketService } from './service/websocket.service';
// import { EmployeeStatusWebsocketService } from './service/employee-status-websocket.service';
// import { UserAccessWebsocketService } from './service/user-access-websocket.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '<app-root>',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  title = 'VLP';
 

  connectionStatusMessage!: string;
  connectionStatus!: string;

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    // private websocketService: WebsocketService,
    // private employeeSocket: EmployeeStatusWebsocketService,
    // private useraccessSocket:UserAccessWebsocketService
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
    
  }
 
  async ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
   let vh = window.innerHeight * 0.01;
  //Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  // this.websocketService.reConnect();
  // this.employeeSocket.reConnect();
  // this.useraccessSocket.reConnect();
  }
 
  
  
}
