import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ClassToggleService, HeaderComponent } from '@coreui/angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { NotificationComponent } from 'src/app/views/pages/notification/notification.component';
import { environment } from 'src/environments/environment';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { UserGuideModalComponent } from 'src/app/views/user-guide-modal/user-guide-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { UserWelcomeMsgComponent } from 'src/app/views/user-welcome-msg/user-welcome-msg.component';
import { NotificationService } from '../../../views/pages/notification/notification.service';
import { WebsocketService } from '../../../service/websocket.service';
import { EmployeeStatusWebsocketService } from '../../../service/employee-status-websocket.service';
import { UserAccessWebsocketService } from '../../../service/user-access-websocket.service';

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
  storedNotification:any = [];
  constructor(private classToggler: ClassToggleService, private modalService: NgbModal,
    private router: Router,
    private api: ApiserviceService, private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService, private userGuideModel: BsModalService,
   private location:Location, public dialog: MatDialog,
   private notificationServive:NotificationService,
   private webSocket:WebsocketService, private employeeSocket:EmployeeStatusWebsocketService,
   private useraccessSocket:UserAccessWebsocketService) {
    super();
    this.getScreenSize()
  }
  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id') || '';
    this.orgId = sessionStorage.getItem('organization_id')
    this.user_role_Name = sessionStorage.getItem('user_role_name');
    this.getNotification()
    this.permissionArr = JSON.parse(sessionStorage.getItem('permissionArr')|| '[]');
    // this.welcomeMsg();
    this.getProfiledata()
    this.common_service.title$.subscribe(title => {
      this.pageName = title;
      this.cdref.detectChanges();
    });
    this.common_service.subTitle$.subscribe(subtitle =>{
      this.previousPage = subtitle
    })
    this.getaccessDetails()
    this.common_service.subsctiptionState$.subscribe(status =>{
      if(status){
        // debugger;
        this.getMySubscription()
      }
    })
    if(this.user_role_Name !== 'SuperAdmin'){
      this.getMySubscription()
    }

  }
  getMySubscription(){
    this.api.getData(`${environment.live_url}/${environment.my_subscription}/?organization=${this.orgId}`).subscribe((res:any)=>{
      if(res){
        this.mySubscription = res.data || res
      }
    })
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
  openDialogue() {
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
        this.webSocket.closeWebSocket();
        this.employeeSocket.closeWebSocket();
        this.useraccessSocket.closeWebSocket();
        this.router.navigate(['/login'])
        localStorage.clear();
        sessionStorage.clear();
        this.clearCookies();
        location.reload();
        modelRef.close();
      }
      else {
        modelRef.close();
      }
      modelRef.close();
    })
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
      const modelRef = this.modalService.open(NotificationComponent, {
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
  getProfiledata() {
    this.api.userAccess(sessionStorage.getItem('user_id')).subscribe(
      (res:any)=>{
        // console.log('profile details in side bar', res);
        if(res.user_info[0]['profile_image_path']){
          this.profileDataForSidebar.profile_pic =environment.media_url+res.user_info[0]['profile_image_path'];
        }
        this.profileDataForSidebar.name = res.user_info[0].first_name; 
        this.profileDataForSidebar.last_name = res.user_info[0].last_name;
        this.common_service.setProfilePhoto(this.profileDataForSidebar)
        if(res?.access_list?.length!=0){
          this.welcomeMsg();
        }
      },
      (error => {
          console.log('from default header',error);
      }
    ))
    // this.api.getData(`${environment.live_url}/${environment.profile_custom_user}?id=${this.user_id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res: any) => {
    //   console.log(res,'PROFILE GET API RESPONSE')
    //   if (res.result.data) {
    //     this.profileImg = res?.result?.data[0]?.u_profile_path;
    //     this.profileDataForSidebar.profile_pic = res.result.data[0]['u_profile_photo'];
    //     this.profileDataForSidebar.name = res.result.data[0].u_first_name; 
    //     this.common_service.setProfilePhoto(this.profileDataForSidebar)
    //   }
    // }, (error => {
    //   console.log('from default header',error);
  
  }
  getNotification() {
    this.notificationServive.notificationCount.subscribe((data) => {
      if(data){
        this.notification_count = data;
      }else{
        let params = `${environment.live_url}/${environment.notification}/?user-id=${this.user_id}&page=1&page_size=6`
        this.api.getData(params).subscribe((res: any) => {
          if (res) {
            this.notification_count = res?.total_is_not_seen
            // this.storedNotification = JSON.parse(localStorage.getItem('seenNotifications') || '0');
            // this.notification_count = this.storedNotification?.length ? res.results.length - this.storedNotification?.length : res.results.length
          }
        }, ((error: any) => {
          this.api.showError(error?.error?.message)
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
      message1: `Welcome to Project Ace!. We’re thrilled to have you here. Let us guide you through the main features of our website.`,
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
