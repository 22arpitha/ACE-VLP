import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder, FormGroup} from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-prefix-suffix',
  templateUrl: './update-prefix-suffix.component.html',
  styleUrls: ['./update-prefix-suffix.component.scss']
})
export class UpdatePrefixSuffixComponent implements OnInit {
  BreadCrumbsTitle:any='Update prefix/suffix';
  id:any;
  page: string;
  tableSize: string;
  orgId: any;
  updateForm!: FormGroup;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private route:ActivatedRoute, 
    private router:Router,
    private location:Location,private common_service:CommonServiceService) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
    this.orgId = sessionStorage.getItem('org_id')
  }
  initForm(){
    this.updateForm= this.builder.group({
      prefix:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      suffix:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      organization_id:this.orgId
    })
  }
  
  goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
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
      pagination:'TRUE'
  }
    this.api.getCurrentPrefixSuffixDetails(this.id,params,this.orgId).subscribe((data:any)=>{
      this.updateForm.patchValue({prefix:data.result.data[0].prefix})
      this.updateForm.patchValue({suffix:data.result.data[0].suffix})
    })
  }
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched()
    }
    else{
   this.api.updatePrefixSuffix(this.id,this.updateForm.value).subscribe(response=>{
    if(response){
      this.api.showSuccess('Prefix/suffix updated successfully!!');
      this.updateForm.reset();
      this.router.navigate(['people/prefix-suffix-list'])
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
