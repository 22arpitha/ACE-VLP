import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
  roleForm : FormGroup 
  admin:any = false;
  user:any = false;
  allRole:any=[];
  role:any;
  orgId: string;

  constructor(private builder:FormBuilder, private api: ApiserviceService,private router:Router) {
    this.orgId = sessionStorage.getItem('org_id')
   }

  ngOnInit(): void {
   this.initForm();
  }
  
  initForm(){
    this.roleForm= this.builder.group({
      user_role_name:['',Validators.required],
      priority:['',Validators.required],
      role_status:['',Validators.required],
      description:['',Validators.required],
      module_name:[[]],
      permissions:[[]]
    })
  }
  get f(){
    return this.roleForm.controls;
  }
 
  addRole(){
    if(this.roleForm.invalid){
      this.api.showError('Invalid!')
      this.roleForm.markAllAsTouched();
    }
    else{
      let data = {
        user_role_name:this.roleForm.value.user_role_name,
        priority:this.roleForm.value.priority,
        role_status:this.roleForm.value.role_status,
        description:this.roleForm.value.description,
        module_name:['ROLES'],
        permissions:[
          {
          "ROLES": [],
          "ROLES_ACCESSIBILITY": []
         }
      ]
      }
      this.api.addRoles(data,this.orgId).subscribe(res =>{
          if(res){
            this.api.showSuccess('Role Added Successfully!');
            this.roleForm.reset();
            this.initForm();
            this.router.navigate(["/register"])
          }
          else{
            this.api.showError('Error')
          }
      },(error =>{
        this.api.showError(error.error.error.message)
      }))
    }
  }
  // loginDetails(event){
  //   this.admin=!this.admin 
  //   sessionStorage.setItem('admin',this.admin)
  //   if(event == 'user'){
  //     this.admin = false
  //     sessionStorage.setItem('admin',this.admin)
  //   }
  // }
  
}
