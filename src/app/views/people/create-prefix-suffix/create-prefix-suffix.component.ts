import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-create-prefix-suffix',
  templateUrl: './create-prefix-suffix.component.html',
  styleUrls: ['./create-prefix-suffix.component.scss']
})
export class CreatePrefixSuffixComponent implements OnInit {
  BreadCrumbsTitle:any='Add prefix/suffix';
  prefixSuffixForm! : FormGroup
  orgId: string;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('org_id')
   this.initForm()
   
  }

  goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  }
  initForm(){
    this.prefixSuffixForm= this.builder.group({
      prefix:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      suffix:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      organization_id:this.orgId
    })
  }
  get f(){
    return this.prefixSuffixForm.controls;
  }
  addPrefixSuffix(){
    if(this.prefixSuffixForm.invalid){
      this.api.showError('Invalid!')
      this.prefixSuffixForm.markAllAsTouched()
    }
    else{
      this.api.addPrefixSuffixDetails(this.prefixSuffixForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Prefix suffix added successfully!');
          this.prefixSuffixForm.reset()
          this.initForm()
        }
        else{
          this.api.showError('Error!')
        }
        },(error =>{
          this.api.showError(error.error.error.message)
        })
      )
    }
  }
}
