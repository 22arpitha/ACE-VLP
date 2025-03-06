import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder} from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-update-main-category',
  templateUrl: './update-main-category.component.html',
  styleUrls: ['./update-main-category.component.scss']
})
export class UpdateMainCategoryComponent implements OnInit {
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
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  
  updateForm= this.builder.group({
    psmc_name:['',[Validators.pattern(/^\S.*$/),Validators.required]],
    psmc_color_code:['',[Validators.required ]],
    psmc_status:['Active'],
  })
  ngOnInit(): void {
    this.edit();
  }
  get f(){
    return this.updateForm.controls;
  }
  edit(){
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize
  }
    this.api.getCurrentMainCategoryDetails(this.id,params).subscribe((data:any)=>{
      this.updateForm.patchValue({psmc_name:data.result.data[0].psmc_name})
      this.updateForm.patchValue({psmc_color_code:data.result.data[0].psmc_color_code})
      this.updateForm.patchValue({psmc_status:data.result.data[0].psmc_status})
    })
  }
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched()
    }
    else{
      this.api.updateMainCategory(this.id,this.updateForm.value).subscribe(response=>{
        if(response){
          this.api.showSuccess('Main category updated successfully!');
          this.updateForm.reset();
          this.router.navigate(['/status/mainlist'])
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
