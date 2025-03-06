import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';

import { ApiserviceService } from '../../../../service/apiservice.service';
import { CommonServiceService } from '../../../../service/common-service.service';
import { error } from 'console';
import { environment } from 'src/environments/environment';
import { SubModuleService } from 'src/app/service/sub-module.service';
@Component({
  selector: 'app-yet-to-approve',
  templateUrl: './yet-to-approve.component.html',
  styleUrls: ['./yet-to-approve.component.scss']
})
export class YetToApproveComponent implements OnInit{
  @Output() buttonClick:any = new EventEmitter<any>();
  @Output() filter:any = new EventEmitter<any>();
  list:any = [];
  term:any='';
  slno:any;
  fromDate:any;
  toDate:any;
  appliedDays:any;
  allotedLeaves:any;
  usedLeaves:any;
  appliedDate:any;
  status:any;
  action:any;
  delData: any;
  page:any=1;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  count:any = 0
  entryPoint: any;
  user_id: any;
  userRole:any;
  accessPermissions = []
  accessConfig: any;
  permissions: any = [];
  orgId: any;
  @Input() data:any;
  @Input() totalCount:{ 'pageCount': any, 'currentPage': any };

  paginationConfig:any={
    itemsPerPage:this.tableSize,
    currentPage: 1,
    totalItems: 0}
  
  constructor(
    private builder:FormBuilder, 
    private api:ApiserviceService,
    private modalService:NgbModal,
    private cdr: ChangeDetectorRef,
    public common_service:CommonServiceService,
    private cdref: ChangeDetectorRef,
    private accessControlService:SubModuleService
    ) { 
      this.userRole = sessionStorage.getItem('user_role_name');
    }

    
  ngOnInit(){
    
    this.user_id = sessionStorage.getItem('user_id')
    this.orgId = sessionStorage.getItem('org_id')
    this.getModuleAccess();
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

      getModuleAccess(){
        this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
          if (access) {
            this.accessPermissions = access[0].operations;
            console.log('Access Permissions:', access);
          } else {
            console.log('No matching access found.');
          }
        });
      }
 
    filterSearch(){
      let tableData ={
        search_key:this.term,
        page:this.page,
        tableSize:this.tableSize
       }
      this.filter.emit(tableData);
    }
  onTableDataChange(event: any): void {
    this.page = event;
    let tableData ={
     page:event,
     page_size:this.tableSize,
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
      page_size:event.value,
     }
    this.buttonClick.emit(tableData);
  }

  delete(item:any,type?){
   
    this.api.delete(`${environment.live_url}/${environment.employee_leave_details}/${item.id}/`).subscribe((data:any)=>{
      if(type){
        this.api.showWarning('leave revoked successfully!')
      }else{
        this.api.showWarning('leave deleted successfully!')
      }
      
      let tableData ={
        page:this.page,
        page_size:this.tableSize,
       }
      this.buttonClick.emit(tableData);
    },((error:any)=>{
      this.api.showError(error?.error?.message)
    }))
   
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
  openRevokeDialogue(content,type){
    if(content){
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered:true
      });
      
      modelRef.componentInstance.title = `Are you sure you want to revoke the leave`;
      modelRef.componentInstance.message = `Revoke`;
      
      modelRef.componentInstance.status.subscribe(resp => {
        if(resp == "ok"){
         this.delete(content,type);
         modelRef.close();
        }
        else{
          modelRef.close();
        }
    })
  }
}
  openDialogue(content,status){
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
  getContinuousIndex(index: number):number {
    return (this.page-1)*this.tableSize+ index + 1;
  }
}
