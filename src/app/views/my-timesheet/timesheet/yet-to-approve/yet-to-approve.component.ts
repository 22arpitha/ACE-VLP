import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-yet-to-approve',
  templateUrl: './yet-to-approve.component.html',
  styleUrls: ['./yet-to-approve.component.scss']
})
export class YetToApproveComponent implements OnInit {
  @Output() buttonClick:any = new EventEmitter<any>();
  @Output() filter:any = new EventEmitter<any>();
  list:any=[];
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  status:any;
  action:any;
  term:any='';
  page:any=1;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  count:any = 0
  entryPoint: any;
  user_id: any;
  accessConfig: any = [];
  orgId: any;
  userRole: string;
  accessPermissions: any=[];
  @Input() data:any = [];
  @Input() totalCount:{ 'pageCount': any, 'currentPage': any };
  paginationConfig:any={
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0}
   
  constructor(private builder:FormBuilder, private api:ApiserviceService,
    private modalService:NgbModal,private _timesheet:TimesheetService,private cdref: ChangeDetectorRef,
    private common_service:CommonServiceService, private accessControlService:SubModuleService) { }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id')
    this.orgId = sessionStorage.getItem('org_id')
    this.userRole = sessionStorage.getItem('user_role_name') || '';
    this.getModuleAccess();
    
  }

  ngOnChanges(changes:SimpleChange):void{
    if(changes['data'].currentValue){
      this.list=changes['data']?.currentValue ;
    }
    if(changes['totalCount']?.currentValue){
      this.paginationConfig.totalItems=changes['totalCount'].currentValue.pageCount * this.tableSize;
      this.paginationConfig.currentPage=changes['totalCount'].currentValue.currentPage;
      this.paginationConfig.itemsPerPage=this.tableSize;
    this.page=changes['totalCount'].currentValue.currentPage;
    this.count=changes['totalCount'].currentValue.pageCount * this.tableSize;
    this.tableSize = changes['totalCount'].currentValue.reset ? changes['totalCount'].currentValue.itemsPerPage : this.tableSize
    }
    this.cdref.detectChanges();
      }
 
  // getUserControls(){
  //   this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res:any)=>{
  //     if(res.status_code !== '401'){
  //       this.common_service.permission.next(res['data'][0]['permissions'])
  //     }
  //     else{
  //       this.api.showError("ERROR!")
  //     }
  //   },(error=>{
  //        this.api.showError(error.error.error.message)
  //     })
  
  //   )
  
  //   this.common_service.permission.subscribe(res=>{
  //     const accessArr = res
  //     if(accessArr.length > 0){
  //       accessArr.forEach(element => {
  //         if(element['PEOPLE_TIMESHEET']){
  //           this.accessConfig = element['PEOPLE_TIMESHEET']
  //         }
          
  //       });
        
  //     }
  //   })
  //   }
  
  
  filterSearch(){
    let tableData ={
      search_key:this.term,
      page:this.page,
      tableSize:this.tableSize
     }
    this.filter.emit(tableData);
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:',this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  delete(item:any){
  if(this.list === 1){
    this.deleteContent(item)
    this.list = []
  }else{
    this.deleteContent(item)
  }
  }
  deleteContent(item){
    
    this.api.delete(`${environment.live_url}/${environment.time_sheets}/${item.id}/`,).subscribe((data:any)=>{
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
  deleteCard(id){
    this.delete(id)
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
  this._timesheet.updateStatus(data).subscribe(res =>{
    let tableData ={
      page:this.page,
      tableSize:this.tableSize,
      search_key:this.term
     }
    this.buttonClick.emit(tableData);
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
onTableDataChange(event: any): void {
  this.page = event;
  let tableData ={
    page:this.page,
    page_size:this.tableSize
   }
  this.buttonClick.emit(tableData);
}
onTableSizeChange(event:any): void {
  if(event){
    
  this.tableSize = event.value
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
  // alert(tableData.tableSize)
  this.buttonClick.emit(tableData);
  }
} 
getContinuousIndex(index: number):number {
  return (this.page-1)*this.tableSize+ index + 1;
}
}
