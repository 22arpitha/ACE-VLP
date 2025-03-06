import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder} from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';
import { error } from 'console';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-centre',
  templateUrl: './update-centre.component.html',
  styleUrls: ['./update-centre.component.scss']
})
export class UpdateCentreComponent implements OnInit {
  id:any;
  BreadCrumbsTitle:any='Update centers';
  startDate:any
  endDate:any
  page: string;
  tableSize: string;
  invalidDate: boolean = false;
  orgId: any;
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private route:ActivatedRoute, 
    private datepipe:DatePipe,
    private router:Router,
    private location:Location,
    private common_service:CommonServiceService
    ) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
  }
  goBack(event){
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }

  changeYearStartDate(event:any){
    this.startDate = event.target.value
    this.yearEndDateValidator()
  }
  changeYearEndDate(event:any){
    this.endDate = event.target.value
    this.yearEndDateValidator()
  }
  updateForm= this.builder.group({
      center_name:['',[Validators.pattern(/^[a-zA-Z]+$/),Validators.required]],
      // year_start_date:['',[Validators.required]],
      // year_end_date:['',[Validators.required]],
      center_status:['',[Validators.required]]
  })
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('org_id')
    this.edit();
  }
  yearEndDateValidator():any {
    const yearStartDate = new Date(this.updateForm.get('year_start_date').value).getTime() / (1000 * 60);
    
    const yearEndDate = new Date(this.updateForm.get('year_end_date').value).getTime() / (1000 * 60);
    if(yearStartDate > yearEndDate || yearStartDate === yearEndDate){
      this.invalidDate = true;
      //console.log(yearStartDate > yearEndDate,'true')
    }
    else{
      this.invalidDate = false;
    }
  }
  get f(){
    return this.updateForm.controls;
  }
  edit(){
    if(this.updateForm.invalid && this.updateForm.controls['center_name'] && this.updateForm.controls['year_start_date']
    && this.updateForm.controls['year_end_date'] === null || ''){
      this.updateForm.markAllAsTouched()
    }
    else{
      let params = {
        page_number:this.page,
        data_per_page:this.tableSize,
        pagination:'TRUE',
        organization_id:this.orgId
       }
        this.api.getCurrentCentreDetails(this.id,params).subscribe((data:any)=>{
          //console.log(data.result.data[0].year_start_date);
          this.startDate = this.datepipe.transform(data.result.data[0].year_start_date *1000,'yyyy-MM-dd')
          this.endDate = this.datepipe.transform(data.result.data[0].year_end_date *1000,'yyyy-MM-dd')
          
          this.updateForm.patchValue({center_name:data.result.data[0].center_name})
          // this.updateForm.patchValue({year_start_date: this.datepipe.transform(data.result.data[0].year_start_date*1000,'yyyy-MM-dd')})
          // this.updateForm.patchValue({year_end_date:this.datepipe.transform(data.result.data[0].year_end_date*1000,'yyyy-MM-dd')})
          this.updateForm.patchValue({center_status:data.result.data[0].center_status})
        })
    }
  }
  update(){
    if(this.updateForm.invalid){
      this.updateForm.markAllAsTouched()
    }
    else{
      // let startDate = this.updateForm.value.year_start_date
        // let endDate = this.updateForm.value.year_end_date
        let data = {
          center_name:this.updateForm.value.center_name,
          // year_start_date:this.datepipe.transform(startDate,'dd/MM/yyyy'),
          // year_end_date:this.datepipe.transform(endDate,'dd/MM/yyyy'),
          center_status:this.updateForm.value.center_status,
          organization_id:this.orgId
        }  
  if(this.invalidDate === false){
    this.api.updateCentre(this.id,data).subscribe(
      response=>{
        if(response){
          this.api.showSuccess('Center updated successfully !!');
          this.router.navigate(['/people/centers-list'])
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
    // if(event.target.value){
    //   this.updateForm.patchValue({
    //     year_end_date:''
    //   })
    // }
  }
}
