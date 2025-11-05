import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { GenericRedirectionConfirmationComponent } from '../../../generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import{JobsOfAccountantComponent} from '../jobs-of-accountant/jobs-of-accountant.component'
@Component({
  selector: 'app-create-update-employee',
  templateUrl: './create-update-employee.component.html',
  styleUrls: ['./create-update-employee.component.scss']
})
export class CreateUpdateEmployeeComponent implements CanComponentDeactivate, OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Employee';
  employeeFormGroup!: FormGroup;
  allDesignation: any = [];
  allUserRoleList: any = [];
  reportingManagerId: any = [];
  isEditItem: boolean = false;
  employee_id: any;
  searchReportingManagerText: any
  searchRoleText: any;
  searchDesignationText: any;
  isActivelist: any = [{ name: 'In Active', is_active: false }, { name: 'Active', is_active: true }]
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue: any;
  managerOfAccountant:any
  genders =[{name:'Male',value:'1',value_check:'male'},{name:'Female',value:'2',value_check:'female'},{name:'Others',value:'3',value_check:'others'}]
  getGenderValue:any;
  leaveTypeEnabled:boolean =false
  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute,
    private common_service: CommonServiceService, private router: Router,
    private apiService: ApiserviceService, private modalService: NgbModal,
    private accessControlService: SubModuleService, private datePipe: DatePipe, private dialog: MatDialog,
    private formErrorScrollService: FormErrorScrollUtilityService) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.employee_id = this.activeRoute.snapshot.paramMap.get('id');
      this.common_service.setTitle('Update ' + this.BreadCrumbsTitle);
      this.isEditItem = true;
      this.getUserRoleList();
      this.getReportingManagerList();
      this.getEmployeeDetails(this.employee_id);
    } else {
      this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
      this.getEmployeeUniqueNumber();
      this.getUserRoleList();
      this.getReportingManagerList();
    }
  }

  ngOnInit(): void {
    this.getModuleAccess();
    this.intialForm();
    this.employeeFormGroup?.valueChanges?.subscribe(() => {
      const currentFormValue = this.employeeFormGroup?.getRawValue();
      const isInvalid = this.employeeFormGroup?.touched && this.employeeFormGroup?.invalid;
      // console.log(this.initialFormValue, currentFormValue);
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }
  ngOnDestroy(): void {
    this.formErrorScrollService.resetHasUnsavedValue();
  }

  shouldDisableFields!: boolean;
  isEnabledEdit: boolean;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        // console.log(res)
        const access_name = sessionStorage.getItem('access-name')
        let temp = res.find((item: any) => item.name === access_name)
        this.accessPermissions = temp?.operations;
        if (this.userRole != 'Admin') {
          if (this.employee_id) {
            this.shouldDisableFields = this.accessPermissions[0]?.['update'];
            this.isEnabledEdit = false;
          } else {
            this.shouldDisableFields = this.accessPermissions[0]?.['create'];
            this.isEnabledEdit = true;
          }
        } else {
          this.shouldDisableFields = true;
          if (this.isEditItem) {
            this.isEnabledEdit = false;
          } else {
            this.isEnabledEdit = true;
          }
        }

        // console.log(this.shouldDisableFields,'this.shouldDisableFields')
      }
    )
  }

  public intialForm() {
    this.employeeFormGroup = this.fb.group({
      employee_number: ['', Validators.required],
      first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      date_joined: ['', Validators.required],
      exit_date: [null],
      reporting_manager_id: [''],
      designation: ['', Validators.required],
      sub_designation: ['', Validators.required],
      gender: ['',Validators.required],
      role: 2,
      is_active: [true, Validators.required],
      enable_leave: this.fb.group({
        leave_type_id: [''],
        enabled_by: [''],
        is_enable: ['']
      }),
    });
  }
  // To Get Unique Employee Number
  public getEmployeeUniqueNumber() {
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?get-unique-number=true`).subscribe((respData: any) => {
      this.employeeFormGroup.patchValue({ 'employee_number': respData?.unique_id });
      this.initialFormValue = this.employeeFormGroup?.getRawValue();
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  // Get All User Role
  public getUserRoleList() {
    this.allUserRoleList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_roles}/`).subscribe((respData: any) => {
      this.allUserRoleList = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  public enbleFields() {
    this.isEnabledEdit = true;
  }

  // Get Role Based Designation
  public getUserRoleBasedDesignation(event: any) {
    const role_id = event.value;
    this.employeeFormGroup?.get('sub_designation')?.reset();
    this.getDesignationList(role_id);
    const temp = this.allUserRoleList.find((data: any) => data.id === event.value);
    if (temp?.designation_name === 'Manager') {
      this.getDirectData()
    } else {
      this.reportingManagerId = this.reportingManagerId.filter((data: any) => data.user__full_name != 'Vinayak Hegde')
      // console.log(this.reportingManagerId)
    }
  }

  getDirectData() {
    let query = `?page=1&page_size=10&search=Vinayak Hegde&employee=True`
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${query}`).subscribe(
      (res: any) => {
        // console.log(res);
        this.reportingManagerId.push(res?.results[0])
        // console.log(this.reportingManagerId)

      }
    )
  }
  private getDesignationList(role_id: any) {
    this.allDesignation = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_designation}/?designation_id=${role_id}`).subscribe((respData: any) => {
      this.allDesignation = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  // Get Reporting Manager
  public getReportingManagerList() {
    this.reportingManagerId = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True&designation=manager`).subscribe((respData: any) => {
      if (respData && respData.length >= 1) {
        this.reportingManagerId = respData;
      } else {
        this.adminData();
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // Get Employee Detials
  public getEmployeeDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${id}/`).subscribe((respData: any) => {
      this.getDesignationList(respData?.designation_id);
      this.managerOfAccountant = respData?.reporting_manager_id
      this.getGenderValue = respData?.user__gender,
      this.getLeaveTypes()
      this.employeeFormGroup.patchValue({
        employee_number: respData?.employee_number,
        first_name: respData?.user__first_name,
        last_name: respData?.user__last_name,
        email: respData?.user__email,
        date_joined: respData?.user__date_joined,
        exit_date: respData?.user__exit_date,
        reporting_manager_id: respData?.reporting_manager_id,
        designation: respData?.designation_id,
        sub_designation: respData?.sub_designation_id,
        gender: respData?.user__gender,
        is_active: respData?.is_active,
      });
      this.leaveTypeEnabled = respData?.maternity_and_paternity_details[0]?.is_enabled;
      const temp = this.allUserRoleList.find((data: any) => data.id ===respData?.designation_id);
      if (temp?.designation_name === 'Manager') {
        this.getDirectData()
      } else {
        this.reportingManagerId = this.reportingManagerId.filter((data: any) => data.user__full_name != 'Vinayak Hegde')
        // console.log(this.reportingManagerId)
      }

      this.initialFormValue = this.employeeFormGroup?.getRawValue();

    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public get f() {
    return this.employeeFormGroup.controls;
  }

  filteredLeaves = []
  getLeaveTypes(){
     this.apiService
      .getData(`${environment.live_url}/${environment.employees_leave}/?employee=${this.employee_id}`)
      .subscribe(
        (respData: any) => {
          let data = this.genders.find((x:any)=>x.value == this.getGenderValue)
          console.log(data)
          if(data?.value_check==='female'){
             this.filteredLeaves = respData.results?.filter((item: any) => 
             item.leave_for?.toLowerCase() === 'female' &&
             item.leave_type?.toLowerCase().includes('maternity') && item.is_active
           );
          } else if(data?.value_check==='male'){
             this.filteredLeaves = respData.results?.filter((item: any) => 
             item.leave_for?.toLowerCase() === 'male' &&
             item.leave_type?.toLowerCase().includes('paternity') && item.is_active
           );
          }

          console.log('Filtered Leave Types:', this.filteredLeaves);
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }
  public joiningDateFun(event: any) {

  }

  public backBtnFunc(): void {
    if (this.isEditItem && this.hasUnsavedChanges()) {
      this.showConfirmationPopup().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.cleanupAndNavigate();
        }
      });
    } else {
      this.cleanupAndNavigate();
    }
  }

  public hasUnsavedChanges(): boolean {
    const currentFormValue = this.employeeFormGroup.getRawValue();
    const isFormChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return isFormChanged || this.employeeFormGroup.dirty;
  }

  private cleanupAndNavigate(): void {
    sessionStorage.removeItem('access-name');
    const isActive = this.employeeFormGroup.get('is_active')?.value;
    this.common_service.setEmployeeStatusState(isActive);
    this.router.navigate(['/settings/all-employee']);
  }

  private showConfirmationPopup(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const modalRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
        size: 'sm' as any,
        backdrop: true,
        centered: true,
      });

      modalRef.componentInstance.status.subscribe((resp: any) => {
        observer.next(resp === 'ok');
        observer.complete();
        modalRef.close();
      });
    });
  }


  adminData() {
    this.apiService.getProfileDetails(`?role_id=${1}`).subscribe(
      (res: any) => {
        // console.log('admin',res);
        let data :any= [];
        // data.push({ 'first_name': res.first_name, 'id': res.id });
        res.forEach((element: any) => {
          data.push({ 'first_name': element?.first_name, 'last_name': element?.last_name || '', 'user_id': element.id });
        });
        this.reportingManagerId = data;
      },
      (error: any) => {
        console.log('admin data error', error)
      }
    )
  }

  // search Reporting Manager
  public filteredReportingManagerList() {
    if (!this.searchReportingManagerText) {
      return this.reportingManagerId;
    }
    return this.reportingManagerId.filter((emp: any) =>
      emp?.user__full_name?.toLowerCase()?.includes(this.searchReportingManagerText?.toLowerCase())
    );
  }

  // search User Role
  public filteredUserRoleList() {
    if (!this.searchRoleText) {
      return this.allUserRoleList;
    }
    return this.allUserRoleList.filter((role: any) =>
      role?.designation_name?.toLowerCase()?.includes(this.searchRoleText?.toLowerCase())
    );
  }

  // search Designation
  public filteredDesignationList() {
    if (!this.searchDesignationText) {
      return this.allDesignation;
    }
    return this.allDesignation.filter((role: any) =>
      role?.sub_designation_name?.toLowerCase()?.includes(this.searchDesignationText?.toLowerCase())
    );
  }

  public clearSearch(key: any) {
    if (key === 'role') {
      this.searchRoleText = '';
    } else if (key === 'des') {
      this.searchDesignationText = '';
    } else {
      this.searchReportingManagerText = '';
    }
  }
  public deleteEmployee() {
    if (this.employee_id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe((resp:any) => {
        if (resp == "ok") {
          this.deleteContent(this.employee_id);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(id: any) {
    this.apiService.delete(`${environment.live_url}/${environment.employee}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.apiService.showSuccess(data.message);
        this.resetFormState();
        this.router.navigate(['/settings/all-employee']);
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  public saveEmployeeDetails() {
    if (this.employeeFormGroup.invalid) {
      this.employeeFormGroup.markAllAsTouched();
      this.formErrorScrollService.setUnsavedChanges(true);
      this.formErrorScrollService.scrollToFirstError(this.employeeFormGroup);
    } else {
      this.employeeFormGroup.patchValue({ date_joined: this.datePipe.transform(this.employeeFormGroup?.get('date_joined')?.value, 'YYYY-MM-dd') })
      if(this.filteredLeaves.length>0) {
      this.employeeFormGroup.get('enable_leave')?.patchValue({
      leave_type_id: this.filteredLeaves[0]['leave_type_id'] || '',
      enabled_by: this.user_id,
      is_enable: this.leaveTypeEnabled
       });
     } else {
      this.employeeFormGroup.removeControl('enable_leave');
    }
      console.log(this.employeeFormGroup.value)
      if (this.isEditItem) {
        if(this.selectedJobsIds.length>0){
          this.transferJobsApi()
        }
        else{
          this.updateEmployee()
        }
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.employee}/`, this.employeeFormGroup.value).subscribe((respData: any) => {
          if (respData) {
            // this.common_service.setEmployeeStatusState(this.employeeFormGroup.get('is_active')?.value);
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/settings/all-employee']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    this.isEditItem = false;
    this.initialFormValue = this.employeeFormGroup?.getRawValue();
  }
  resetDate() {
    this.employeeFormGroup?.get('exit_date')?.setValue(null);
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.employeeFormGroup.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged, this.employeeFormGroup);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const currentFormValue = this.employeeFormGroup.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    if (isFormChanged || this.employeeFormGroup.dirty) {
      $event.preventDefault();
    }
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  selectedJobsIds:any = []
  changeReportingManager(event:any){
    // console.log(event.value,this.managerOfAccountant);
  let role_name = this.allUserRoleList.find((item:any)=>item.id===this.employeeFormGroup.get('designation')?.value)
    if(this.isEditItem && role_name.designation_name==='Accountant' && this.managerOfAccountant!=event.value){
       const dialogRef =this.dialog.open(JobsOfAccountantComponent, {
        data: { employeeId:this.employee_id},
       panelClass: 'custom-details-dialog',
       disableClose: true,
      });
      dialogRef.afterClosed().subscribe((result:any)=>{
      if(result){
        this.selectedJobsIds = result;
        // console.log('Jobs received from dialog:', this.selectedJobsIds);
        // this.transferJobsApi()
      }
    });
    }
  }

  transferJobsApi(){
    const data ={
    "employee-id": this.employee_id,
    "manager-id": this.employeeFormGroup.get('reporting_manager_id')?.value,
    "job-ids": this.selectedJobsIds
    }
    // console.log(data)
    this.apiService.updateData(`${environment.live_url}/${environment.change_manager}/`,data).subscribe(
      (res:any)=>{
        // console.log(res)
        this.apiService.showSuccess(res.detail);
        setTimeout(() => {
          this.updateEmployee()
        }, 2000);
        
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }

  updateEmployee(){
    this.apiService.updateData(`${environment.live_url}/${environment.employee}/${this.employee_id}/`, this.employeeFormGroup.value).subscribe((respData: any) => {
          if (respData) {
            this.common_service.setEmployeeStatusState(this.employeeFormGroup.get('is_active')?.value);
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/settings/all-employee']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
  }
}
