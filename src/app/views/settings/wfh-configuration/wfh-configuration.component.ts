import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor } from 'ngx-editor';
import { Observable } from 'rxjs';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { environment } from 'src/environments/environment';
import {
  ACCURAL_DAYS_OPTIONS,
  ACCURAL_MONTH_OPTIONS,
  CARRYFORWARD_FROM_OPTIONS,
  EFFECTIVE_FROM_OPTIONS,
  EFFECTIVE_PERIOD_OPTIONS,
  PERIOD_OPTIONS_WFH,
} from '../leave-configuration/leave-accural-dropdown-options';

@Component({
  selector: 'app-wfh-configuration',
  templateUrl: './wfh-configuration.component.html',
  styleUrls: ['./wfh-configuration.component.scss'],
  standalone: false,
})
export class WfhConfigurationComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Work From Home Configuration';
  accessPermissions = [];
  user_id: any;
  userRole: any;
  initialFormValue: any;
  leaveTypeForm!: FormGroup;
  item_id: any;
  editLeaveType: boolean = false;
  accrualDaysList = ACCURAL_DAYS_OPTIONS;
  accrualMonthList = ACCURAL_MONTH_OPTIONS;
  effectivePeriodList = EFFECTIVE_PERIOD_OPTIONS;
  periodList = PERIOD_OPTIONS_WFH;
  effectiveFromList = EFFECTIVE_FROM_OPTIONS;
  carryForwardList = CARRYFORWARD_FROM_OPTIONS;
  editor!: Editor;
  showFullConfig = true;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    private common_service: CommonServiceService,
    private apiService: ApiserviceService,
    private router: Router,
    private formUtilityService: FormErrorScrollUtilityService,
    private activeRouter: ActivatedRoute,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.item_id = this.activeRouter.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();

    if (this.item_id) {
      this.getLeaveTypeDetails();
      this.editLeaveType = true; // it is because as of now edit button is not need in the edit page
    } else {
      this.editLeaveType = true;
    }
    this.leaveTypeForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.leaveTypeForm?.getRawValue();
      const isInvalid =
        this.leaveTypeForm?.touched && this.leaveTypeForm?.invalid;
      const isFormChanged: boolean =
        JSON.stringify(currentFormValue) !==
        JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
    this.getWfhCategories();

    this.leaveTypeForm.get('category_name')?.valueChanges.subscribe((key) => {
      this.showFullConfig = key !== 'prolonged_health_issue';
      if (!this.showFullConfig) {
        this.resetHiddenControls();
      }
      if (key === 'limited_flexibility') {
        this.leaveTypeForm.patchValue({ is_reset: true });
        this.enableLimitedFlexibilityValidators();
      } else if (key === 'prolonged_health_issue') {
        this.disableLimitedFlexibilityValidators();
      }
    });
  }

  enableLimitedFlexibilityValidators() {
    const fields = [
      'category_name',
      'effective_value',
      // 'description',
      'effective_cycle',
      'effective_from',
      'is_accrual',
      'accrual_credits',
      'accrual_cycle',
      // 'prorate_accrual',
      // 'accrual_month',
      'accrual_day',
      'reset_cycle',
      // reset_month is only required when reset_cycle === 'yearly' (handled by accrualAndResetLeaveCycle)
      'reset_day',
      'is_reset',
    ];

    fields.forEach((field) => {
      this.f[field]?.setValidators([Validators.required]);
      this.f[field]?.updateValueAndValidity({ emitEvent: false });
    });
  }

  disableLimitedFlexibilityValidators() {
    const fieldsToClear = [
      // 'category_name',
      'effective_value',
      // 'description',
      'effective_cycle',
      'effective_from',
      'is_accrual',
      'accrual_credits',
      'accrual_cycle',
      // 'prorate_accrual',
      // 'accrual_month',
      'accrual_day',
      'reset_cycle',
      'reset_month',
      'reset_day',
      'is_reset',
    ];

    fieldsToClear.forEach((field) => {
      this.f[field]?.clearValidators();
      // this.f[field].setValue(null);
      this.f[field]?.reset(null, { emitEvent: false });

      this.f[field]?.updateValueAndValidity({ emitEvent: false });
    });
  }

  resetHiddenControls() {
    this.leaveTypeForm.patchValue(
      {
        // description:null,
        effective_value: null,
        effective_cycle: null,
        effective_from: null,
        is_accrual: false,
        accrual_credits: null,
        accrual_cycle: null,
        // prorate_accrual: null,
        // accrual_month: null,
        accrual_day: null,
        is_reset: true,
        reset_cycle: null,
        // reset_month: null,
        reset_day: null,
      },
      { emitEvent: false },
    );
  }

  getLeaveTypeDetails() {
    this.apiService
      .getData(
        `${environment.live_url}/${environment.wfh_type_conf}/?conf_id=${this.item_id}`,
      )
      .subscribe((res: any) => {
        console.log(res.reset_day);

        this.leaveTypeForm.patchValue({
          category_name: res.category_name,
          description: res.description,
          effective_value: res.effective_value,
          effective_cycle: res.effective_cycle,
          effective_from: res.effective_from,
          is_accrual: res.is_accrual,
          accrual_cycle: res.accrual_cycle,
          accrual_day: this.addDaySuffix(res.accrual_day),
          // accrual_month: res.accrual_month,
          accrual_credits: res.accrual_credits,
          // prorate_accrual: res.prorate_accrual,
          is_reset: res.is_reset,
          reset_cycle: res.reset_cycle,
          reset_day: this.addDaySuffix(res.reset_day),
          reset_month: res.reset_month,
          // is_carry_forward: res.is_carry_forward,
          // carry_forward_cycle: 'carry_forward',
          // carry_forward_days: res.carry_forward_days,
          // encash_leaves_above_limit: res.encash_leaves_above_limit,
          // leave_for: res?.leave_for,
        });
        if (
          res.is_accrual === false &&
          res.accrual_credits === 0
          // res.accrual_month === 0
        ) {
          this.leaveTypeForm.patchValue({
            accrual_credits: '',
            // accrual_month: '',
          });
        }
        // Set reset_month validator based on the loaded reset_cycle value
        this.simpleToggleRequired(res.reset_cycle === 'yearly', ['reset_month']);
        this.simpleToggleRequired(res.accrual_cycle === 'yearly', ['accrual_month']);
      });
  }

  addDaySuffix(day: string | number): string {
    if (day === null || day === undefined || day === '') return '';

    const num = Number(day);

    if (isNaN(num)) return day.toString();

    // Special case: 11, 12, 13 → th
    if (num % 100 >= 11 && num % 100 <= 13) {
      return `${num}th`;
    }

    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }

  public enableEdit() {
    if (this.userRole === 'Admin') {
      this.editLeaveType = true;
    }
    // this.router.navigate(['/jobs/update-kpi/', this.job_id]);
  }
  getModuleAccess() {
    this.accessControlService
      .getAccessForActiveUrl(this.user_id)
      .subscribe((access) => {
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
      category_name: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/),
          // ,
          // Validators.maxLength(20),
        ],
      ],
      description: [
        '',
        [
          Validators.pattern(
            /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/,
          ),
          Validators.maxLength(200),
        ],
      ],
      // utilization_before: [''],
      // utilization_after: [''],
      effective_value: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{1,2}$/),
          Validators.maxLength(2),
          Validators.min(0),
        ],
      ],
      effective_cycle: ['', Validators.required],
      effective_from: ['', Validators.required],
      is_accrual: [false],
      accrual_cycle: [''],
      accrual_day: [''],
      accrual_month: [''],
      accrual_credits: [''],
      // policy_date: [''],
      // policy_month: [''],
      // prorate_accrual: [''],
      is_reset: [true],
      reset_cycle: ['', Validators.required],
      reset_day: ['', Validators.required],
      reset_month: [''],
      // is_carry_forward: [false],
      // carry_forward_cycle: ['carry_forward'],
      // carry_forward_days: [0],
      // encash_leaves_above_limit: [false],
      // encash_leaves_with_expiry: [false],
      // leave_for:['',Validators.required]
    });
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
  }
  public get f() {
    return this.leaveTypeForm?.controls;
  }

  simpleToggleRequired(enable: boolean, controlNames: string[]) {
    controlNames.forEach((name) => {
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
      // 'accrual_month',
      'accrual_credits',
      'prorate_accrual',
    ]);
  }

  accrualAndResetLeaveCycle(event: any, text: string) {
    let control_name: any;
    const isYearly = event.value === 'yearly';
    if (text === 'accrual') {
      control_name = 'accrual_month';
    } else {
      control_name = 'reset_month';
    }
    this.simpleToggleRequired(isYearly, [control_name]);
  }

  public isCreditAccuralNext(event: any) {}

  public isAccuralReseted(event: any) {
    const controls = [
      'reset_cycle',
      'reset_day',
      // 'reset_month',
      // 'is_carry_forward',
      // 'encash_leaves_above_limit',
    ];

    if (!event.checked) {
      controls.push('carry_forward_cycle', 'carry_forward_days');
    }
    this.simpleToggleRequired(event.checked, controls);
  }

  public isCarryForwardEnabled(event: any) {
    this.simpleToggleRequired(event.checked, [
      'carry_forward_cycle',
      'carry_forward_days',
    ]);
  }

  removeDaySuffix(day: string): string {
    if (!day) return day;
    return day.replace(/(st|nd|rd|th)$/i, '');
  }

  public isEncashEnabled(event: any) {}
  addOrUpdate() {
    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      console.log('error', this.leaveTypeForm.controls);
    } else {
      // Build payload with stripped suffixes without mutating the form controls
      const payload = {
        ...this.leaveTypeForm.value,
        accrual_day: this.removeDaySuffix(this.leaveTypeForm.value.accrual_day),
        reset_day: this.removeDaySuffix(this.leaveTypeForm.value.reset_day),
      };
      if (this.leaveTypeForm.get('is_accrual')?.value == false) {
        payload.accrual_credits = 0;
        payload.accrual_month = 0;
      }
      console.log(payload);
      if (this.item_id) {
        this.apiService
          .updateData(
            `${environment.live_url}/${environment.wfh_type_conf}/?conf_id=${this.item_id}`,
            payload,
          )
          .subscribe(
            (res: any) => {
              this.apiService.showSuccess(res?.message);
              this.resetFormState();
              this.router.navigate(['/settings/wfh-config']);
            },
            (error: any) => {
              this.apiService.showError(error?.message);
            },
          );
      } else {
        this.apiService
          .postData(
            `${environment.live_url}/${environment.wfh_type_conf}/`,
            payload,
          )
          .subscribe(
            (res: any) => {
              this.apiService.showSuccess(res?.message);
              this.resetFormState();
              this.router.navigate(['/settings/wfh-config']);
            },
            (error: any) => {
              // console.log(error);

              this.apiService.showError(error?.error?.message);
            },
          );
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.formUtilityService.resetHasUnsavedValue();
    // this.isEditItem = false;
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
  }

  backToLeaveTypes() {
    this.router.navigate(['/settings/wfh-config']);
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.leaveTypeForm?.getRawValue();
    const isFormChanged: boolean =
      JSON.stringify(currentFormValue) !==
      JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(
      isFormChanged,
      this.leaveTypeForm,
    );
  }

  wfhCategories: any[] = [];

  getWfhCategories() {
    this.apiService
      .getData(`${environment.live_url}/${environment.wfh_categories}/`)
      .subscribe(
        (res: any) => {
          console.log(res, 'wfh categories');

          this.wfhCategories = res;
        },
        (error: any) => {
          console.error(error);
        },
      );
  }
}
