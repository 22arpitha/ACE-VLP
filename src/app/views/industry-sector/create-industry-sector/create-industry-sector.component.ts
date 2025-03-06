import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-create-industry-sector',
  templateUrl: './create-industry-sector.component.html',
  styleUrls: ['./create-industry-sector.component.scss']
})
export class CreateIndustrySectorComponent implements OnInit {
  BreadCrumbsTitle:any='Create industry';
  industryForm! : FormGroup

  allIndustry:any=[];
  industry:any;
  orgId: string;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location, private common_service:CommonServiceService
    ) {
      this.orgId = sessionStorage.getItem('org_id')
     }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);

    this.initForm()
  }
 initForm(){
    this.industryForm= this.builder.group({
      toi_title:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      toi_description:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      toi_status:['',[Validators.required]],
      org_ref_id:this.orgId
    })
  }
  get f(){
    return this.industryForm.controls;
  }
 
  addIndustry(){
    if(this.industryForm.invalid){
      this.api.showError('Invalid!');
      this.industryForm.markAllAsTouched();
    }
    else{
      this.api.addIndustryDetails(this.industryForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Industry added successfully!!');
          this.industryForm.reset();
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
