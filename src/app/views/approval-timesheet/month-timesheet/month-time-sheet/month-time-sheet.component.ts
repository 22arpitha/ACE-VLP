import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-month-time-sheet',
  templateUrl: './month-time-sheet.component.html',
  styleUrls: ['./month-time-sheet.component.scss']
})
export class MonthTimeSheetComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<any>();
  @Output() filter:any = new EventEmitter<any>();

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
  
  timesheetDataAll:any = []
  params: { status: string; user_id: any; page_number: any; data_per_page: number; timesheets_to_date: string; timesheets_from_date: string; };
 // userId: any = 1;
  page:any = 1;
  timesheetCount = 0;
  tableSize = 10;
  tableSizes = [10,25,50,100];
  count = 0;
  user_id: any;
  accessConfig: any = [];
  org_id: any;
  @Input() set data(value) {
    this.timesheetDataAll = value;
   // //console.log(this.timesheetDataAll,"TIMESHEET---")
    // this.count = value['count']
  }

  get data(): string {
    return this.timesheetDataAll;
  }
  @Input() set totalCount(value){
    let add:string = '0'
    let tableCount:string = value
    this.count = Number(tableCount+add);
    ////console.log(this.count,"COUNT---") 
  }
  constructor(
    private _timesheet : TimesheetService,
    private api:ApiserviceService,
    private modalService:NgbModal,
    private common_service:CommonServiceService
    ) {
 
   }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id')
    this.org_id = sessionStorage.getItem('org_id')
    this.getUserControls()
  }
  getUserControls(){
    this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10&organization_id=${this.org_id}&pagination=TRUE`).subscribe((res:any)=>{
      if(res.status_code !== '401'){
        this.common_service.permission.next(res['data'][0]['permissions'])
        //console.log(this.common_service.permission,"PERMISSION")
      }
      else{
        this.api.showError("ERROR !")
      }
      //console.log(res,'resp from yet');
      
    }
  
    )
  
    this.common_service.permission.subscribe(res=>{
      const accessArr = res
      if(accessArr.length > 0){
        accessArr.forEach((element,i) => {
          if(element['MONTH_APPROVAL_TIMESHEET']){
            this.accessConfig = element['MONTH_APPROVAL_TIMESHEET']
          }
          
        });
      }
   
    })
   
    }
  

    filterSearch(){
      let tableData ={
        search_key:this.term,
        page:this.page,
        tableSize:this.tableSize
       }
      this.filter.emit(tableData);
    }
  onTableDataChange(event:any){
    this.page = event;
    let tableData ={
      search_key:this.term,
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData)
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    const calculatedPageNo = this.count / this.tableSize
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let tableData ={
      search_key:this.term,
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData)
  } 
  open(content,status) {
    const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
    const confirmText  = status === 'APPROVED' ? 'Approve' :'Decline'
    if(content){
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'md',
        backdrop: true,
        centered:true
      });
      modelRef.componentInstance.title = `Are you sure you want to ${selectedStatus}`;
      modelRef.componentInstance.message = `${confirmText} confirmation`;
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
