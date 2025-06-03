import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-yet-approve',
  templateUrl: './yet-approve.component.html',
  styleUrls: ['./yet-approve.component.scss']
})
export class YetApproveComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<any>();
  @Output() filter: any = new EventEmitter<any>();
  slno: any;
  date: any;
  people: any;
  timesheet: any;
  time: any;
  savedon: any;
  status: any;
  action: any;
  term: any = '';
  yetToApproveAll: any = [];
  page: any = 1;
  count: any = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  entryPoint: any;
  user_id: any;
  accessConfig: any = [];
  orgId: any;
  userRole: String;
  accessPermissions = []
  @Input() data: any;
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };

  paginationConfig: any = {
    itemsPerPage: this.tableSize,
    currentPage: 1,
    totalItems: 0
  }
 
  constructor(
    private api: ApiserviceService, 
    private _timeSheetService: TimesheetService,
     private modalService: NgbModal,
     private cdref: ChangeDetectorRef, 
     private datepipe: DatePipe,
    private accessControlService: SubModuleService,
     ) { }


  ngOnInit(): void {
    // this.entryPoint = JSON.parse(sessionStorage.getItem('entryPoint'))
    this.user_id = JSON.parse(sessionStorage.getItem('user_id'));
    this.orgId = sessionStorage.getItem('organization_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
  }


  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.yetToApproveAll = changes['data'].currentValue;
    }
    if(changes['totalCount']?.currentValue){
      this.paginationConfig.totalItems=changes['totalCount'].currentValue.pageCount * this.tableSize;
      this.paginationConfig.currentPage=changes['totalCount'].currentValue.currentPage;
      this.paginationConfig.itemsPerPage=this.tableSize;
      this.page=changes['totalCount'].currentValue.currentPage;
      this.count=changes['totalCount'].currentValue.totalCount;
      }
    this.cdref.detectChanges();
  }
  
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  delete(item){
    
    this.api.delete(`${environment.live_url}/${environment.time_sheets}/${item.id}/`,).subscribe((data:any)=>{
      if(data){
        let tableData ={
          page:this.page,
          tableSize:this.tableSize,
          search_key:this.term
         }
        this.buttonClick.emit('');
       this.ngOnInit()
        this.api.showWarning('Timesheet deleted successfully!')
       
      }
    },((error)=>{
      this.api.showError(error?.error?.message)
      
    }))
    
  }
  

  filterSearch() {
    let tableData = {
      search_key: this.term,
      page: this.page,
      tableSize: this.tableSize
    }
    this.buttonClick.emit(tableData)
  }
  onTableDataChange(event: any) {
    this.page = event;
    let tableData = {
      page: this.page,
      page_size: this.tableSize
    }
    this.buttonClick.emit(tableData)
  }
  onTableSizeChange(event: any): void {
    if(event){
    this.tableSize = Number(event.value)
    this.count = 0
    const calculatedPageNo = this.count / this.tableSize
    if (calculatedPageNo < this.page) {
      this.page = 1
    }
    let tableData = {
      page: this.page,
      page_size: this.tableSize
    }
    //alert(tableData.tableSize)
    this.buttonClick.emit(tableData)
  }
  }
  open(content) {
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });

      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          //console.log(content,"ID")
          this.delete(content);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }



  }
  // openDialogue(content, status) {
  //   if (content) {
  //     const statusText = status === 'Decline' ? 'decline' : 'approve'
      
  //     const modelRef = this.modalService.open(GenericDeleteComponent, {
  //       size: status === 'Decline' ? <any>'md' : <any>'sm' ,
  //       backdrop: true,
  //       centered: true
  //     });
  //     modelRef.componentInstance.title = `Are you sure you want to ${statusText}`;
  //     modelRef.componentInstance.message = `${status}`;
  //     modelRef.componentInstance.status.subscribe(async resp => {
  //       modelRef.componentInstance.comments?.subscribe(async comment => {

  //          if (resp == "ok") {
  //           await this.updateTimesheetStatus(content,status,comment)
  //           modelRef.close();
  //         }
  //         else {
  //           modelRef.close();
  //         }
  //       })
  //       if (resp == "ok") {
  //         await this.updateTimesheetStatus(content,status)
  //         modelRef.close();
  //       }
  //       modelRef.close();
  //     })

  //   }

  // }

  openDialogue(content, status) {
    if (!content) return;
  
    const statusText = status === 'Decline' ? 'decline' : 'approve';
  
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: status === 'Decline' ? 'md' : 'sm',
      backdrop: true,
      centered: true
    });
  
    modelRef.componentInstance.title = `Are you sure you want to ${statusText}`;
    modelRef.componentInstance.message = `${status}`;
  
    // If status is "Decline", handle comments first before closing
    if (status === 'Decline') {
      modelRef.componentInstance.comments?.subscribe(async comment => {
        if (comment) {
          await this.updateTimesheetStatus(content, status, comment);
        }
        modelRef.close(); // Close only after handling comments
      });
    }
  
    // Handle status changes separately
    modelRef.componentInstance.status.subscribe(async resp => {
      if (resp === "ok" && status !== 'Decline') {
        await this.updateTimesheetStatus(content, status);
      }
      modelRef.close(); // Close the modal only once
    });
  }
  
  updateTimesheetStatus(content,status,comments?) {
    const confirmText = status === 'Approve' ? 'approved' : 'declined'
    let date = new Date()
    let formattedDate = this.datepipe.transform(date,'yyyy-MM-dd')
    let data =   {
      id: content.id,
      status: status === 'Approve' ? 2 : 3,
      organization: this.orgId,
      employee: content.created_by,
      approved_by: this.user_id || null,
      approved_on: formattedDate || null,
      rejected_by: null,
      rejected_on: null
    }
    if(status === 'Approve'){
      this.api.postData(`${environment.live_url}/${environment.update_timesheet_status}/`,data).subscribe(res => {
        if (res) {
          this.api.showSuccess(`Timesheet ${confirmText} successfully`)
          this.buttonClick.emit('')
        }
      }, (error => {
        this.api.showError(error?.error?.message)
      }))
    }if(status === 'Decline'){
      const data = {
        timesheet_id: content.id,
        comment: comments,
        status:3,
        rejected_by: this.user_id,
        rejected_on: formattedDate || null
      }
    this.api.postData(`${environment.live_url}/${environment.timesheet_comment}/`,data).subscribe(res => {
      if (res) {
        this.api.showSuccess(`Timesheet ${confirmText} successfully`)
        this.buttonClick.emit('')
      }
    }, (error => {
      this.api.showError(error?.error?.message)
    }))
    }
   
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
