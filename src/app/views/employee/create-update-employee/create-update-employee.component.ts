import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';

@Component({
  selector: 'app-create-update-employee',
  templateUrl: './create-update-employee.component.html',
  styleUrls: ['./create-update-employee.component.scss']
})
export class CreateUpdateEmployeeComponent implements OnInit {
@ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
BreadCrumbsTitle: any = 'Employee';
employeeFormGroup:FormGroup;
allDesignation:any=[];
allUserRoleList:any=[];
reportingManagerId:any=[];
isEditItem:boolean=false;
employee_id:any;
searchReportingManagerText:any
searchRoleText:any;
searchDesignationText:any;
isActivelist:any=[{name:'In Active',is_active:false},{name:'Active',is_active:true}]
accessPermissions = []
user_id: any;
userRole: any;

  constructor(private fb:FormBuilder,private activeRoute:ActivatedRoute,
    private common_service: CommonServiceService,private router:Router,
    private apiService: ApiserviceService,private modalService: NgbModal,
    private accessControlService:SubModuleService,private formErrorScrollService:FormErrorScrollUtilityService) { 
      this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.employee_id= this.activeRoute.snapshot.paramMap.get('id')
      this.isEditItem = true;
      this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
      this.getUserRoleList();
      this.getReportingManagerList();
      this.getEmployeeDetails(this.employee_id);
    }else{
      this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
      this.getEmployeeUniqueNumber();
      this.getUserRoleList();
      this.getReportingManagerList();
    }
  }

  ngOnInit(): void {
    this.getModuleAccess();
    this.intialForm();
  }

  getModuleAccess(){
    this.apiService.getData(`${environment.live_url}/${environment.user_access}/${sessionStorage.getItem('user_id')}/`).subscribe(
      (res:any)=>{
       res.access_list.forEach((access:any)=>{
          access.access.forEach((access_name:any)=>{
              if(access_name.name===sessionStorage.getItem('access-name')){
                // console.log(access_name)
                this.accessPermissions = access_name.operations;
              }
            })
       })
      }
    )
    console.log(this.accessPermissions)
  }

  public intialForm(){
this.employeeFormGroup = this.fb.group({
      employee_number: ['',Validators.required],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      email:['',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      date_joined: ['', Validators.required],
      exit_date: ['', Validators.required],
      reporting_manager_id:['', Validators.required],
      designation: ['', Validators.required],
      sub_designation:['', Validators.required],
      role: 2,
      is_active:[true,Validators.required],
    });
  }
  // To Get Unique Employee Number
  public getEmployeeUniqueNumber(){
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?get-unique-number=true`).subscribe((respData: any) => {
      this.employeeFormGroup.patchValue({'employee_number': respData?.unique_id});
          },(error => {
            this.apiService.showError(error?.error?.detail)
          }));
  }
  
  // Get All User Role 
  public getUserRoleList(){
    this.allUserRoleList=[];
    this.apiService.getData(`${environment.live_url}/${environment.settings_roles}/`).subscribe((respData: any) => {
      this.allUserRoleList = respData;
          },(error => {
            this.apiService.showError(error?.error?.detail)
          }));
  }

  // Get Role Based Designation
  public getUserRoleBasedDesignation(event:any){
    const role_id = event.value;
    this.employeeFormGroup?.get('sub_designation')?.reset();
    this.getDesignationList(role_id);
  }
  private getDesignationList(role_id:any){
    this.allDesignation =[];
    this.apiService.getData(`${environment.live_url}/${environment.settings_designation}/?designation_id=${role_id}`).subscribe((respData: any) => {
    this.allDesignation = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  // Get Reporting Manager 
  public getReportingManagerList(){
    this.reportingManagerId =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True&designation=manager`).subscribe((respData: any) => {
    if(respData && respData.length>=1){
      this.reportingManagerId = respData;
    }else{
this.adminData();
    }
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // Get Employee Detials 
  public getEmployeeDetails(id:any){
this.apiService.getData(`${environment.live_url}/${environment.employee}/${id}/`).subscribe((respData: any) => {
  this.getDesignationList(respData?.designation_id);  
  this.employeeFormGroup.patchValue({
    employee_number:respData?.employee_number,
    first_name:respData?.user__first_name,
    last_name:respData?.user__last_name,
    email:respData?.user__email,
    date_joined:respData?.user__date_joined,
    exit_date:respData?.user__exit_date,
    reporting_manager_id:respData?.reporting_manager_id,
    designation:respData?.designation_id,
    sub_designation:respData?.sub_designation_id,
    is_active:respData?.is_active,
      });
      
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public get f() {
    return this.employeeFormGroup.controls;
  }

  public joiningDateFun(event: any) {

  }

  public backBtnFunc(){
    this.common_service.setEmployeeStatusState(this.employeeFormGroup.get('is_active')?.value);
    this.router.navigate(['/settings/all-employee']);
  }

  adminData() {
    this.apiService.getProfileDetails(`?role_id=${1}`).subscribe(
      (res: any) => {
        // console.log('admin',res);
        let data = [];
        // data.push({ 'first_name': res.first_name, 'id': res.id });
        res.forEach((element:any) => {
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
  return this.reportingManagerId.filter((emp:any) => 
    emp?.user__full_name?.toLowerCase()?.includes(this.searchReportingManagerText?.toLowerCase())
  );
}

// search User Role   
public filteredUserRoleList() {
  if (!this.searchRoleText) {
    return this.allUserRoleList;
  }
  return this.allUserRoleList.filter((role:any) => 
    role?.designation_name?.toLowerCase()?.includes(this.searchRoleText?.toLowerCase())
  );
}

// search Designation   
public filteredDesignationList() {
  if (!this.searchDesignationText) {
    return this.allDesignation;
  }
  return this.allDesignation.filter((role:any) => 
    role?.sub_designation_name?.toLowerCase()?.includes(this.searchDesignationText?.toLowerCase())
  );
}

public clearSearch(key:any){
if(key==='role'){
this.searchRoleText ='';
}else if(key==='des'){
  this.searchDesignationText ='';
}else{
  this.searchReportingManagerText ='';
}
}
  public deleteEmployee(){
    if (this.employee_id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
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
          this.router.navigate(['/settings/all-employee']);
        }
      }, (error => {
        this.apiService.showError(error?.error?.detail)
      }))
    }

    public saveEmployeeDetails(){
      if (this.employeeFormGroup.invalid) {
        this.employeeFormGroup.markAllAsTouched();
        this.formErrorScrollService.scrollToFirstError(this.employeeFormGroup);
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.employee}/${this.employee_id}/`, this.employeeFormGroup.value).subscribe((respData: any) => {
            if (respData) {
              this.common_service.setEmployeeStatusState(this.employeeFormGroup.get('is_active')?.value)
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.router.navigate(['/settings/all-employee']);
            }
          }, (error: any) => {
            this.apiService.showError(error?.error?.detail);
          });
        }else{
          this.apiService.postData(`${environment.live_url}/${environment.employee}/`, this.employeeFormGroup.value).subscribe((respData: any) => {
            if (respData) {
              // this.common_service.setEmployeeStatusState(this.employeeFormGroup.get('is_active')?.value);
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
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
  this.isEditItem = false;
}
}
