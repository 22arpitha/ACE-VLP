import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-approval-configuration',
  templateUrl: './approval-configuration.component.html',
  styleUrls: ['./approval-configuration.component.scss']
})
export class ApprovalConfigurationComponent implements OnInit {
  BreadCrumbsTitle:any='Approval configuration';

  configurationForm : FormGroup
  allConfiguration:any=[];
  configuration:any;
  user_id:any;
  orgId: string;
  configData: any = [];

  constructor(
    private builder:FormBuilder, 
    private timesheetService: TimesheetService,
    private api:ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService
    ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
   this.initForm()
   this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
   this.orgId = JSON.parse(sessionStorage.getItem('org_id'))
 
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){ 
    this.configurationForm= this.builder.group({
      approval_period:['',Validators.required],
      grce_days_to_approve:['',Validators.required],
      tmd_auto_approved:['',[Validators.required]],
      status:['',Validators.required]
     })
  }
  get f(){
    return this.configurationForm.controls;
  }
 
  addConfiguration(){
    if(this.configurationForm.invalid){
      // this.api.showError('Invalid');
      this.configurationForm.markAllAsTouched();
    }
    else{
      let formVal = this.configurationForm.value
      // let data ={
      //      approval_period:formVal.approval_period,
      //      days_to_approve :formVal.grce_days_to_approve,
      //      auto_approve :formVal.tmd_auto_approved,
      //      active_status :formVal.status,
      //      approved_by_user:this.user_id,
      //      module:["TIMESHEET"],
      //      user_id:user_id,
      //      menu:"PEOPLE_TIMESHEET",
      // }
      let data = {
        module:"TIMESHEET",
        menu:"APPROVAL_CONFIGURATION",
        method:"ACCEPT",
        organization_id:this.orgId,
        user_id:this.user_id,
        approval_period:formVal.approval_period,
        grace_days_to_approve:formVal.grce_days_to_approve,
        auto_approve:formVal.tmd_auto_approved === 'true' || formVal.tmd_auto_approved == true ? true :false,
        active_status:formVal.status
       }
      this.timesheetService.addApproval(data).subscribe(response=>{
          if(response){
            this.api.showSuccess('Configuration added successfully!!');
            this.configurationForm.reset();
            this.getConfiguration()
          }
          else{
            this.api.showError('Error')
          }
        },((error:any) =>{
          this.api.showError(error.error.error.message)
        })
      )
    }
  }
 getConfiguration(){
  this.api.getData(`${environment.live_url}/${environment.approval_config}?user_id=${this.user_id}&organization_id=${this.orgId}&method=VIEW&module=TIMESHEET&menu=MONTH_APPROVAL_TIMESHEET`).subscribe((res:any)=>{
    if(res.result.data){
     this.configData = res.result.data
     this.configurationForm.patchValue({
        approval_period:this.configData[0].approval_period,
        grce_days_to_approve:this.configData[0].grace_days_to_approve,
        tmd_auto_approved:this.configData[0].auto_approve,
        status:this.configData[0].active_status 
     })
    }
  },((error:any)=>{
    this.api.showError(error.error.error.message)
  }))
 }

}
