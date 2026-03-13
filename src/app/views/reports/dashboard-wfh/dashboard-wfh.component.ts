import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatTab, MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { ApiserviceService } from '../../../service/apiservice.service';

@Component({
  selector: 'app-dashboard-wfh',
  templateUrl: './dashboard-wfh.component.html',
  styleUrls: ['./dashboard-wfh.component.scss'],
  standalone:false
})
export class DashboardWfhComponent implements OnInit {

 // @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
@ViewChildren(MatTab) tabs!: QueryList<MatTab>;


BreadCrumbsTitle: any = 'WFH Limited Flexibility Reports'
  client_id: any;
  selectedIndex: any = 0;
  accessPermissions = []
  user_id: any;
  userRole: any;
  clientTabVisible: boolean = false
  groupTabVisible: boolean = false
  endClientTabVisible: boolean = false
  jobsTabVisible: boolean = false
  tabMap: any = {};
  isDeepLinkNavigation = false;
  ignoreNextNavigation = false;

   viewToLabelMap: any = {
    'leave-requests': 'Leave Requests',
    'compensatory-request': 'Compensatory Request',
    'customize-balance': 'Customize Balance',
    'resource-availability': 'Resource Availability',
    'dashboard': 'Dashboard',
    'my-leaves': 'My Leaves',
    'comp-off': 'Comp-off'
  };

  constructor(private common_service: CommonServiceService, private activeRoute: ActivatedRoute,
    private accessControlService: SubModuleService, private router:Router,
        private apiService: ApiserviceService,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.client_id = this.activeRoute.snapshot.paramMap.get('id');
      // this.common_service.dashboardActiveTabindex$.subscribe((index) => {
      //   this.selectedIndex = index;
      // })
    }
  }
//   ngAfterViewInit() {
//   this.openTabFromUrl();
//   this.tabs.changes.subscribe(() => this.openTabFromUrl());
// }


  // ngOnDestroy(): void {
  //   this.common_service.setDashboardActiveTabindex(0);
  // }

  ngOnInit(): void {
    this.getModuleAccess();
    setTimeout(() => this.openTabFromUrl());
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      setTimeout(() => this.openTabFromUrl());
    });
  //   this.activeRoute.queryParamMap.subscribe(params => {
  //   const view = params.get('view');
  //   const leaveId = params.get('leave-id');
  //   // CASE 1: view exists but tab not available for this role
  //   if (view && this.tabMap[view] === undefined) {
  //     this.router.navigate([], {
  //       queryParams: { view: null, 'leave-id': null , user_id:null},
  //       queryParamsHandling: 'merge',
  //       replaceUrl: true
  //     });
  //     return;
  //   }
  //   // CASE 2: valid tab → open correct tab
  //   if (view && this.tabMap[view] !== undefined) {
  //     this.selectedIndex = this.tabMap[view];
  //     return;
  //   }
  //   // normal behavior
  //   const savedIndex = sessionStorage.getItem('leave_tab_index');
  //   this.selectedIndex = savedIndex ? +savedIndex : 0;
  // });


    // const savedIndex = sessionStorage.getItem('leave_tab_index');
    // this.selectedIndex = savedIndex ? +savedIndex : 0;

    // this.common_service.dashboardActiveTabindex$
    // .subscribe((index) => {
    //   this.selectedIndex = index ?? 0;
    // });

      this.setReportType();
  }

  currentReportType: string = '';

 

  

  setReportType() {
    const url = this.router.url;

    if (url.includes('wfh-prolonged-health-issues-summary-report')) {
      this.currentReportType = 'PROLONGED';
    } else {
      this.currentReportType = 'LIMITED';
    }
  }
 private openTabFromUrl() {
   if (this.ignoreNextNavigation) {
     this.ignoreNextNavigation = false;
     return;
   }
  const view = this.activeRoute.snapshot.queryParamMap.get('view');
  if (!view) {
    const savedIndex = sessionStorage.getItem('leave_tab_index');
    this.selectedIndex = savedIndex ? +savedIndex : 0;
    return;
  }
  const expectedLabel = this.viewToLabelMap[view];
  if (!expectedLabel) return;
  const tabArray = this.tabs.toArray();
  const index = tabArray.findIndex((tab:any) => tab.textLabel === expectedLabel);
  // tab not available for role
  if (index === -1) {
    this.ignoreNextNavigation = true;
    this.router.navigate([], {
      queryParams: { view: null, 'leave-id': null, user_id: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    return;
  }

  // this.isDeepLinkNavigation = true;
  this.selectedIndex = index;
}



  public onTabChange(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
    if (this.isDeepLinkNavigation) {
      this.isDeepLinkNavigation = false;
      return;
    }
    sessionStorage.setItem('leave_tab_index', event.index.toString());
    // this.common_service.setDashboardActiveTabindex(event.index);
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access:any) => {
      if (access) {
        this.accessPermissions = access;
        // this.clientTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Clients');
        // this.groupTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Groups');
        // this.endClientTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'End Clients');
        // this.jobsTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Jobs');
      }
    },(error:any)=>{
this.apiService.showError(error?.error?.detail);
    });
  }

  hasViewPermission(accessList: any[], name: string): boolean {
    let item = accessList.find(a => a.name === name);
    return item?.operations?.[0]?.view === true;
  }

}
