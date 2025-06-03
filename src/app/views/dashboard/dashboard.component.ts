import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiserviceService } from '../../service/apiservice.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SubModuleService } from '../../service/sub-module.service';

@Component({
  // selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  BreadCrumbsTitle: any = 'Dashboard';
  role: any;
  department: any;
  industry: any;
  user_id: any;
  user_role_name: string;
  organization: any;
  admin: any;
  userCount: any;
  enable: boolean = false;
  permissionRoles: any = [];
  permissionsDepartment: any = [];
  permissionsIndustry: any;
  org_id: any;
  organizationlistData: any = [];
  adminlistData: any = [];
  userslistData: any = [];
  rolesListData: any = [];
  sortedRolls: any[];
  departmentsListData: any = [];
  industriesListData: any = [];
  pagination: any;
  organizationCount: any;
  adminCount: any;
  designationCount: any;
  departmentCount: any;
  organizationuserslist: any = [];
  organizationuserCount: any;
  bsModalRef?: BsModalRef;
  accessPermissions:any = []
  constructor(private builder: FormBuilder, private api: ApiserviceService,
    private location: Location,
    private route: ActivatedRoute,
    private common_service: CommonServiceService, private accessControlService:SubModuleService) {

  }
 
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id')
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
    this.user_role_name = sessionStorage.getItem('user_role_name').toUpperCase()
    this.getModuleAccess()

    if (this.user_role_name !== 'SUPERADMIN') {
      this.getRecentAddedRolesListData()
      this.getRecentAddedDepartmentListData()
      this.getRecentAddedOrganizationuserslist()
    } if (this.user_role_name === 'SUPERADMIN') {
      this.getRecentAddedOrganizationList()
      this.getRecentAddedAdminlistData()
      this.getRecentAddeduserslistData()
    }
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  getCountDetails(isloggedIn) {
   
    let id = {
      user_id: this.user_id,
      organization_id: this.org_id
    }
    this.api.getCount(id, isloggedIn).subscribe((data: any) => {
      if (data.result) {
        this.role = data.result.no_of_roles;
        this.department = data.result.no_of_department;
        this.industry = data.result.no_of_industries;
        this.organization = data.result.no_of_organization;
        this.admin = data.result.no_of_admin;
        this.userCount = data.result.no_of_users
        this.enable = true;
        // this.getRecentAddedOrganizationList();
        // this.getRecentAddeduserslistData();
        // this.getRecentAddedAdminlistData();
      }

    }
      , ((error: any) => {
        this.api.showError(error?.error.error.message)
      })
    )
  }

  // organization list
  getRecentAddedOrganizationList() {

    this.api.getData(`${environment.live_url}/${environment.organization}/`).subscribe((res: any) => {
      if (res) {
        this.organizationlistData = res.slice(0, 5)
        this.organizationCount = res?.length
      }
    }, (error => {
      this.api.showError(error?.error?.message)
    }))
  }

  // Admin List
  getRecentAddedAdminlistData() {

    this.api.getData(`${environment.live_url}/${environment.user}/?role_id=2`).subscribe((data: any) => {
      this.adminlistData = data.slice(0, 5);
      this.adminCount = data?.length
    }, ((error) => {
      this.api.showError(error?.error?.message)
    })
    )
  }
  // users list
  getRecentAddeduserslistData() {
    this.api.getData(`${environment.live_url}/${environment.user}/?role_id=3`).subscribe((data: any) => {
      this.userslistData = data.slice(0, 5);
      this.userCount = data?.length
    }, ((error) => {
      this.api.showError(error?.error?.message)
    })
    )
  }
  getRecentAddedOrganizationuserslist() {
    this.api.getData(`${environment.live_url}/${environment.user}/?role_id=3&organization_id=${this.org_id}`).subscribe((data: any) => {
      this.organizationuserslist = data.slice(0, 5);
      this.organizationuserCount = data?.length
    }, ((error) => {
      this.api.showError(error?.error?.message)
    })
    )
  }
  // Roles list
  getRecentAddedRolesListData() {

    this.api.getData(`${environment.live_url}/${environment.designation}/?organization_id=${this.org_id}`).subscribe((data: any) => {
      this.sortedRolls = []
      if (data) {

        this.rolesListData = data.slice(0, 5);
        this.designationCount = data?.length
      }
    }, ((error) => {
      this.api.showError(error?.error?.message)
    })

    )
  }

  // Department list
  getRecentAddedDepartmentListData() {
    this.api.getData(`${environment.live_url}/${environment.department}/?organization_id=${this.org_id}`).subscribe((res: any) => {
      if (res) {
        this.departmentsListData = res.slice(0, 5)
        this.departmentCount = res?.length
      }
      else {
        this.api.showError('Error!')
      }

    }, ((error) => {
      this.api.showError(error?.error?.message)
    }))
  }
  // industries list
  getRecentAddedindustriesListData() {
    let params: any = {
      page_number: 1,
      data_per_page: 5,
      search_key: '',
      org_ref_id: this.org_id,
      pagination: 'TRUE'
    }
    this.api.getIndustryDetailsPage(params).subscribe((data: any) => {
      this.industriesListData = data.result.data;
    }, error => {
      this.api.showError(error.error.error.message)

    }

    )
  }
}
