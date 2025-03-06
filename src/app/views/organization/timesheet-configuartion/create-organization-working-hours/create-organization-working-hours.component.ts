import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-organization-working-hours',
  templateUrl: './create-organization-working-hours.component.html',
  styleUrls: ['./create-organization-working-hours.component.scss']
})
export class CreateOrganizationWorkingHoursComponent implements OnInit {
  workingHours:FormGroup;
  @Output() status = new EventEmitter();
  organizationData: any = [];
  constructor(
    private fb:FormBuilder,
    private api:ApiserviceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.getOrgDetails()
    
  }

  ngOnInit(): void {
    this.initForm()
    this.workingHours.patchValue({
      organization:this.data?.organization,
      working_hour:this.data?.working_hour
    })
  }
  initForm(){
    this.workingHours = this.fb.group({
    working_hour: ['',[Validators.required,Validators.pattern('^[0-9]+$'),Validators.maxLength(2)]],
    organization: ['',[Validators.required]],
    })
  }
  modalStatus(event){
    if(event === 'ok'){
      this.addWorkingHours()
    }else{
      this.status.emit(event)
    }
    
  }
  get f(){
    return this.workingHours.controls;
  }
getOrgDetails(){
    this.api.getData(`${environment.live_url}/${environment.organization}/`).subscribe(res=>{
      if(res){
       this.organizationData = res
      }
    },(error =>{
      this.api.showError(error?.error?.message)
    }))
  }
  addWorkingHours(){
    if(this.workingHours.invalid){
      this.workingHours.markAllAsTouched()
    }else{
      if(this.data){
        this.api.updateData(`${environment.live_url}/${environment.working_hour_config}/${this.data.id}/`,this.workingHours.value).subscribe(res=>{
          if(res){
            this.api.showSuccess("Working hours updated successfully")
            this.status.emit('ok')
          }
        },((error:any) =>{
          this.api.showError(error?.error?.message)
        }))
      }else{
      this.api.postData(`${environment.live_url}/${environment.working_hour_config}/`,this.workingHours.value).subscribe(res=>{
        if(res){
          this.api.showSuccess("Working hours added successfully")
          this.status.emit('ok')
        }
      },((error:any) =>{
        this.api.showError(error?.error?.message)
      }))
    }
  }
   
  }
}
