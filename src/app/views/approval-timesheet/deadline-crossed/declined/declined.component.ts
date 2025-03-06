import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-declined',
  templateUrl: './declined.component.html',
  styleUrls: ['./declined.component.scss']
})
export class DeadlineDeclinedComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<string>();
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  rejectedon:any;
  rejectedby:any;
  status:any;
  action:any;
  term:any='';

  declinedAll:any = [];
  params: { status: string; user_id: any; page_number: any; data_per_page: number; timesheets_to_date: string; timesheets_from_date: string; };
  //userId: any = 1;
  page:any = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [10,25,50,100];
  declinedCount = 0;
  user_id: any;
  accessConfig: any = [];
  @Input() set data(value) {
    this.declinedAll = value;
    // this.count = value['count']
  }

  get data(): string {
    return this.declinedAll;
  }
  @Input() set totalCount(value){
    let add:string = '0'
    let tableCount:string = value
    this.count = Number(tableCount+add);
    //console.log(this.count,"COUNT---") 
  }
  constructor(private _timesheet:TimesheetService,
    private modalService:NgbModal,
    private api:ApiserviceService,
    private common_service:CommonServiceService) { 
    
  }

  ngOnInit(){
    this.user_id =sessionStorage.getItem('user_id')
  }
  
  
    
    onTableDataChange(event:any){
      this.page = event;
      this.buttonClick.emit(event)
    }  
    onTableSizeChange(event:any): void {
      this.tableSize = Number(event.target.value);
      this.count = 0
      const calculatedPageNo = this.count / this.tableSize
      
      if(calculatedPageNo < this.page){
        this.page = 1
      }
      this.buttonClick.emit(this.page)
    } 
   
    open(content,status) {
      if(content){
        const modelRef =   this.modalService.open(GenericDeleteComponent, {
          size: <any>'sm',
          backdrop: true,
          centered:true
        });
       modelRef.componentInstance.text = `Are you sure you want to ${status}`;
       modelRef.componentInstance.message =`Confirmation`;
        modelRef.componentInstance.status.subscribe(resp => {
          if(resp == "ok"){
           this.updateStatus(content,status);
           modelRef.close();
          }
          else{
            modelRef.close();
          }
      })
    
    }
  }
  updateStatus(content,status){
    let currMethod = status === 'DECLINED'?'REJECT':'ACCEPT'
    let manager_id = sessionStorage.getItem('manager_id')
    let data= {
      time_sheet_ids: null,
      time_sheet_id:content,
      status_name: status,
      reporting_manager_ref:manager_id,
      module: "TIMESHEET",
      menu: "MONTH_APPROVAL_TIMESHEET",
      method: currMethod,
      user_id:this.user_id
    }
  this._timesheet.updateStatus(data).subscribe(res =>{
    this.buttonClick.emit(this.page)
    if(res){
      this.api.showSuccess(`${status} updated successfully`)
    }
    
  })
  }
}
