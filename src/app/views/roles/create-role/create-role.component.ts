import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
  roleForm : FormGroup 
  BreadCrumbsTitle:any='Create Designation';

  allRole:any=[];
  role:any;
  orgId: any;
  status = [
    { value: 'active', viewValue: 'Active' },
    { value: 'inactive', viewValue: 'Inactive' },
  ];
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location,private common_service : CommonServiceService,
    private router: Router
    ) { }

  ngOnInit(): void {  
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId=sessionStorage.getItem('organization_id')
 this.initForm();
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
   
    this.roleForm= this.builder.group({
      designation_name:['',[Validators.required,Validators.maxLength(50)]],
      description:['',Validators.maxLength(300)],
      organization:this.orgId
      // priority:['',Validators.required],
      // role_status:['',Validators.required],
      // module_name:[''],
      // permissions:{}
    })
  }
  
  get f(){
    return this.roleForm.controls;
  }
 
  addRole(){
    if(this.roleForm.invalid){
      this.api.showError('Please enter the mandatory fields!')
      this.roleForm.markAllAsTouched();
    }
    else{
      
      this.api.postDesignationList(this.roleForm.value).subscribe((res:any) =>{
          if(res){
            console.log(res)
            this.api.showSuccess(res.message);
            this.ngOnInit();
            setTimeout(() => {
              this.router.navigate([`/designation/roles-access/${res.result.id}`])
            }, 1000);
            // window.location.reload();
          }
      },((error:any) =>{
          this.api.showError(error.error.message);
          console.log(error)
      }))
    }
  }

  BackToRolesList(){
    this.router.navigate(['./designation/list'])
  }
}
