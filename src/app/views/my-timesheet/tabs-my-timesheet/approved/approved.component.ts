import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  term:any='';
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  approvedOn:any;
  approvedBy:any;
  status:any;
  action:any;
  list: any = [];
  page = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [10,25,50,100];
  @Input() set data(value){
    this.list = value
   //console.log(this.list)
  }
  get data(){
  return this.list
  }
  constructor(private builder:FormBuilder, private api:ApiserviceService,private timesheetService:TimesheetService) { }

  ngOnInit(): void {
    //console.log(this.data);
  }
 
  delete(id:any){
    // this.api.deleteTimeSheeteDetails(id).subscribe((data:any)=>{ 
    //   this.api.showWarning('Declined Leave Deleted Successfully!')
    // })
    
  }
  onTableDataChange(event:any){
    this.page = event;
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.page = 1;
  } 
  statusExecution(item,status){
   
   
      let data = {
        "time_sheet_ids": null,
        "time_sheet_id": item.id,
        "status_name":status,
        "approved_by":item.approved_by_user
    }
   this.timesheetService.updateStatus(data).subscribe(res=>{
    //console.log(res,"APPROVED--res")
   })
    
  }
}
