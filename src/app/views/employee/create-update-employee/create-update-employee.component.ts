import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';

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
selectedEmployeeList:any=[];
isEditItem:boolean=false;
employee_id:any;
isActivelist:any=[{name:'In Active',is_active:false},{name:'Active',is_active:true}]

  constructor(private fb:FormBuilder,private activeRoute:ActivatedRoute,
    private common_service: CommonServiceService,private router:Router,
    private apiService: ApiserviceService,private modalService: NgbModal) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.employee_id= this.activeRoute.snapshot.paramMap.get('id')
      this.isEditItem = true;
      this.getEmployeeDetails(this.employee_id);
    }else{
      this.getEmployeeUniqueNumber();
    }
  }

  ngOnInit(): void {
    this.intialForm();
    this.getUserRoleList();
    this.getReportingManagerList();
  }

  public intialForm(){
this.employeeFormGroup = this.fb.group({
      employee_number: ['',Validators.required],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      date_of_joining: ['', Validators.required],
      // exit_date: ['', Validators.required],
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
    this.apiService.getData(`${environment.live_url}/${environment.employee}/`).subscribe((respData: any) => {
this.reportingManagerId = respData;
    },(error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // Get Employee Detials 
  public getEmployeeDetails(id:any){
this.apiService.getData(`${environment.live_url}/${environment.employee}/${id}/`).subscribe((respData: any) => {
    this.employeeFormGroup.patchValue({
    employee_number:respData?.employee_number,
    first_name:respData?.first_name,
    last_name:respData?.last_name,
    email:respData?.email,
    date_of_joining:respData?.date_of_joining,
    // exit_date:respData?.exit_date,
    reporting_manager_id:respData?.reporting_manager_id,
    designation:respData?.designation,
    sub_designation:respData?.sub_designation,
    role:respData?.role,
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
    this.router.navigate(['/settings/all-employee']);
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
          this.selectedEmployeeList = [];
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
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.settings_country}/${this.employee_id}/`, this.employeeFormGroup.value).subscribe((respData: any) => {
            if (respData) {
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
