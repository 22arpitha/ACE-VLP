import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup, FormControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-role',
  templateUrl:'./update-role.component.html',
  styleUrls: ['./update-role.component.scss']
})
export class UpdateRoleComponent implements OnInit {
  BreadCrumbsTitle:any='Update Designation';
  id:any;
  updateForm: FormGroup;
  page: string;
  tableSize: string;
  org_id: any;
status = [
    { value: 'active', viewValue: 'Active' },
    { value: 'inactive', viewValue: 'Inactive' },
  ];
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private route:ActivatedRoute,
    private location:Location,private common_service : CommonServiceService,
    private router: Router
  ) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
  }
  initForm(){
    this.updateForm= this.builder.group({
      designation_name:['',[Validators.required,Validators.maxLength(50)]],
      description:['',Validators.maxLength(300)],
      organization:this.org_id
      // priority:['',Validators.required],
      // role_status:['',Validators.required],
      // module_name:[],
      // permissions:[],
      // update:'ROLE',
    })
  }
 
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id')
   this.edit();
   this.initForm();
  }
  get f(){
    return this.updateForm.controls;
  }
  edit(){
    
    this.api.getDesignationListById(this.id).subscribe((res:any)=>{
     // console.log(res,"RESPONSE")
     
      this.updateForm.patchValue({
        designation_name:res.designation_name,
        description:res.description,
        organization:this.org_id
        // priority:res.data[0].priority,
        // role_status:res.data[0].role_status,
        // module_name:res.data[0].module_name,
        // permissions:res.data[0].permissions,
      })
   })
  }
 
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched()
    }
    else{
      this.api.putDesignationList(this.id,this.updateForm.value).subscribe((response:any)=>{
        if(response){
          this.api.showSuccess(response.message);
          this.updateForm.reset()
          this.router.navigate(['/designation/list'])
        }
        else{
          this.api.showError('Error!')
        }
       },((error)=>{
        this.api.showError(error.error.message)
       })
    )
    }
  }

  
  BackToRolesList(){
    this.router.navigate(['/designation/list']);
  }
}
