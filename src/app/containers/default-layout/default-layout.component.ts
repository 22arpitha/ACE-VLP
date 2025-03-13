import { Component, HostListener } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { navItems } from '../../views/_nav';
import { navItems1 } from '../../views/_nav1';
import { ApiserviceService } from '../../service/apiservice.service';
import { GenericDeleteComponent } from '../../generic-delete/generic-delete.component';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../service/common-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { WebsocketService } from '../../service/websocket.service';
import { EmployeeStatusWebsocketService } from '../../service/employee-status-websocket.service';
import { UserAccessWebsocketService } from '../../service/user-access-websocket.service';

interface NavItem {
  name: string;
  url?: string;
  icon?: string;
  children?: NavItem[];
  isExpanded?: boolean;
}
@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls:['./default-layout.component.scss']
})
export class DefaultLayoutComponent {
  iconSize = false;
  fgSize:number = 30;
  user_role_Name: any;
  user_name: string;
  last_name:any;
  public navItems = navItems;
  public nav1 = navItems1;
  currentUrl: any = '';
  currentUrlName: any = '';
  public perfectScrollbarConfig = {
    suppressScrollX: true,
  };
  admin: any;
  permission: any;
  sidebarNavItems: any;
  sidebarNavItemsStatic:any=[
    {
      "name": "Templates",
      "icon": "bi bi-check-circle",
      "is_show": true,
      "url": '/templates',
      "access": [
          {
              "name": "Templates",
              "operations": [
                  {
                      "view": false,
                      "create": false,
                      "delete": false,
                      "update": false
                  }
              ]
          }
      ]
    },
    {
      "name": "Componay Policy",
      "icon": "bi bi-check-circle",
      "is_show": true,
      "access": [
          {
              "name": "Componay Policy",
              "operations": [
                  {
                      "view": false,
                      "create": false,
                      "delete": false,
                      "update": false
                  }
              ]
          }
      ]
    },{
    "name": "Settings",
    "icon": "bi bi-sliders2",
    "is_show": true,
    "children": [
      {
        "name": "Services",
        "url": "/settings/services"
    }, {
      "name": "Empolyee",
      "url": "/settings/all-employee"
  },
        {
            "name": "Country",
            "url": "/settings/country"
        },
        {
            "name": "Job Type",
            "url": "/settings/job-type"
        },
      {
            "name": "Source",
            "url": "/settings/source"
        },
      {
            "name": "Status Group",
            "url": "/settings/status-group"
        },
       {
            "name": "Job Status",
            "url": "/settings/job-status"
        },
             {
            "name": "leave Type",
            "url": "/settings/leave-type"
        }, 
        {
          "name": "Designation",
          "url": "/settings/designation"
        },
        {
          "name": "Roles",
          "url": "/settings/roles"
        },
    ],
    "access": [
        {
            "name": "Settings",
            "operations": [
                {
                    "view": false,
                    "create": false,
                    "delete": false,
                    "update": false
                }
            ]
        }
    ]
  }];
  config: string;
  access: any = [];
  user_id: any;
  org_id: any;
  profileImage:any = null;
  headerNav = [
    {
      link: '/profile',
      page: 'Profile',
      icons: 'bi bi-person'
    },
    {
      link: '/changePasswords',
      page: 'Change Password',
      icons: 'bi bi-key'
    }
   
  ]
  mySubscription: boolean = false;
  orgId: any;
  subscriptionData = [];
  
  constructor(private ngxService: NgxUiLoaderService,
    private api: ApiserviceService, private modalService: NgbModal,private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService,
    private router: Router,  private webSocket: WebsocketService, private employeeSocket:EmployeeStatusWebsocketService,
    private useraccessSocket:UserAccessWebsocketService) {
      this.common_service.profilePhoto$.subscribe(
        (data:any)=>{
          if(data){
            this.profileImage = data.profile_pic;
            this.user_name  = data.name;
            this.last_name  = data.last_name;
          }
        }
      )
    
}

