import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-update-sub-category',
  templateUrl: './update-sub-category.component.html',
  styleUrls: ['./update-sub-category.component.scss']
})
export class UpdateSubCategoryComponent implements OnInit {
  id:any;
  page: string;
  tableSize: string;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private route:ActivatedRoute,
    private router:Router,
    private location:Location
    ) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
    
  }
  allMainCategoryList:any=[];
  mainCategory:any;

  updateForm= this.builder.group({
    pssc_name:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      psmc_ref_id:['',[Validators.required ]],
      pssc_status:['',Validators.required],
  })
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.edit();
    this.getmainCategory();
  }
  get f(){
    return this.updateForm.controls;
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
  edit(){
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize
  }
    this.api.getCurrentSubCategoryDetails(this.id,params).subscribe((data:any)=>{
      if(data.result.data){
        this.updateForm.patchValue({
          pssc_name:data.result.data.pssc_name,
          psmc_ref_id:data.result.data.psmc_ref_id,
          pssc_status:data.result.data.pssc_status
        })
      }
    })
  }
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched();
    }
    else{
      this.api.updateSubCategory(this.id,this.updateForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Sub category updated successfully!!');
          this.updateForm.reset();
          this.router.navigate(['/status/sublist'])
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
