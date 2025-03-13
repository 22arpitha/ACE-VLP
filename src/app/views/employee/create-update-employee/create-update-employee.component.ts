import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-create-update-employee',
  templateUrl: './create-update-employee.component.html',
  styleUrls: ['./create-update-employee.component.scss']
})
export class CreateUpdateEmployeeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employee';
employeeFormGroup:FormGroup;
allDesignation:any=[];
reportingManagerId:any=[];
isEditItem:boolean=false;
  constructor(private common_service: CommonServiceService,private fb:FormBuilder) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.intialForm();
  }

  public intialForm(){
this.employeeFormGroup = this.fb.group({
      employee_number: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(1)]],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      date_of_joining: ['', Validators.required],
      exit_date: ['', Validators.required],
      reporting_manager_id:['', Validators.required],
      designation: ['', [Validators.pattern(/^\S.*$/), Validators.required]],
      role: ['', Validators.required],
    });
  }
  public get f() {
    return this.employeeFormGroup.controls;
  }

  public joiningDateFun(event: any) {

  }
}
