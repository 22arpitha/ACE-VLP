import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { error } from 'console';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  @Output() buttonClick:any = new EventEmitter<any>();
  @Output() filter:any = new EventEmitter<any>();

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
  page:any = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  entryPoint: any;
  user_id: string;
  accessConfig: any;
  orgId: any;
  @Input() data:any
  @Input() totalCount:{ 'pageCount': any, 'currentPage': any };
  paginationConfig:any={
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0}
  constructor(private builder:FormBuilder, private api:ApiserviceService,private timesheetService:TimesheetService,
    private modalService:NgbModal,private common_service:CommonServiceService,private cdref: ChangeDetectorRef) { }

    ngOnInit(): void {
      this.user_id = sessionStorage.getItem('user_id')
      this.orgId = sessionStorage.getItem('org_id')
    }
    ngOnChanges(changes:SimpleChange):void{
      if(changes['data'].currentValue){
        this.list=changes['data'].currentValue;
      }
      if(changes['totalCount'].currentValue){
        this.paginationConfig.totalItems=changes['totalCount'].currentValue.pageCount * this.tableSize;
        this.paginationConfig.currentPage=changes['totalCount'].currentValue.currentPage;
        this.paginationConfig.itemsPerPage=this.tableSize;
      this.page=changes['totalCount'].currentValue.currentPage;
      this.count=changes['totalCount'].currentValue.pageCount * this.tableSize;
      this.tableSize = changes['totalCount'].currentValue.reset ? changes['totalCount'].currentValue.itemsPerPage : this.tableSize
      }
      // this.cdref.detectChanges();
        }
  
 
  delete(item:any){
  if(this.list.length === 1){
    this.deleteContent(item)
    this.list =[]
  }
  else{
   this.deleteContent(item)
  }
   
  }
  deleteContent(item){
    this.api.delete(`${environment.live_url}/${environment.time_sheets}/${item.id}/`).subscribe((data:any)=>{
      if(data){
        let tableData ={
          page:this.page,
          tableSize:this.tableSize,
          search_key:this.term
         }
        this.buttonClick.emit(tableData);
       this.ngOnInit()
        this.api.showWarning('Timesheet deleted successfully!')
       
      }
    },((error)=>{
      this.api.showError(error?.error?.message)
      
    }))
    
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
     let tableData={
      page:this.page,
      page_size:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }  
  onTableSizeChange(event:any): void {
    if(event){
    
    this.tableSize = this.tableSize
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize
    
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let tableData={
      page:this.page,
      page_size:this.tableSize
     }
    this.buttonClick.emit(tableData);
    }
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
  open(content) {
    if(content){
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered:true
      });
     
      modelRef.componentInstance.status.subscribe(resp => {
        if(resp == "ok"){
         this.delete(content);
         modelRef.close();
        }
        else{
          modelRef.close();
        }
    })
	
	} 
}
  openDialogue(content,status) {
    if(content){
      const statusText = status === 'DECLINED' ? 'decline' : 'approve'
      const confirmText  = status === 'APPROVED' ? 'Approve' :'Decline'
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm'
  ,
        backdrop: true,
        centered:true
      });
      modelRef.componentInstance.title = `Are you sure you want to ${statusText}`;
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
    let currStatus =  status === 'Approved'?  "APPROVED": "DECLINED";
    let data= {
      time_sheet_ids: null,
      time_sheet_id:content,
      status_name: currStatus,
      approved_by: 73
  }
  this.timesheetService.updateStatus(data).subscribe(res =>{
    if(res){
      this.api.showSuccess(`${status} updated successfully`)
      let tableData ={
        page:this.page,
        tableSize:this.tableSize,
        search_key:this.term
       }
      this.buttonClick.emit(tableData);
    }
    
  })
  }
  getContinuousIndex(index: number):number {
  return (this.page-1)*this.tableSize+ index + 1;
}
}
