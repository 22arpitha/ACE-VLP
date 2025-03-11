import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-job-type',
  templateUrl: './job-type.component.html',
  styleUrls: ['./job-type.component.scss']
})
export class JobTypeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Type';
  isEditItem:boolean=false;
  jobTypeForm:FormGroup;
  selectedJobtype:any;
  constructor(private fb:FormBuilder,
    private common_service: CommonServiceService,private apiService:ApiserviceService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
   }

  ngOnInit(): void {
this.jobTypeForm = this.fb.group({
  job_type_name:['',Validators.required],
  job_price:[null,Validators.required],
});
  }
  public get f(){
    return this.jobTypeForm.controls;
  }

  public saveJobTypeDetails(){
    if(this.jobTypeForm.invalid){
      this.apiService.showError('Invalid!');
      this.jobTypeForm.markAllAsTouched();
    }else{
if(this.isEditItem){
  this.apiService.updateData(`${environment.live_url}/${environment.settings_job_type}/${this.selectedJobtype}`,this.jobTypeForm.value).subscribe((respData:any)=>{
    if(respData){
      this.apiService.showSuccess(respData['message']);
    }
  },(error:any)=>{
    this.apiService.showError(error?.error?.message);
  });
}else{
  this.apiService.postData(`${environment.live_url}/${environment.settings_job_type}/`,this.jobTypeForm.value).subscribe((respData:any)=>{
if(respData){
  this.apiService.showSuccess(respData['message']);
}
  },(error:any)=>{
    this.apiService.showError(error?.error?.message);
  });
}
    }
  }

}
