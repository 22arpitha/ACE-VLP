import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { error } from 'console';

@Component({
  selector: 'app-yet-approve',
  templateUrl: './yet-approve.component.html',
  styleUrls: ['./yet-approve.component.scss']
})
export class YetApproveComponent implements OnInit {

  @Output() buttonClick:any = new EventEmitter<string>();
  user_id: any;
  accessConfig: any;
  
  constructor(private builder:FormBuilder, 
    private api:ApiserviceService,
    private modalService:NgbModal,
    public common_service:CommonServiceService ) {}
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
    page:any = 1;
    count;
    tableSize = 10;
    tableSizes = [10,25,50,100];
    
   
    @Input() set data(value){
      this.list = value
     }
    @Input() set totalCount(value){
        let add:string = '0'
        let tableCount:string = value
        this.count = Number(tableCount+add);
        //console.log(this.count,"COUNT---") 
     }
    
     pageChange(){
      if(this.totalCount){
        //console.log(this.totalCount)
      }

     }
   get data(): string {
    return this.list;
   }
  
   ngOnInit() {
    this.user_id = sessionStorage.getItem('user_id')
    this.getUserControls()
  }
  getUserControls(){
    this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10`).subscribe((res:any)=>{
      if(res.status_code !== '401'){
        this.common_service.permission.next(res['data'][0]['permissions'])
      }
      else{
        this.api.showError("ERROR !")
      }
    },(error =>{
      this.api.showError(error.error.error.message)
    })
  
    )
  
    this.common_service.permission.subscribe(res=>{
      const accessArr = res
      if(accessArr.length > 0){
        accessArr.forEach((element,i) => {
          if(element['ADD_ON_LEAVE_REQUEST']){
            this.accessConfig = element['ADD_ON_LEAVE_REQUEST']
          }
          
        });
        
      }
   
      
    //  console.log(this.accessConfig,"this.accessConfig")
    })
    }
  
  delete(item:any){
    let params = {
      module: "LEAVE/HOLIDAY_LIST",
      menu: "ADD_ON_LEAVE_REQUEST",
      method: "DELETE",
      user_id: this.user_id
  }
    this.api.deletePeopleLeaves(item.id,params).subscribe((data:any)=>{
      this.api.showWarning('Yet to approved  deleted successfully!')
      let tableData ={
        page:this.page,
        tableSize:this.tableSize
       }
      this.buttonClick.emit(tableData);
    },error=>{
      this.api.showError(error.error.error.message);
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
  //  //console.log(content,status,"STATUS CONTENT CHECK")
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'))
     let date = new Date();
     let currDate =('0' +(date.getDate())).slice(-2) + '/' + ('0' + (date.getMonth()+1)).slice(-2) + '/'  + date.getFullYear() 
    let method = status ==="APPROVED" ? "APPROVE" :"REJECT"
    let data ={
      user_id:this.user_id,
      module:"LEAVE/HOLIDAY_LIST",
      menu:"ADD_ON_LEAVE_REQUEST",
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
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
    
  })
  }
  onTableDataChange(event:any){
    this.page = event;
    let tableData ={
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize
    
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let tableData ={
      page:this.page,
      tableSize:this.tableSize
     }
    this.buttonClick.emit(tableData);
  }  
}
