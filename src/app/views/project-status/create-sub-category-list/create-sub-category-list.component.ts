import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-create-sub-category-list',
  templateUrl: './create-sub-category-list.component.html',
  styleUrls: ['./create-sub-category-list.component.scss']
})
export class CreateSubCategoryListComponent implements OnInit {

  subCategoryForm! : FormGroup

  allMainCategoryList:any=[];
  mainCategory:any;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location
    ) { }

  ngOnInit(): void {
    this.getmainCategory();
    this.initForm()
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
    this.subCategoryForm= this.builder.group({
      pssc_name:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      psmc_ref_id:['',[Validators.required ]],
      pssc_status:['',Validators.required],  
    })
  }
  get f(){
    return this.subCategoryForm.controls;
  }
  getmainCategory(){
    let params = {
      pagination:"FALSE"
    }
    this.api.getMainCategoryDetails(params).subscribe((data:any)=>{
      this.allMainCategoryList= data.result.data;
    }

    )
  }
  addSubCategory(){
    if(this.subCategoryForm.invalid){
      this.api.showError('Invalid!')
      this.subCategoryForm.markAllAsTouched()
    }
    else{
      this.api.addSubCategoryDetails(this.subCategoryForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Sub category added successfully!!');
          this.subCategoryForm.reset();
          this.initForm();
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
