import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import {   FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
import { SubModuleService } from 'src/app/service/sub-module.service';
@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  @Output() buttonClick:any = new EventEmitter<any>();
  @Output() filter:any = new EventEmitter<any>();
  list:any=[];
  slno:any;
  fromDate:any;
  toDate:any;
  appliedDays:any;
  usedLeaves:any;
  appliedDate:any;
  approvedBy:any;
  approvedDate:any;
  status:any;
  action:any;
  term:any='';
  delData: any;
  page:any =1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  params: { approved_state: string; user_id: number; leaveApplication_from_date: string; leaveApplication_to_date: string; };
  pagination: { page_number: number; data_per_page: number; };
  AllListData: any;
  entryPoint: any;
  user_id: any;
  accessConfig: any;
  orgId: any;
  @Input() data:any;
  @Input() totalCount:{ 'pageCount': any, 'currentPage': any };

  paginationConfig:any={
    itemsPerPage: this.tableSize,
    currentPage: 1,
    totalItems: 0}

  constructor(private builder:FormBuilder, private api:ApiserviceService,private modalService:NgbModal,
   private common_service:CommonServiceService,private cdref: ChangeDetectorRef,
  private accessControlService:SubModuleService) { }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id')
    this.orgId = sessionStorage.getItem('organization_id')
  }
    
  ngOnChanges(changes:SimpleChange):void{
    if(changes['data'].currentValue){
      this.data=changes['data'].currentValue;
    }
    if(changes['totalCount']?.currentValue){
      this.paginationConfig.totalItems=changes['totalCount'].currentValue.pageCount * this.tableSize;
      this.paginationConfig.currentPage=changes['totalCount'].currentValue.currentPage;
      this.paginationConfig.itemsPerPage=this.tableSize;
      this.page=changes['totalCount'].currentValue.currentPage;
      this.count=changes['totalCount'].currentValue.totalCount;
      this.tableSize = changes['totalCount'].currentValue.reset ? changes['totalCount'].currentValue.itemsPerPage : this.tableSize
    }
    this.cdref.detectChanges();
      }
  getUserControls(){
   
    this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res:any)=>{
      if(res.status_code !== '401'){
        this.common_service.permission.next(res['data'][0]['permissions'])
      }
      else{
        this.api.showError("ERROR !")
      }
    }
    )
    this.common_service.permission.subscribe(res=>{
      const accessArr = res
      if(accessArr.length > 0){
        accessArr.forEach((element,i) => {
          if(element['APPLIED/APPROVIED_LEAVES']){
            this.accessConfig = element['APPLIED/APPROVIED_LEAVES']
          }
          
        });  
      }
    })
  }
  delete(item:any){
    this.api.delete(`${environment.live_url}/${environment.employee_leave_details}/${item.id}/`).subscribe((data:any)=>{
      this.api.showWarning('leave deleted successfully!')
      let tableData ={
        // page:this.page,
        // tableSize:this.tableSize,
        // search_key:this.term
       }
      this.buttonClick.emit(tableData);
    },((error:any)=>{
      this.api.showError(error?.error?.message)
    }))
   
  }
  openDialogue(content,status){
    if(content){
      const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
      const confirmText  = status === 'APPROVED' ? 'Approve' :'Decline'
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm'
  ,
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
    //console.log(content,status,"STATUS CONTENT CHECK")
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
     let date = new Date();
     let currDate =('0' +(date.getDate())).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/'  + date.getFullYear() 
     //console.log( currDate," this.currDate")
    let method = status ==="APPROVED" ? "APPROVE" :"REJECT"
    let data ={
      user_id:this.user_id,
      module:"LEAVE/HOLIDAY_LIST",
      menu:"APPLIED/APPROVIED_LEAVES",
      method:method,
      id: content,
      approved_state: status,
      approved_by_id:this.user_id,
      approved_date:currDate
  }
 
  this.api.leaveApplicationState(data).subscribe(res =>{
    //console.log('emitt');
    let tableData ={
      page:this.page,
      tableSize:this.tableSize,
      search_key:this.term
     }
    this.buttonClick.emit(tableData);
    // if(res){
    //   this.buttonClick.emit(this.page);
    //   //console.log(res,"STATE CHANGE")
    // }
 
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
      page:this.page,
      page_size:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.value);
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize
    
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let tableData ={
      page:this.page,
      page_size:this.tableSize,
     }
    this.buttonClick.emit(tableData);
  }
  getContinuousIndex(index: number):number {
    return (this.page-1)*this.tableSize+ index + 1;
  }
}
