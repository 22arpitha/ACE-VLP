import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { ACCURAL_DAYS_OPTIONS, ACCURAL_MONTH_OPTIONS, EFFECTIVE_FROM_OPTIONS, EFFECTIVE_PERIOD_OPTIONS } from '../../../views/settings/leave-configuration/leave-accural-dropdown-options';
import { CARRYFORWARD_FROM_OPTIONS } from './leave-accural-dropdown-options';
import { Router } from '@angular/router';
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
  initialFormValue: any;
  leaveTypeForm: FormGroup;
  accrualDaysList = ACCURAL_DAYS_OPTIONS;
  accrualMonthList = ACCURAL_MONTH_OPTIONS;
  effectivePeriodList = EFFECTIVE_PERIOD_OPTIONS;
  effectiveFromList = EFFECTIVE_FROM_OPTIONS;
  carryForwardList = CARRYFORWARD_FROM_OPTIONS;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private accessControlService: SubModuleService,
    private common_service: CommonServiceService, private apiService: ApiserviceService, private router: Router,
    private formUtilityService: FormErrorScrollUtilityService) {
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
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
  }
  ngOnDestroy(): void {
    this.formUtilityService.resetHasUnsavedValue();
  }
  getModuleAccess() {
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
      leave_description: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(200)]],
      utilization: [''],
      effective_value: ['', [Validators.required, Validators.pattern(/^\d{1,2}$/), Validators.maxLength(2), Validators.min(0)]],
      effective_cycle: ['', Validators.required],
      leave_effective_from: ['', Validators.required],
      is_accrual: [false],
      accrual_cycle: [''],
      accrual_day: [''],
      accrual_month: [''],
      accrual_credits: [''],
      // policy_date: [''],
      // policy_month: [''],
      prorate_accural: [''],
      is_reset: [false],
      reset_cycle: [''],
      reset_day: [''],
      reset_month: [''],
      is_carry_forward: [false],
      carry_forward_cycle: [''],
      carry_forward_day: [''],
      encash_value: [''],
    });
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
  }
  public get f() {
    return this.leaveTypeForm?.controls;
  }


  simpleToggleRequired(enable: boolean, controlNames: string[]) {
    controlNames.forEach(name => {
      const control = this.leaveTypeForm.get(name);
      if (enable) {
        control?.setValidators(Validators.required);
      } else {
        control?.clearValidators();
        control?.reset();
      }
      control?.updateValueAndValidity();
    });
  }

  // mat-checkbox
  public isAccuralEnabled(event: any) {
    this.simpleToggleRequired(event.checked, [
      'accrual_cycle',
      'accrual_day',
      'accrual_month',
      'accrual_credits',
      'prorate_accural',
    ]);
  }

  // accrualLeaveCycle(event: any) {
  //   console.log(event)
  //   if (event.value === 'yearly') {
  //     this.simpleToggleRequired(true, [
  //       'accrual_month',
  //     ]);
  //   } 
  //   else {
  //     this.simpleToggleRequired(false, [
  //       'accrual_month',
  //     ]);
  //   }
  // }
  accrualAndResetLeaveCycle(event: any,text:string) {
  console.log(event);
  let control_name:any;
  const isYearly = event.value === 'yearly';
  if(text==='accrual'){
    control_name = 'accrual_month'
  } else{
     control_name = 'reset_month'
  }
  this.simpleToggleRequired(isYearly, [control_name]);
}

  public isCreditAccuralNext(event: any) {

  }

  public isAccuralReseted(event: any) {
    const controls = [
      'reset_cycle',
      'reset_day',
      'reset_month',
      'is_carry_forward',
      'encash_value',
    ];

    if (!event.checked) {
      controls.push('carry_forward_cycle', 'carry_forward_day');
    }
    console.log(controls)
    this.simpleToggleRequired(event.checked, controls);
    // this.simpleToggleRequired(event.checked, [
    //   'reset_cycle',
    //   'reset_day',
    //   'reset_month',
    //   'is_carry_forward',
    //   'carry_forward_cycle',
    //   'carry_forward_day',
    //   'encash_above_limit',
    //   'encash_over_limit',
    // ]);
  }

  public isCarryForwardEnabled(event: any) {
    this.simpleToggleRequired(event.checked, [
      'carry_forward_cycle',
      'carry_forward_day',
    ]);
  }

  public isEncashEnabled(event: any) {

  }
  addOrUpdate() {
    if (this.leaveTypeForm.invalid) {
      console.log('error', this.leaveTypeForm.controls)
    } else {
      console.log('succes', this.leaveTypeForm.value)
    }
  }

  backToLeaveTypes() {
    this.router.navigate(['/settings/leave-type'])
  }
}
