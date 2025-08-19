import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { ACCURAL_DAYS_OPTIONS, ACCURAL_MONTH_OPTIONS, EFFECTIVE_FROM_OPTIONS, EFFECTIVE_PERIOD_OPTIONS, PERIOD_OPTIONS } from '../../../views/settings/leave-configuration/leave-accural-dropdown-options';
import { CARRYFORWARD_FROM_OPTIONS } from './leave-accural-dropdown-options';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
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
  item_id:any;
  editLeaveType:boolean = false;
  accrualDaysList = ACCURAL_DAYS_OPTIONS;
  accrualMonthList = ACCURAL_MONTH_OPTIONS;
  effectivePeriodList = EFFECTIVE_PERIOD_OPTIONS;
  periodList = PERIOD_OPTIONS;
  effectiveFromList = EFFECTIVE_FROM_OPTIONS;
  carryForwardList = CARRYFORWARD_FROM_OPTIONS;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private accessControlService: SubModuleService,
    private common_service: CommonServiceService, private apiService: ApiserviceService, private router: Router,
    private formUtilityService: FormErrorScrollUtilityService , private activeRouter: ActivatedRoute) {
      this.common_service.setTitle(this.BreadCrumbsTitle);
      this.item_id = this.activeRouter.snapshot.paramMap.get('id')
      if(this.item_id){
        this.getLeaveTypeDetails();
        this.editLeaveType = false;
      } else{
        this.editLeaveType = true;
      }
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

  getLeaveTypeDetails(){
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/${this.item_id}/`).subscribe(
      (res:any)=>{
        this.leaveTypeForm.patchValue({
          leave_type_name: res.leave_type_name,
          leave_description: res.leave_description,
          utilization_before: res.utilization_before,
          utilization_after: res.utilization_after,
          effective_value: res.effective_value,
          effective_cycle: res.effective_cycle,
          leave_effective_from: res.leave_effective_from,
          is_accrual: res.is_accrual,
          accrual_cycle: res.accrual_cycle,
          accrual_day: res.accrual_day,
          accrual_month: res.accrual_month,
          accrual_credits: res.accrual_credits,
          prorate_accrual: res.prorate_accrual,
          is_reset: res.is_reset,
          reset_cycle: res.reset_cycle,
          reset_day: res.reset_day,
          reset_month: res.reset_month,
          is_carry_forward: res.is_carry_forward,
          carry_forward_cycle: res.carry_forward_cycle,
          carry_forward_days: res.carry_forward_days,
          encash_leaves_above_limit: res.encash_leaves_above_limit,
        })
      }
    )
  }
  public enableEdit() {
    if (this.userRole === 'Admin') {
      this.editLeaveType = true;
    }
    // this.router.navigate(['/jobs/update-kpi/', this.job_id]);
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
      utilization_before: [''],
      utilization_after: [''],
      effective_value: ['', [Validators.required, Validators.pattern(/^\d{1,2}$/), Validators.maxLength(2), Validators.min(0)]],
      effective_cycle: ['', Validators.required],
      leave_effective_from: ['', Validators.required],
      is_accrual: [true],
      accrual_cycle: ['', Validators.required],
      accrual_day: ['', Validators.required],
      accrual_month: ['', Validators.required],
      accrual_credits: ['', Validators.required],
      // policy_date: [''],
      // policy_month: [''],
      prorate_accrual: ['', Validators.required],
      is_reset: [true],
      reset_cycle: ['', Validators.required],
      reset_day: ['', Validators.required],
      reset_month: ['', Validators.required],
      is_carry_forward: [false],
      carry_forward_cycle: [''],
      carry_forward_days: [0],
      encash_leaves_above_limit: [false],
      encash_leaves_with_expiry: [false]
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
      'prorate_accrual',
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
      'encash_leaves_above_limit',
    ];

    if (!event.checked) {
      controls.push('carry_forward_cycle', 'carry_forward_days');
    }
    console.log(controls)
    this.simpleToggleRequired(event.checked, controls);
    // this.simpleToggleRequired(event.checked, [
    //   'reset_cycle',
    //   'reset_day',
    //   'reset_month',
    //   'is_carry_forward',
    //   'carry_forward_cycle',
    //   'carry_forward_days',
    //   'encash_above_limit',
    //   'encash_over_limit',
    // ]);
  }

  public isCarryForwardEnabled(event: any) {
    this.simpleToggleRequired(event.checked, [
      'carry_forward_cycle',
      'carry_forward_days',
    ]);
  }

  public isEncashEnabled(event: any) {

  }
  addOrUpdate() {

    if (this.leaveTypeForm.value.encash_leaves_above_limit == true){
        this.leaveTypeForm.value.encash_leaves_with_expiry = false
    }
    if (this.leaveTypeForm.value.encash_leaves_with_expiry == true){
        this.leaveTypeForm.value.encash_leaves_above_limit = false
    }else{
      this.leaveTypeForm.value.encash_leaves_above_limit = false
      this.leaveTypeForm.value.encash_leaves_with_expiry = false
    }


    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      console.log('error', this.leaveTypeForm.value)
    } else {
      console.log('succes', this.leaveTypeForm.value)
      if(this.item_id){
        this.apiService.updateData(`${environment.live_url}/${environment.settings_leave_type}/${this.item_id}/`,this.leaveTypeForm.value).subscribe(
          (res:any)=>{
            this.apiService.showSuccess(res?.message);
            this.router.navigate(['/settings/leave-type'])
          },
          (error:any)=>{
            this.apiService.showError(error?.message);
          }
        )
      } else{
        this.apiService.postData(`${environment.live_url}/${environment.settings_leave_type}/`,this.leaveTypeForm.value).subscribe(
          (res:any)=>{
            this.apiService.showSuccess(res?.message);
            this.router.navigate(['/settings/leave-type'])
          },
          (error:any)=>{
            this.apiService.showError(error?.message);
          }
        )
      }
    }
  }

  backToLeaveTypes() {
    this.router.navigate(['/settings/leave-type'])
  }

  canDeactivate(): Observable<boolean> {
      const currentFormValue = this.leaveTypeForm?.getRawValue();
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged, this.leaveTypeForm);
    }
}
