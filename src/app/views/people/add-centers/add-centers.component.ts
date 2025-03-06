import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-add-centers',
  templateUrl: './add-centers.component.html',
  styleUrls: ['./add-centers.component.scss']
})
export class AddCentersComponent implements OnInit {
  BreadCrumbsTitle:any='Add center';
  centerForm! : FormGroup
  invalidDate: boolean = false;
  orgId: any;

  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private datepipe:DatePipe,
    private location:Location,private common_service:CommonServiceService) { }

  startDate:any
  endDate:any

  changeYearEndDate(event:any){
    //console.log(event.target.value)
    this.endDate = event.target.value
  }
  
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
    this.centerForm= this.builder.group({
      center_name:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      // year_start_date:['',[Validators.required]],
      // year_end_date:['',[Validators.required]],
      center_status:['',[Validators.required]]
    })
  }
  get f(){
    return this.centerForm.controls;
  }
   yearEndDateValidator():any {
    const yearStartDate = new Date(this.centerForm.get('year_start_date').value).getTime() / (1000 * 60);
    const yearEndDate = new Date(this.centerForm.get('year_end_date').value).getTime() / (1000 * 60);
    if(yearStartDate > yearEndDate || yearStartDate === yearEndDate){
      this.invalidDate = true;
      //console.log(yearStartDate > yearEndDate,'true')
    }
    else{
      this.invalidDate = false;
    }
  }

  addCenter(){
    if(this.centerForm.invalid){
      this.api.showError('Invalid!');
      this.centerForm.markAllAsTouched()
    }
    else{
      if(this.invalidDate === false ){
        let startDate = this.centerForm.value.year_start_date
        let endDate = this.centerForm.value.year_end_date
        let data = {
          center_name:this.centerForm.value.center_name,
          // year_start_date:this.datepipe.transform(startDate,'dd/MM/yyyy'),
          // year_end_date:this.datepipe.transform(endDate,'dd/MM/yyyy'),
          center_status:this.centerForm.value.center_status,
          organization_id:this.orgId
        }
        this.api.addCenterDetails(data).subscribe(response=>{
            if(response){
              this.api.showSuccess('Center added successfully!!');
              this.ngOnInit()
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
  checkValues(event){
    if(event.target.value){
      this.centerForm.patchValue({
        year_end_date:''
      })
    }
  }
}
