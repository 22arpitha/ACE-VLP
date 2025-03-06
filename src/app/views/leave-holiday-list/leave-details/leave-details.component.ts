import { Component, OnInit, Renderer2 } from '@angular/core';
import {  Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-leave-details',
  templateUrl: './leave-details.component.html',
  styleUrls: ['./leave-details.component.scss']
})
export class LeaveDetailsComponent implements OnInit {
  BreadCrumbsTitle:any='Add leave master';
  leaveTypeForm! : FormGroup
  organization_id: any;
  
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private location:Location,
    private common_service:CommonServiceService,
    private renderer: Renderer2
    ) { }

  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  
  } 
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organization_id = JSON.parse(sessionStorage.getItem('organization_id'))
    this.initForm()
   }
 
  initForm(){
    this.leaveTypeForm = this.builder.group({
      leave_title: ['', [Validators.required,Validators.pattern('^[A-Za-z][A-Za-z ]*$'),Validators.maxLength(50)]],
      leave_description: ['', [Validators.pattern('^[^\\s].*'),Validators.maxLength(300)]],
      accruals_or_carry_forward: [''],
      number_of_leaves: [null, [Validators.required,Validators.min(1)]],
      cary_forward_percentage: ['',[Validators.pattern(/^\d+%?$/),Validators.max(100)] ],
      graceful_days: [null,Validators.min(1)],
      maximum_enhancement: [null,Validators.min(1)],
      encashment: [false],
      accruals_or_carry_forward_chx_bx:[false]
    })

    
  }
  formatPercentage() {
    const value = this.leaveTypeForm.get('cary_forward_percentage')?.value;
    
    if (value && !value.includes('%')) {
      this.leaveTypeForm.patchValue({
        cary_forward_percentage: value + '%'
      });
    }
  }
  onSubmit(){
    if(this.leaveTypeForm.invalid){
     this.leaveTypeForm.markAllAsTouched()
    }else{
      const data = {
        leave_title:this.leaveTypeForm.value.leave_title,
        leave_description:this.leaveTypeForm.value.leave_description ,
        accruals_or_carry_forward:this.leaveTypeForm.value.accruals_or_carry_forward ? 'Yearly' : 'Monthly' ,
        number_of_leaves:this.leaveTypeForm.value.number_of_leaves ,
        cary_forward_percentage:this.leaveTypeForm.value.cary_forward_percentage ,
        graceful_days:this.leaveTypeForm.value.graceful_days ,
        maximum_enhancement:this.leaveTypeForm.value.maximum_enhancement ,
        organization: this.organization_id
      }
      this.api.postData(`${environment.live_url}/${environment.leave_master}/`,data).subscribe((res:any)=>{
        if(res){
          this.api.showSuccess('Leave details added successfully!')
          this.leaveTypeForm.reset() 
        }
      },((error:any)=>{
        this.api.showError(error?.error?.message)
      }))
      
      
    }
  }
  
  get f(){
    return this.leaveTypeForm.controls;
  }
 
}

  
