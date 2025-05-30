import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SubModuleService } from '../../../service/sub-module.service';
import { ApiserviceService } from '../../../service/apiservice.service';
@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnInit,OnDestroy {
  BreadCrumbsTitle: any = 'Client Name'
  client_id: any;
  selectedIndex: any = 0;
  accessPermissions = []
  user_id: any;
  userRole: any;
  clientTabVisible: boolean = false
  groupTabVisible: boolean = false
  endClientTabVisible: boolean = false
  jobsTabVisible: boolean = false
  constructor(private common_service: CommonServiceService, private activeRoute: ActivatedRoute,
    private accessControlService: SubModuleService,
        private apiService: ApiserviceService,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.client_id = this.activeRoute.snapshot.paramMap.get('id');
      this.common_service.clientActiveTabindex$.subscribe((index) => {
        this.selectedIndex = index;
      })
    }
  }
  ngOnDestroy(): void {
    this.common_service.setClientActiveTabindex(0);
  }

  ngOnInit(): void {
    this.getModuleAccess()
  }
  public onTabChange(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access;
        this.clientTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Clients');
        this.groupTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Groups');
        this.endClientTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'End Clients');
        this.jobsTabVisible = this.userRole === 'Admin' ? true : this.hasViewPermission(access, 'Jobs');
      }
    },(error)=>{
this.apiService.showError(error?.error?.detail);
    });
  }

  hasViewPermission(accessList: any[], name: string): boolean {
    let item = accessList.find(a => a.name === name);
    return item?.operations?.[0]?.view === true;
  }
  
}
