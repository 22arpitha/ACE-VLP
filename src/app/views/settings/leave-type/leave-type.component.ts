import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leave-type',
  templateUrl: './leave-type.component.html',
  styleUrls: ['./leave-type.component.scss']
})
export class LeaveTypeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Leave Type';
  isEditItem:boolean=false;
  leaveTypeForm:FormGroup;
  selectedleavetype:any;
  allleavetypeList:any=[];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    leave_type_name: false,
  };
  arrow: boolean = false;
  term:any;
  constructor(private fb:FormBuilder,
      private common_service: CommonServiceService,private apiService:ApiserviceService) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)

  }

  ngOnInit(): void {
    this.leaveTypeForm = this.fb.group({
      leave_type_name:['',Validators.required],
    });
  }

  public get f(){
    return this.leaveTypeForm.controls;
  }

  public saveleaveTypeDetails(){
    {
        if(this.leaveTypeForm.invalid){
          this.apiService.showError('Invalid!');
          this.leaveTypeForm.markAllAsTouched();
        }else{
    if(this.isEditItem){
      this.apiService.updateData(`${environment.live_url}/${environment.settings_job_type}/${this.selectedleavetype}`,this.leaveTypeForm.value).subscribe((respData:any)=>{
        if(respData){
          this.apiService.showSuccess(respData['message']);
        }
      },(error:any)=>{
        this.apiService.showError(error?.error?.message);
      });
    }else{
      this.apiService.postData(`${environment.live_url}/${environment.settings_job_type}/`,this.leaveTypeForm.value).subscribe((respData:any)=>{
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
}
