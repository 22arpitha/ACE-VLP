import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-industry',
  templateUrl: './update-industry.component.html',
  styleUrls: ['./update-industry.component.scss']
})
export class UpdateIndustryComponent implements OnInit {
  BreadCrumbsTitle:any='Update industry';

  id:any;
  page: string;
  tableSize: string;
  orgId: any;
  updateForm:FormGroup;

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
    
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
    this.updateForm= this.builder.group({
      toi_title:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      toi_description:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      toi_status:['',[Validators.required]],
      org_ref_id:this.orgId
    })
  }
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);

    this.orgId = sessionStorage.getItem('org_id')
    this.initForm();
    this.edit();
  }
  get f(){
    return this.updateForm.controls;
  }
  edit(){
     let params = {
      page_number:this.page,
      data_per_page:this.tableSize,
      pagination:"TRUE",
      org_ref_id:this.orgId
  }
    this.api.getCurrentIndustryDetails(this.id,params).subscribe((data:any)=>{
      this.updateForm.patchValue({toi_title:data.result.data[0].toi_title})
      this.updateForm.patchValue({toi_description:data.result.data[0].toi_description})
      this.updateForm.patchValue({toi_status:data.result.data[0].toi_status})
     
    })
  }
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched()
    }
    else{
      this.api.updateIndustry(this.id,this.updateForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Industry updated successfully!!');
          this.updateForm.reset();
          this.router.navigate(['industry/list'])
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
