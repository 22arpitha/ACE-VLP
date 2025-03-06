import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-department',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.scss']
})
export class CreateDepartmentComponent implements OnInit {
  BreadCrumbsTitle: any = 'Create department';
  departmentForm!: FormGroup

  allDepartment: any = [];
  department: any;
  org_id: string;
  error:boolean = false;
  status = [
    { value: 'active', viewValue: 'Active' },
    { value: 'inactive', viewValue: 'Inactive' },
  ];

  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private location: Location,
    private common_service: CommonServiceService,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id')
    this.initForm()
  }
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  }
  initForm() {
    this.departmentForm = this.builder.group({
      department_name: ['', [Validators.required,Validators.maxLength(50)]],
      description: ['',Validators.maxLength(300)],
      organization: this.org_id
      // od_status:['',Validators.required],
    })
  }
  get f() {
    return this.departmentForm.controls;
  }

  addDepartment() {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
    }
    else {
      this.api.postDepartmentList(this.departmentForm.value).subscribe(res => {
        if (res) {
          this.api.showSuccess(res['message']);
          this.ngOnInit();
        }
        else {
          this.api.showError('Error!')
        }
      }, (error: any) => {
        this.api.showError(error.error.message);
      })
    }
  }

  backToDepartment() {
    this.router.navigate(['/department/list'])
  }

}
