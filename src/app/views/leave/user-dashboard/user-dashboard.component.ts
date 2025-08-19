import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  all_employees_under_manager: any = [];
  selectedItems: any = [];
  dropdownSettings: any = {};


  BreadCrumbsTitle: any = 'Dashboard';
  accessPermissions = [];
  user_id: any;
  userRole: any;

  constructor(private common_service: CommonServiceService, private accessControlService: SubModuleService,
    private apiService: ApiserviceService,) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  getAlEmployeesUnderManager(){
    this.apiService.getAlEmployeesUnderManager(this.user_id).subscribe(
      (res:any)=>{
        this.all_employees_under_manager = res.results
      },
      err=>{

      }
    )
  }

  onItemSelect(event: any) { }
  onSelectAll(event: any) { }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getEmployeeLeaves();
    this.getUpcomingHoliday();
  }

  all_leaves: any;

  getEmployeesByManager() {

  }

  getEmployeeLeaves() {
    this.apiService.getEmployeeLeaves(this.user_id).subscribe(
      (res: any) => {
        this.all_leaves = res.results
      },
      (err) => {

      }
    )
  }

  upcoming_holidays: any;

  getUpcomingHoliday() {
    this.apiService.getUpcomingHolidays().subscribe(
      (res: any) => {
        this.upcoming_holidays = res
      }
    )
  }

  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        // this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

}
