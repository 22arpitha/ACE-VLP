import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { CreateUpdateEmployeeComponent } from '../create-update-employee/create-update-employee.component';
import { Observable } from 'rxjs';
import { GenericRedirectionConfirmationComponent } from 'src/app/generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tabs-of-employee',
  templateUrl: './tabs-of-employee.component.html',
  styleUrls: ['./tabs-of-employee.component.scss']
})
export class TabsOfEmployeeComponent implements OnInit {
  emp_id: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  clientTabVisible: boolean = false
  updateEmployeeTabVisible: boolean = false;
  selectedTabIndex = 0;
   @ViewChild('EmployeeFormComponent') EmployeeFormComponent: CreateUpdateEmployeeComponent;
  constructor(private common_service: CommonServiceService, private activeRoute: ActivatedRoute,
    private accessControlService: SubModuleService,
        private apiService: ApiserviceService,private modalService: NgbModal,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.emp_id = this.activeRoute.snapshot.paramMap.get('id');
    }
  }

  ngOnInit(): void {
    this.getModuleAccess()
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access;
      }
    },(error)=>{
this.apiService.showError(error?.error?.detail);
    });
  }

  public async onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
  }

}
