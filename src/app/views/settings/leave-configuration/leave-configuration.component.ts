import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { ACCURAL_DAYS_OPTIONS, ACCURAL_MONTH_OPTIONS, EFFECTIVE_FROM_OPTIONS, EFFECTIVE_PERIOD_OPTIONS } from '../../../views/settings/leave-configuration/leave-accural-dropdown-options';
import { CARRYFORWARD_FROM_OPTIONS } from './leave-accural-dropdown-options';
@Component({
  selector: 'app-leave-configuration',
  templateUrl: './leave-configuration.component.html',
  styleUrls: ['./leave-configuration.component.scss']
})
export class LeaveConfigurationComponent implements OnInit {
BreadCrumbsTitle: any = 'Leave Configuration';
accessPermissions = []
user_id: any;
userRole: any;
initialFormValue:any;
leaveTypeForm: FormGroup;
accrualDaysList=ACCURAL_DAYS_OPTIONS;
accrualMonthList=ACCURAL_MONTH_OPTIONS;
effectivePeriodList=EFFECTIVE_PERIOD_OPTIONS;
effectiveFromList=EFFECTIVE_FROM_OPTIONS;
carryForwardList=CARRYFORWARD_FROM_OPTIONS;
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
    private common_service: CommonServiceService, private apiService: ApiserviceService,
    private formUtilityService:FormErrorScrollUtilityService) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.leaveTypeForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.leaveTypeForm?.getRawValue();
      const isInvalid = this.leaveTypeForm?.touched && this.leaveTypeForm?.invalid;
     const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
     let unSavedChanges = isFormChanged || isInvalid;
     this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
  }
  ngOnDestroy(): void {
this.formUtilityService.resetHasUnsavedValue();
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

  public initializeForm() {
    this.leaveTypeForm = this.fb.group({
      leave_type_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), , Validators.maxLength(20)]],
      description: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(200)]], 
    });
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
  }
  public get f() {
    return this.leaveTypeForm?.controls;
  }



// mat-checkbox
public isAccuralEnabled(event:any){

}

public isCreditAccuralNext(event:any){

}

public isAccuralReseted(event:any){

}

public isCarryForwardEnabled(event:any){

}

public isEncashEnabled(event:any){

}

}
