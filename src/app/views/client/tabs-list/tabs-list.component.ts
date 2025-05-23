import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SubModuleService } from 'src/app/service/sub-module.service';
@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Client Name'
  client_id:any;
  selectedIndex:any=0;
  accessPermissions = []
  user_id: any;
  userRole: any;
  constructor(private common_service: CommonServiceService,private activeRoute:ActivatedRoute,
    private accessControlService:SubModuleService,
  ) { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id');
      this.common_service.clientActiveTabindex$.subscribe((index)=>{
        this.selectedIndex=index;
      })
    }
  }

  ngOnInit(): void {
    this.getModuleAccess()
  }
  public onTabChange(event: MatTabChangeEvent){
  this.selectedIndex=event.index;
  }
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  hasViewAccess(tabName: string): boolean {
    const accessItem = this.accessPermissions.find(item => item.name === tabName);
    // console.log(accessItem)
    return accessItem?.operations[0]?.view === true;
  }
}