  async ngOnInit() {
    this.user_role_Name = sessionStorage.getItem('user_role_name');
    this.orgId = sessionStorage.getItem('organization_id');
    
    this.testingFunction();
   
    this.ngxService.start();
    setTimeout(() => {
      this.ngxService.stop();
    }, 1000);
    this.ngxService.startBackground("do-background-things");
    this.ngxService.stopBackground("do-background-things");
    this.ngxService.startLoader("loader-01");
    setTimeout(() => {
      this.ngxService.stopLoader("loader-01");
    }, 1000);
    
    if (this.user_role_Name && this.user_role_Name !== 'SuperAdmin') {
      this.getMySubscription()
    }

    // Listen to subscription state changes
    this.common_service.subsctiptionState$.subscribe((res) => {
      if (res && this.user_role_Name !== 'SuperAdmin'  ) {
        this.getMySubscription();
      }
    });
  }
  
  
  
  getMySubscription() {
    this.api.getData(`${environment.live_url}/${environment.my_subscription}/?organization=${this.orgId}`).subscribe((res: any) => {
      if (res) {
        if (res?.data?.length ===0 || res?.length ===0) {
          this.mySubscription = true;
          if (this.user_role_Name === 'Admin'){
            this.router.navigate(['/accounts/subscription']);
          }else if (this.user_role_Name === 'Employee'){
            this.router.navigate(['/login']);
            this.api.showWarning('Please contact your admin')
          }
          // this.router.navigate(['/accounts/subscription']);
        } else if (res?.data) {
          let hasActiveSubscription = false;
          this.subscriptionData = res?.data
          res?.data?.forEach(element => {
            if (element.is_active) {
              hasActiveSubscription = false;
            }else{
              hasActiveSubscription = true;
            }
          });
          
          this.mySubscription = hasActiveSubscription;
          if (!hasActiveSubscription) {
            this.router.onSameUrlNavigation
          }else{
            this.router.navigate(['/accounts/subscription']);
          }
        } else {
          this.mySubscription = false;
          this.router.navigate(['/dashboards']);
        }
      }
    });
  }

  shouldDisableItem(item: any): boolean {
    // Don't disable anything for SuperAdmin
    if (this.user_role_Name === 'SuperAdmin') return false;
    
    // If subscription is required and item is not subscription page
    return this.mySubscription && item.url !== '/accounts/subscription';
  }
 subModulesAccess:any = []
  toggleSubmenu(item: any) {
    this.subModulesAccess = item.access;
    // this.api.setSubModules(this.subModulesAccess)
    // console.log('subModulesAccess',this.subModulesAccess)
    this.sidebarNavItems.forEach(navItem => {
      if (navItem !== item) {
        navItem.isExpanded = false;
      }
    });
    item.isExpanded = !item.isExpanded;
  }

