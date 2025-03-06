import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder,FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
import { error } from 'console';
@Component({
  selector: 'app-update-leave-details',
  templateUrl: './update-leave-details.component.html',
  styleUrls: ['./update-leave-details.component.scss']
})
export class UpdateLeaveDetailsComponent implements OnInit {
  BreadCrumbsTitle:any='Update leave master';
  id:any;
  leaveTypeForm: any;
  organization_id: any;
  constructor(
    private builder:FormBuilder,
    private api: ApiserviceService,
    private route:ActivatedRoute,
    private common_service:CommonServiceService, 
    private location:Location,
    private router:Router) { 
    this.id =this.route.snapshot.paramMap.get('id')
    
  }

  goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  }
 
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organization_id = JSON.parse(sessionStorage.getItem('organization_id'))
    this.initForm();
    this.edit();
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
 
  edit(){
    this.api.getData(`${environment.live_url}/${environment.leave_master}/${this.id}/`).subscribe((data:any)=>{
     //console.log(data,"DATA")
    if(data){
      
      this.leaveTypeForm.patchValue({
        leave_title:data.leave_title ,
        leave_description:data.leave_description ,
        accruals_or_carry_forward:data.accruals_or_carry_forward === 'Yearly' ? true : false,
        number_of_leaves:data.number_of_leaves ,
        cary_forward_percentage:data.cary_forward_percentage,
        graceful_days:data.graceful_days ,
        maximum_enhancement:data.maximum_enhancement ,
        encashment:data.maximum_enhancement ? true : false,
        accruals_or_carry_forward_chx_bx: data.graceful_days || data.cary_forward_percentage ? true : false
      })
    }
    })
  }
  onSubmit(){
    if(this.leaveTypeForm.invalid){
     // console.log( this.leaveTypeForm.value)
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
      organization:this.organization_id
    }
    this.api.updateData(`${environment.live_url}/${environment.leave_master}/${this.id}/`,data).subscribe((data:any)=>{
      if(data){
        this.api.showSuccess('Leave details updated successfully!');
        this.edit();
        this.router.navigate(['/leave/leaveMaster'])
      }
    },((error:any)=>{
      this.api.showError(error?.error?.message)
    }))
  }
  }
 
 
 
}
