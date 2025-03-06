import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder,FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { CommonServiceService } from 'src/app/service/common-service.service';
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
window['dayjs'] = dayjs;
@Component({
  selector: 'app-request-add-leave',
  templateUrl: './request-add-leave.component.html',
  styleUrls: ['./request-add-leave.component.scss']
})
export class RequestAddLeaveComponent implements OnInit {
  leaveForm : FormGroup
  BreadCrumbsTitle:any='Leave add on application';
  allLeave:any=[];
  leave:any;
  leaveType: any = [];
  disableTextbox: boolean = true;
  disableTextbox2: boolean = true;
  reservedDates: any = [];
  leaveDetails: any;
  invalidDate: boolean = false;
  min=new Date().toISOString().split("T")[0];
  balanceLeave: any = [];
  workingDays: number;
  user_id: any;
  noLeaves: boolean = false;
  orgId: any;
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService,
    private datepipe:DatePipe,
    private location:Location,
    private common_service:CommonServiceService) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('org_id')
    this.getLeaveType()
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
    this.initForm();
    // this.getAllleaveData(); 
    // this.getMinDate();
    // this.getMaxDate();
  }
  get f(){
    return this.leaveForm.controls;
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  initForm(){
    this.leaveForm= this.builder.group({
      leaveApplication_from_date:['',[Validators.required]],
      leaveApplication_to_date:['',[Validators.required]],
      leaveType:['',[Validators.required]],
      request_comment:['',[Validators.pattern(/^\S.*$/),Validators.required]],
      ula_from_session:['',[Validators.required]],
      ula_to_session:['',[Validators.required]],
      days:['',[Validators.required]],
      balance:['',[Validators.required]],
    })
  }
  addLeave(){
    let startDate = this.leaveForm.value.leaveApplication_from_date
    let endDate   = this.leaveForm.value.leaveApplication_to_date
   let data = {
      module: "LEAVE/HOLIDAY_LIST",
      menu: "ADD_ON_LEAVE_REQUEST",
      method: "CREATE",
      leave_type_id:this.leaveForm.value.leaveType,
      user_id:this.user_id,
      reason: this.leaveForm.value.request_comment,
      leave_application_file_attachment: "",
      leaveApplication_from_date:this.datepipe.transform(startDate,'dd/MM/yyyy'),
      leaveApplication_to_date: this.datepipe.transform(endDate,'dd/MM/yyyy'),
      days:this.leaveForm.value.days,
      balance:this.leaveForm.value.balance,
      from_session: this.leaveForm.value.ula_from_session,
      to_session: this.leaveForm.value.ula_to_session
  }
    if(this.leaveForm.invalid){
      this.api.showError('Invalid');
      this.leaveForm.markAllAsTouched();
    }
    else{
      
      if(this.noLeaves == false){
          this.api.postData(`${environment.live_url}/${environment.add_on_leave_request}`,data).subscribe(
            response =>{
              if(response){
              this.api.showSuccess('Add on leave added successfully!!');

              this.leaveForm.reset()
              this.initForm();
              this.leaveForm.patchValue({
                ula_from_session:'',
                ula_to_session:''
              })
              
              }
              else{
                this.api.showError('Error')
              }
            },(error =>{
              this.api.showError(error.error.error.message)
            }) )
        }
        else{
          this.api.showWarning('leaves are not available')
        }
    }
  }
 
 
  toggleDisable(event) {
    if(event == "from_date"){
      this.disableTextbox2 = false;
      this.leaveForm.patchValue({
        leaveApplication_to_date :'',
        ula_to_session:''
      })
    }else if(event == "ula_from_session"){
      this.leaveForm.patchValue({
        leaveApplication_to_date :'',
        ula_to_session:''
      })
    }
    else{
      this.disableTextbox2 = true;
      if(event == "leave_type_id"){
        this.disableTextbox = false;
        this.leaveForm.patchValue({
          leaveApplication_from_date:'',
          leaveApplication_to_date: '',
          days:'',
          balance:'',
          ula_from_session:'',
          ula_to_session: ''
      })
        
      }
    }
   
  }
  getLeaveType(){
    let params:any={'orgId':this.orgId,'master-leave-types':sessionStorage.getItem('center_id')};
    this.api.getLeaveTypeDetails(params).subscribe((data:any)=>{
      this.leaveType= data.result.data;
      //console.log(this.leaveType,"dfsfs")
    },(error =>{
      this.api.showError(error.error.error.message)
    })

    )
  }
  
  getappliedLeave(){
    let holidayParams={
      date:'01/01/2023',
      country:'IN',
      state:'KA'
    }
    this.api.getHolidayList(holidayParams).subscribe(res=>{
    const holidays = res;
    //console.log(holidays,"yutre")
    const startDate = new Date(this.leaveForm.value.leaveApplication_from_date);
    const endDate = new Date(this.leaveForm.value.leaveApplication_to_date);
  
   const selectedFrom = this.leaveForm.value.ula_from_session;
   const selectedTo = this.leaveForm.value.ula_to_session;
   
   this.workingDays = this.getWorkingDays(
     startDate,
     endDate,
     holidays,
     selectedFrom,
     selectedTo
   );
   
    //console.log(`Number of working days: ${this.workingDays}`);
    this.leaveForm.patchValue({
      days:this.workingDays
     })
     //console.log(this.leaveForm.value.days,"DAYS")
     this.getBalance(this.workingDays)
    })
  
    
    }
   
  getBalance(workingdays){
    let data={
      "leave_title": this.leaveForm.value.leaveType,
      "description": this.leaveForm.value.reason,
      "accrude_monthly":false,
      "monthly_leaves": "",
      "yearly_leaves": 20,
      "carry_forward_per": "",
      "gracefull_days": 2,
      "encashment":false,
      "max_encashments": "",
      "leave_applicable_for": 1
  }
  
  let params={
    user_id:this.user_id,
    days:workingdays,
    leave_type_id:this.leaveForm.value.leaveType,
    from_date:this.leaveForm.value.leaveApplication_from_date,
    to_data:this.leaveForm.value.leaveApplication_to_date,
    from_session:this.leaveForm.value.ula_from_session,
    to_session:this.leaveForm.value.ula_to_session
  }
  // //console.log(this.leaveForm.value.days,"workingdays")
  this.api.getLeaveBalance(params,data).subscribe(res=>{
    this.balanceLeave = res['result'].balance_days
    //console.log(this.balanceLeave,"BALACE")
    this.leaveForm.patchValue({balance:this.balanceLeave})
    this.noLeaves = false
  },(error:any)=>{
    this.noLeaves = true
    this.api.showError(error.error.error.message)
  })
   
  }
    
    
    getWorkingDays(
      startDate: Date,
      endDate: Date,
      _holidays,
      selectedFrom: string,
      selectedTo: string
    ): any {
      const fromDate = dayjs(new Date(startDate));
      const toDate = dayjs(new Date(endDate)).subtract(1, 'day');
      const fromToDuration = dayjs.duration(toDate.diff(fromDate)).asDays()
  
      const fromDaySession = fromDate.subtract(
        selectedFrom === '1' ? 24 : 12,
        'hours'
      );
      const toDaySession = toDate.add(selectedTo === '1' ? 12 : 24, 'hours');
      const diffMS = toDaySession.diff(fromDaySession);
      const daysDiff = dayjs.duration(diffMS).asDays();
      const holidays = Object.values(_holidays?.message[0]);
      let daysDiffWithHolidays = daysDiff
  
  
      // Exclude weekends from the leaves
      console.log(daysDiff)
      for(let i=0; i<daysDiff;i++){
        const currentDay = fromDate.add(i, 'days').format('dddd')
        const holidayDate = fromDate.add(i, 'days').format('DD/MM/YYYY')
        const isHoliday = holidays.includes(holidayDate)
        console.log("CURRENT DAY", currentDay)
        if(currentDay === 'Saturday' || currentDay === 'Sunday' || isHoliday){
          daysDiffWithHolidays--;
        }
      }
      // Calculate days between dates
      // const timeDifference = toDate.getTime() - fromDate.getTime();
      // const daysDifference = timeDifference / (1000 * 3600 * 24);
  
      // // Adjust days if sessions are selected
      // let days = Math.abs(Math.round(daysDifference));
      // if (fromSession === toSession) {
      //   days = days + 0.5; // Assuming each session counts as an additional day
      // }else{
      //   days++
      // }
      console.log(holidays, daysDiff, daysDiffWithHolidays)
      return daysDiffWithHolidays;
    }
  endDateValidator():any {
    this.leaveForm.patchValue({
      days:'',
      balance:'',
      ula_to_session: ''
    })
    const yearStartDate = new Date(this.leaveForm.get('leaveApplication_from_date').value).getTime() / (1000 * 60);
    const yearEndDate = new Date(this.leaveForm.get('leaveApplication_to_date').value).getTime() / (1000 * 60);
    if(yearStartDate > yearEndDate ){
      this.invalidDate = true;
      //console.log(yearStartDate > yearEndDate,'true')
    }
    else{
      this.invalidDate = false;
    }
    this.leaveForm.patchValue({
      to_session:[''], 
      balance:[''],    
      days:['']
    })
  }
  
}
