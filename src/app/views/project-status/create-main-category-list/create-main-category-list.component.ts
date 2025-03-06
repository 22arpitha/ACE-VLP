import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-create-main-category-list',
  templateUrl: './create-main-category-list.component.html',
  styleUrls: ['./create-main-category-list.component.scss']
})
export class CreateMainCategoryListComponent implements OnInit {

  mainCategoryForm! : FormGroup

  allMainCategoryList:any=[];
  mainCategory:any;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location
    ) { }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    
    this.mainCategoryForm= this.builder.group({
      psmc_name:['',[Validators.pattern(/^\S.*$/),Validators.required]],
      psmc_color_code:['',[Validators.required ]],
      psmc_status:['Active'],
    })
  }
  get f(){
    return this.mainCategoryForm.controls;
  }
 
  addMainCategory(){
    if(this.mainCategoryForm.invalid){
      this.api.showError('Invalid!');
      this.mainCategoryForm.markAllAsTouched()
    }
    else{
      this.api.addMainCategoryDetails(this.mainCategoryForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Main category added successfully!!');
          this.mainCategoryForm.reset();
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
