import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-office-working-days',
  templateUrl: './office-working-days.component.html',
  styleUrls: ['./office-working-days.component.scss']
})
export class OfficeWorkingDaysComponent implements OnInit {
  officeWorkingDaysForm:FormGroup
  BreadCrumbsTitle:any='Working Hours';
 
  submitted: boolean = false;
  permissions: any = [];
  enable: boolean = false;
  isSelectDisabled = true;
  hours:any = {};
  mins:any ={};
  user_id: any;
  hoursTo:any = {}
  orgId: any;
  days = [
    { name: 'monday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'tuesday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'wednesday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'thursday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'friday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'saturday', selected: false, fromTime: null, toTime: null,totalHours: null  },
    { name: 'sunday', selected: false, fromTime: null, toTime: null,totalHours: null  },
  ];

  times = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00','18:00:00','19:00:00'];
  isShow: boolean = false;
  workingHoursList:any = [];
  selectAll: boolean = false;
  constructor(
    private _fb:FormBuilder,
    private api:ApiserviceService,
    private commonService:CommonServiceService,
    private location:Location,
    private common_service:CommonServiceService) { }
    
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
   
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
    this.orgId = sessionStorage.getItem('organization_id')
    this.getWorkingHours()
  }
 

  toggleSelectAll(isChecked: boolean) {
    this.selectAll = isChecked
    
    this.days.forEach(day => day.selected = isChecked);
    if(isChecked === true){
      this.isShow = true
    }else{
      this.isShow = false
    }
    
  }

  toggleDaySelection(index: number) {
    const day = this.days[index];
    this.isShow = true
    if (!day.selected) {
      this.selectAll = false
      day.fromTime = null;
      day.toTime = null;
    }
  }

  calculateHours(from: string, to: string): number {
    if (from && to) {
      const [fromHour, fromMinutes] = from.split(':').map(Number);
      const [toHour, toMinutes] = to.split(':').map(Number);
      return (toHour + toMinutes / 60) - (fromHour + fromMinutes / 60);
    }
    return 0;
  }
 
  get f(){
    return this.officeWorkingDaysForm.controls
  }
 
  // Method to collect selected data and create the payload
  createPayload(): any {
    const workingHours = this.days
      .filter(day => day.selected) // Only include selected days
      .map(day => ({
        day: day.name.toLowerCase(),
        from_time: day.fromTime,
        to_time: day.toTime,
        total_hours: this.calculateHours(day.fromTime, day.toTime)
      }));

    return {
      organization: this.orgId,
      working_hours: workingHours
    };
  }

  // Method to submit the data to the server
  addWorkingHours(): void {
    const payload = this.createPayload();
    
    this.api.postData(`${environment.live_url}/${environment.working_hour}/`, payload)
      .subscribe(response => {
        if(response){
          this.api.showSuccess(`Working hours created successfully!`)
        }
        
      }, error => {
        this.api.showError(error?.error?.message)
      });
  }
    getWorkingHours(){
      this.api.getData(`${environment.live_url}/${environment.working_hour}/?organization=${this.orgId}`,)
      .subscribe((response:any) => {
        if(response){
          this.workingHoursList = response
          this.patchDays(response);
        }
        
      }, error => {
        this.api.showError(error?.error?.message)
      });
    }
    patchDays(data: any[]): void {
      data.forEach(dayData => {
        const day = this.days.find(d => d.name === dayData.day.toLowerCase());
        if (day) {
          day.selected = true;  // Mark as selected since there's data
          day.fromTime = dayData.from_time;
          day.toTime = dayData.to_time;
          day.totalHours = dayData.total_hours;
        }
      });
      
    }
 updateWorkingHours(){
  const payload = this.createPayload();
    
  this.api.updateData(`${environment.live_url}/${environment.working_hour}/`, payload)
    .subscribe(response => {
      if(response){
        this.api.showSuccess(`Working hours created successfully!`)
      }
      
    }, error => {
      this.api.showError(error?.error?.message)
    });
 }
  
}
