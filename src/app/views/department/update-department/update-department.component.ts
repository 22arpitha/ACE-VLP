import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup, FormControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from'@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-department',
  templateUrl: './update-department.component.html',
  styleUrls: ['./update-department.component.scss']
})
export class UpdateDepartmentComponent implements OnInit {
  BreadCrumbsTitle:any='Update department';
  id:any;
  page: string;
  tableSize: string;
  org_id: any;
  updateForm: FormGroup;
  status = [
    { value: 'active', viewValue: 'Active' },
    { value: 'inactive', viewValue: 'Inactive' },
  ];
  constructor(
    private builder:FormBuilder,
     private api: ApiserviceService, 
     private route:ActivatedRoute,
     private router:Router,
     private location:Location,
     private common_service:CommonServiceService

     ) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
    this.org_id = sessionStorage.getItem('organization_id')
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
    this.updateForm= this.builder.group({
      department_name:['',[Validators.required,Validators.maxLength(50)]],
      description:['',Validators.maxLength(300)],
      organization:this.org_id
    })
  }
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);

    this.initForm()
    this.edit();
  }
  get f(){
    return this.updateForm.controls;
  }
  edit(){
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize,
      org_ref_id:this.org_id
    }
      this.api.getByIdDepartmentList(this.id).subscribe((data:any)=>{
        this.updateForm.patchValue({
          department_name:data.department_name,
          description:data.description,
        })
      })
   
  }
  update(){
  if(this.updateForm.invalid){
    this.updateForm.markAllAsTouched()
  }
  else{
  this.api.putDepartmentList(this.id,this.updateForm.value).subscribe(res =>{
    if(res){
      this.api.showSuccess(res['message']);
      this.updateForm.reset();
      this.router.navigate(['/department/list']);
    }
    else{
      this.api.showError('Error!')
    }
  },((error)=>{
    this.api.showError(error.error.message);
  }))
}
  }

  backToDepartment(){
    this.router.navigate(['/department/list'])
  }
}