  setInitialExpandedState() {
    const currentUrl = this.router.url;
    this.sidebarNavItems.forEach(item => {
      if (item.children?.length) {
        item.isExpanded = item.children.some(child => 
          currentUrl.includes(child.url)
        );
      }
    });
  }
 
// Helper function to move subscription to top
private moveSubscriptionToTop(navigationData: any[]): any[] {
  if (!Array.isArray(navigationData)) {
    return navigationData;
  }

  const subscriptionIndex = navigationData.findIndex(
    (item) => item.name === "Subscription"
  );

  if (subscriptionIndex !== -1) {
    const [subscriptionItem] = navigationData.splice(subscriptionIndex, 1);
    navigationData.unshift(subscriptionItem);
  }

  return navigationData;
}

testingFunction() {
  this.sidebarNavItems = this.sidebarNavItemsStatic;
  // this.api.userAccess(sessionStorage.getItem('user_id')).subscribe(
  //   (res: any) => {
  //   //  console.log('default layout', res.access_list);
      
  //     if (res.user_role == 'Employee') {
  //       this.user_role_Name = res.designation;
  //     } else {
  //       this.user_role_Name = res.user_role;
  //     }
      
  //     // Move subscription to top before assigning to sidebarNavItems
  //     this.sidebarNavItems = this.moveSubscriptionToTop(res.access_list);
  //   }
  // );
}
  getUserControls(role_id) {
    this.org_id = sessionStorage.getItem('org_id')
    this.api.getUserRoleById(`id=${role_id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.org_id}`).subscribe(res => {
    // console.log(res,'oooooooooooooooooo')
      if (res) {
        this.permission = res['data'][0]?.permissions;
        if (this.permission?.length > 0) {
          const modifiedData = this.permission.map(permissionObj => {
            const newObj = {};

            Object.keys(permissionObj).forEach((key) => {
              let modifiedKey = key;

              permissionObj[key].forEach(permission => {
                if (permission.includes("VIEW")) {
                  switch (key) {
                    case 'MY_LEAVES':
                      modifiedKey = 'My Leaves';
                      break;
                    case 'LEAVE_MASTER':
                      modifiedKey = 'Leave Master';
                      break;
                    case 'OFFICE_WORKING_DAYS':
                      modifiedKey = 'Office Working Day';
                      break;
                    case 'ADD_ON_LEAVE_REQUEST':
                      modifiedKey = 'Add On Leaves Request';
                      break;
                    case 'APPLIED/APPROVIED_LEAVES':
                      modifiedKey = 'Applied Approved Leaves';
                      break;
                    case 'PEOPLE_TIMESHEET':
                      modifiedKey = 'Timesheets';
                      break;
                    case 'MONTH_APPROVAL_TIMESHEET':
                      modifiedKey = 'Month Timesheet';
                      break;
                    case 'APPROVAL_CONFIGURATION':
                      modifiedKey = 'Approval Configuration';
                      break;
                    case 'DEAD_LINE_CROSSED':
                      modifiedKey = 'Deadline Crossed';
                      break;
                    case 'TODAY_APPROVAL_TIMESHEET':
                      modifiedKey = 'Todays Approvals';
                      break;
                    case 'PROJECTS':
                      modifiedKey = 'Projects';
                      break;
                    case 'PROJECT_STATUS':
                      modifiedKey = 'Project Status';
                      break;
                    case 'PEOPLE_TIMESHEET_CALENDER':
                      modifiedKey = 'Timesheet Calender';
                      break;
                    case 'PROJECT_TASK_CATEGORIES':
                      modifiedKey = 'Project Category ';
                      break;
                    case 'MAIN_CATEGORIES':
                      modifiedKey = 'Main Project Category ';
                      break;
                    case 'SUB_CATEGORIES':
                      modifiedKey = 'Sub Project Category ';
                      break;
                    case 'CLIENTS':
                      modifiedKey = 'Clients';
                      break;
                    case 'TAGS':
                      modifiedKey = 'Tag List';
                      break;
                    case 'PEOPLE':
                      modifiedKey = 'Employees';
                      break;
                    case 'CENTERS':
                      modifiedKey = 'Centers';
                      break;
                    case 'PREFIX/SUFFIX':
                      modifiedKey = 'Prefix/Suffix List';
                      break;
                    case 'ROLES':
                      modifiedKey = 'Role List';
                      break;
                    case 'DEPARTMENT':
                      modifiedKey = 'Department List';
                      break;
                    case 'ACCOUNTS_MENU':
                      modifiedKey = 'Subscription';
                      break;
                    case 'INDUSTRY/SECTOR':
                      modifiedKey = 'Industry/Sector List';
                      break;
                    case 'ORGANIZATION':
                      modifiedKey = 'Organization List';
                      break;
                    case 'REVIEW':
                      modifiedKey = 'Approvals';
                      break;
                      case 'COMPANY':
                        modifiedKey = 'Company';
                        break;

                  }
                }


              })
              newObj[modifiedKey] = permissionObj[key];
              permissionObj[key].forEach(permission => {
                if (permission.includes("CREATE")) {
                  switch (key) {
                    case 'DEPARTMENT':
                      modifiedKey = 'Create Department';
                      break;
                    case 'ROLES':
                      modifiedKey = 'Create Role';
                      break;
                    case 'EMPLOYEE':
                      modifiedKey = 'Create Employee';
                      break;
                    case 'PREFIX/SUFFIX':
                      modifiedKey = 'Create Prefix/Suffix';
                      break;
                    case 'CENTERS':
                      modifiedKey = 'Add Centers';
                      break;
                    case 'TAGS':
                      modifiedKey = 'Add New Tag';
                      break;
                    case 'INDUSTRY/SECTOR':
                      modifiedKey = 'Create Industry/Sector';
                      break;
                    case 'PROJECT_TASK_CATEGORIES':
                      modifiedKey = 'Add New category';
                      break;
                    case 'PROJECTS':
                      modifiedKey = 'Add New Project';
                      break;

                    case 'LEAVE_APPLICATION':
                      modifiedKey = 'Leave Application';
                      break;
                    case 'CLIENTS':
                      modifiedKey = 'Create Client';
                      break;
                    case 'PEOPLE_TIMESHEET':
                      modifiedKey = 'Create new Timesheet';
                      break;
                  }
                }
              })
              newObj[modifiedKey] = permissionObj[key];
              permissionObj[key].forEach(permission => {
                if (permission.includes("ADD")) {
                  switch (key) {
                    case 'ORGANIZATION':
                      modifiedKey = 'Create Organization';
                      break;
                    // Add the remaining cases for ADD here
                  }
                }

              })
              newObj[modifiedKey] = permissionObj[key];
            })
            return newObj;
          })
          const filteredNavItems = this.nav1.map((item) => {
            if (item.children) {
              // Filter out child items that don't have the "VIEW" option
              item.children = item.children.filter((child) => {
                return modifiedData.some((permission) => Object.keys(permission).includes(child.name));
              });

              // Check if any child items remain after filtering
              if (item.children.length > 0) {
                return item;
              } else {
                return null;
              }
            } else {
              // Check if the item name exists in the modifiedData keys
              return modifiedData.some((permission) => Object.keys(permission).includes(item.name)) ? item : null;
            }
          }).filter(Boolean); // Remove null values from the array
          const sidebarOptions = filteredNavItems.map((item) => item.name);
          this.sidebarNavItems = this.nav1.filter((item) => sidebarOptions.includes(item.name));
          this.sidebarNavItems.unshift({
            name: 'Dashboard',
            url: '/dashboards',
            icon: 'bi bi-speedometer',
          });
          console.log(this.sidebarNavItems,'this.sidebarNavItems')
        }
      }
    })
  }
  getCountDetails() {
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
    let id = {
      user_id: this.user_id
    }
  }

  clearStorage(type) {
    if (type['page'] === 'Logout') {
      this.openDialogue()
    }
  }
  openDialogue() {

    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: <any>'sm'
      ,
      backdrop: true,
      centered: true
    });
    modelRef.componentInstance.title = `Are you sure you want to logout`;
    modelRef.componentInstance.message = `Logout`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        this.api.showSuccess('You have been logged out!')
        localStorage.clear();
        sessionStorage.clear()
        this.webSocket.closeWebSocket();
        this.employeeSocket.closeWebSocket();
        this.useraccessSocket.closeWebSocket();
        this.router.navigate(['/login'])
        location.reload();
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }
  getHeaderNavStyles(type): any {
    switch (type['page']) {
      case 'Logout':
        return 'title-logout'
      case 'Change Password':
        return 'py-1'
    }
  }
  navigateTo(headNavdata:any){
if(headNavdata.page==='Logout'){
  this.openDialogue();
}else{
  this.router.navigate([`${headNavdata.link}`]);
}
  }

  
}
