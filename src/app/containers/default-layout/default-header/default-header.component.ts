import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
// import { NotificationComponent } from '../../../views/pages/notification/notification.component';
import { environment } from '../../../../environments/environment';
import { UserGuideModalComponent } from '../../../views/user-guide-modal/user-guide-modal.component';
import { UserWelcomeMsgComponent } from '../../../views/user-welcome-msg/user-welcome-msg.component';
import { NotificationService } from '../../../views/pages/notification/notification.service';
// import { WebsocketService } from '../../../service/websocket.service';
// import { EmployeeStatusWebsocketService } from '../../../service/employee-status-websocket.service';
// import { UserAccessWebsocketService } from '../../../service/user-access-websocket.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { LogoutConfirmationService } from '../../../service/logout-confirmation.service';
import { NotificationsComponent } from '../../../views/notifications/notifications.component';
import { BreakpointObserver } from '@angular/cdk/layout';
@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss'],
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
  user_role_Name: any;
  hideHeaderButton:boolean = false

  @Input() sidebarId: string = "sidebar";
  @Input() pageName: any;
  @Input() previousPage:string;
  public newMessages = new Array(4)
  public newTasks = new Array(5)
  public newNotifications = new Array(5)

  headerNav = [
    {
      link: '/profile',
      page: 'Profile',
      icons: 'bi bi-person-lines'
    },
    // {
    //   link:'../register',
    //   page:'Register',
    //   icons:'bi bi-person-add'
    // },
    {
      link: '/changePasswords',
      page: 'Change Password',
      icons: 'fa fa-key'
    },
    // {
    //   link: '/logout',
    //   page: 'Logout',
    //   icons: 'bi bi-power'
    // }
  ]
  user_id: string;
  user_name: string;
  notes: any;
  screenWidth: number;
  orgId: any;
  permissionArr:any = [];
  dashboardAccess: any;
  bsModalRef?: BsModalRef;
  notification_count: number = 0;
  mySubscription: any;
  showActions: boolean = true;
  storedNotification:any = [];
  constructor(private classToggler: ClassToggleService, private modalService: NgbModal,
    private router: Router, private breakpointObserver: BreakpointObserver,
    private api: ApiserviceService, private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService, private userGuideModel: BsModalService,
   private location:Location, 
   private notificationServive:NotificationService,
  //  private webSocket:WebsocketService, private employeeSocket:EmployeeStatusWebsocketService,
  //  private useraccessSocket:UserAccessWebsocketService,
  private formUtilityService:FormErrorScrollUtilityService,
  private logoutService: LogoutConfirmationService) {
    super();
    this.getScreenSize()
  }
  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id') || '';
    this.orgId = sessionStorage.getItem('organization_id')
    this.user_role_Name = sessionStorage.getItem('user_role_name');
    this.permissionArr = JSON.parse(sessionStorage.getItem('permissionArr')|| '[]');
    // this.welcomeMsg();
    // this.getProfiledata()
    // this.cdref.detectChanges();
    this.breakpointObserver
    .observe([`(max-width: 1023px)`])
    .subscribe(result => {
      this.showActions = result.matches;
      if(this.showActions){
        this.getNotification()
      }
    });
    this.common_service.title$.subscribe(title => {
      this.pageName = title;
    });
    this.common_service.subTitle$.subscribe(subtitle =>{
      this.previousPage = subtitle
    })
    this.getaccessDetails()
  }
 
  getaccessDetails(){
    this.api.userAccess(this.user_id).subscribe(
      (data: any) => {
        // console.log('all list', data,)
        if(data?.access_list.length!=0){
          this.hideHeaderButton = true;
        } else{
          this.hideHeaderButton = false
        }
      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }
  getBack(){
    this.location.back()
  }
  getHeaderNavStyles(type): any {
    switch (type['page']) {
      case 'Logout':
        return 'title-logout'
      case 'Change Password':
        return 'py-1'
    }
  }
  clearStorage(type) {
    if (type['page'] === 'Logout') {
      this.openDialogue()
    }
  }
  async openDialogue() {
    this.logoutService.resetLogoutConfirmed();
    if (this.formUtilityService.hasUnsavedChanges) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `You have unsaved changes. Are you sure you want to logout`;
      modelRef.componentInstance.message = `Confirmation`;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp === "ok") {
          this.logoutService.setLogoutConfirmed(true);
          this.api.showSuccess('You have been logged out!')
          // this.webSocket.closeWebSocket();
          // this.employeeSocket.closeWebSocket();
          // this.useraccessSocket.closeWebSocket();
          this.router.navigate(['/login']);
          localStorage.clear();
          sessionStorage.clear();
          this.clearCookies();
          modelRef.close();
        }
        else {
          this.logoutService.resetLogoutConfirmed();
          modelRef.close();
        }
        modelRef.close();
      });
    }else{
      this.logoutService.resetLogoutConfirmed();
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `Are you sure you want to logout`;
      modelRef.componentInstance.message = `Logout`;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp === "ok") {
          this.api.showSuccess('You have been logged out!')
          // this.webSocket.closeWebSocket();
          // this.employeeSocket.closeWebSocket();
          // this.useraccessSocket.closeWebSocket();
          this.router.navigate(['/login']);
          localStorage.clear();
          sessionStorage.clear();
          this.clearCookies();
          modelRef.close();
        }
        else {
          modelRef.close();
        }
        modelRef.close();
      });
    }
  }

  clearCookies(): void {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  }
  @HostListener('window:resize', ['$event'])
  getScreenSize(_event?: Event) {
    this.screenWidth = window.innerWidth;
  }
  openNotification() {
    // if (this.notes?.length > 0) {
      const modelRef = this.modalService.open(NotificationsComponent, {
        size: <any>'md',
        backdrop: true,
        centered: this.screenWidth < 1023 ? true : false,
        modalDialogClass: 'c_class'
      });

      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          //  this.delete(content);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    // } else {
    //   this.api.showWarning('No new notifications')
    // }




  }

  profileDataForSidebar:any = {
    profile_pic:'',
    name:'',
    last_name:''
  }
 
  getNotification() {
    this.notificationServive.notificationCount.subscribe((data) => {
      if(data){
        this.notification_count = data;
      }else{
        let params = `${environment.live_url}/${environment.vlp_notifications}/?user-id=${this.user_id}&page=1&page_size=10`
        this.api.getData(params).subscribe((res: any) => {
          if (res) {
          // console.log(res)
            this.notification_count = res?.total_no_of_record
            // this.storedNotification = JSON.parse(localStorage.getItem('seenNotifications') || '0');
            // this.notification_count = this.storedNotification?.length ? res.results.length - this.storedNotification?.length : res.results.length
          }
        }, ((error: any) => {
          this.api.showError(error?.error?.detail)
        }))
      }
    })
  }

  welcomeMsg() {
    let count: any = sessionStorage.getItem('logged_count')
    if (count == 1) {
      this.openWelcomeDialog();
    }
  }
  openUserGuideModalComponent(){
    this.isModalOpen = true;
    const initialState: ModalOptions = {
      initialState: {

      },
      class: 'modal-dialog-centered custom-modal-lg',
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.userGuideModel.show(UserGuideModalComponent, initialState);
  }

  isModalOpen = false;
  openWelcomeDialog(){
    this.isModalOpen = true;
    let data = {
      title: 'Hello',
      message1: `Welcome to VLP!. We’re thrilled to have you here. Let us guide you through the main features of our website.`,
      message2: `Click 'Next' to begin the tour or 'Skip' to explore on your own.`,
      isModalOpen: this.isModalOpen
    }
    const modelRef = this.modalService.open(UserWelcomeMsgComponent, {
      size: <any>'sm',
      backdrop: 'static',
      centered: true,
      windowClass: 'welcome-msg'

    });
    modelRef.componentInstance.data = data;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        modelRef.close();
        this.isModalOpen = false;
        sessionStorage.setItem('logged_count', '2');
        this.openUserGuideModalComponent();
      }
      else {
        modelRef.close();
        sessionStorage.setItem('logged_count', '2');
        this.isModalOpen = false;
      }
    })
  }

}
