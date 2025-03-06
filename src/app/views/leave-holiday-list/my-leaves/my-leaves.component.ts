import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  BreadCrumbsTitle:any='Overview';
  leaveBalence: any = [];
  leaveDetails: any = [];
  holidayList: Object;
  orgId: any;
  leaveData= [];
  user_id: any;
  organization_id: any;
  userRole:string;
  accessPermissions = []
  constructor(
    private api:ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService,
    private accessControlService:SubModuleService) { }
  goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.organization_id = JSON.parse(sessionStorage.getItem('organization_id'))
    this.getLeaveOverview()
    this.getModuleAccess();
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  getLeaveOverview(){
    this.api.getData(`${environment.live_url}/${environment.employee_leaves}/?employee-id=${this.user_id}&organization=${this.organization_id}`).subscribe((res:any)=>{
      if(res){
        this.leaveData = res
      }
    },((error:any)=>{
      this.api.showError(error?.error?.message)
    }))
  }
 
}
