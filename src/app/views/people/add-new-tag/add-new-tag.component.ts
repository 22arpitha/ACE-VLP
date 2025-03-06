import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { error } from 'console';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-add-new-tag',
  templateUrl: './add-new-tag.component.html',
  styleUrls: ['./add-new-tag.component.scss']
})
export class AddNewTagComponent implements OnInit {
  tagForm! : FormGroup
  orgId: any;
  BreadCrumbsTitle:any='Add tag';
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService) { }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('org_id')
   this.initForm()
  }
  initForm(){
    this.tagForm= this.builder.group({
      tag_name:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      tage_status:['',Validators.required],
      organization_id:this.orgId
    })
  }
  get f(){
    return this.tagForm.controls;
  }
 
  addtag(){
    if(this.tagForm.invalid){
      this.api.showError('Invalid!');
      this.tagForm.markAllAsTouched()
    }
    else{
      this.api.addTagDetails(this.tagForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Tag added successfully!!');
          this.tagForm.reset();
          this.initForm()
        }
        else{
          this.api.showError('Error!');
        }
          
        },(error =>{
          this.api.showError(error.error.error.message)
        })
      )
    }
  }

}
