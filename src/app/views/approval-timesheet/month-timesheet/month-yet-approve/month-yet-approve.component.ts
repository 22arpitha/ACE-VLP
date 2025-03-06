import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../../generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';
import { environment } from 'src/environments/environment';
import { SubModuleService } from 'src/app/service/sub-module.service';

@Component({
  selector: 'app-month-yet-approve',
  templateUrl: './month-yet-approve.component.html',
  styleUrls: ['./month-yet-approve.component.scss']
})
export class MonthYetApproveComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<any>();
  @Output() filter: any = new EventEmitter<any>();
  slno: any;
  date: any;
  people: any;

  time: any;
  savedon: any;
  status: any;
  action: any;
  term: any = '';
  yetToApproveAll: any = [];
  params: { status: string; user_id: any; page_number: any; data_per_page: number; timesheets_to_date: string; timesheets_from_date: string; };
  //userId: any = 1;
  page: any = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  yetcount = 0;
  user_id: any;
  accessConfig: any = [];
  org_id: any;
  isAllSelected = false;
  @Input() data: any;
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };
  paginationConfig: any = {
    itemsPerPage: this.tableSize,
    currentPage: 1,
    totalItems: 0
  }
  selectedId: any = [];
  timesheetId: any;
  userRole: String;
  accessPermissions = []
  onCheckboxChange(id) {
    // If any checkbox is unchecked, uncheck the "Select All" checkbox
    const allSelected = this.yetToApproveAll.every(item => item.selected);
    this.isAllSelected = allSelected;
    // this.selectedId.push(id)
    // console.log(this.selectedId)
    this.performActionOnSelected()
  }
  selectAll(event: any) {
    const isChecked = event.target.checked;
    this.yetToApproveAll.forEach(item => item.selected = isChecked);
    this.timesheetId = this.yetToApproveAll.map(m =>m.id)
  }

  // Function to perform action on selected rows
  performActionOnSelected() {
    const selectedItems = this.yetToApproveAll.filter(item => item.selected);
    if (selectedItems.length) {
      this.timesheetId = selectedItems.map(m =>m.id)
      // Add your logic to handle selected items
    }
  }
  constructor(
    private modalService: NgbModal, 
    private cdref: ChangeDetectorRef,
    private api: ApiserviceService,
     private accessControlService: SubModuleService,
    private datepipe:DatePipe) {

  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id')
    this.org_id = sessionStorage.getItem('organization_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
  }
  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.yetToApproveAll = changes['data'].currentValue;
    }
    if (changes['totalCount']?.currentValue) {
      this.paginationConfig.totalItems = changes['totalCount'].currentValue.pageCount * changes['totalCount'].currentValue.itemsPerPage;
      this.paginationConfig.currentPage = changes['totalCount'].currentValue.currentPage;
      this.paginationConfig.itemsPerPage = changes['totalCount'].currentValue.itemsPerPage;
      this.page = changes['totalCount'].currentValue.currentPage;
      this.count = changes['totalCount'].currentValue.pageCount * changes['totalCount'].currentValue.itemsPerPage;
      this.tableSize = changes['totalCount'].currentValue.reset ? changes['totalCount'].currentValue.itemsPerPage : this.tableSize
    }
    this.cdref.detectChanges();
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  
  filterSearch() {
    let tableData = {
      search_key: this.term,
      page: this.page,
      tableSize: this.tableSize
    }
    this.filter.emit(tableData);
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
    this.tableSize = Number(event.value);
    this.count = 0
    const calculatedPageNo = this.count / this.tableSize
    if (calculatedPageNo < this.page) {
      this.page = 1
    }
    let tableData = {
      page: this.page,
      page_size: this.tableSize
    }
    this.buttonClick.emit(tableData)
  }
 

  
  // openDialogue(content?, status?,bulk?) {
  //   const statusText = status === 'Decline' ? 'decline' : 'approve' 
  //   const action = bulk
  //     const modelRef = this.modalService.open(GenericDeleteComponent, {
  //       size: status === 'Decline' ? <any>'md' : <any>'sm',
  //       backdrop: true,
  //       centered: true
  //     });
  //     modelRef.componentInstance.title = `Are you sure you want to ${statusText}`;
  //     modelRef.componentInstance.message = `${status}`;
  //     modelRef.componentInstance.bulkAction = action
  //     modelRef.componentInstance.status.subscribe(async resp => {
  //       modelRef.componentInstance.comments.subscribe(async comment => {
  //         if (resp === "ok") {
  //           await this.updateTimesheetStatus(content, status,comment)
  //           modelRef.close();
  //         }else {
  //           modelRef.close();
  //         }
  //       })
  //       if (resp === "ok") {
  //         await this.updateTimesheetStatus(content, status)
  //         modelRef.close();
  //       }else {
  //         modelRef.close();
  //       }
  //       modelRef.close();
  //     })

    

  // }

  openDialogue(content?, status?, bulk?) {
    const statusText = status === 'Decline' ? 'decline' : 'approve';
    const action = bulk;
  
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: status === 'Decline' &&  bulk !== 'bulk' ? 'md' : 'sm',
      backdrop: true,
      centered: true
    });
  
    modelRef.componentInstance.title = `Are you sure you want to ${statusText}`;
    modelRef.componentInstance.message = `${status}`;
    modelRef.componentInstance.bulkAction = action;
  
    // Handle comments first (Only for "Decline")
    if (status === 'Decline') {
      modelRef.componentInstance.comments?.subscribe(async comment => {
        if (comment) {
          await this.updateTimesheetStatus(content, status, comment);
        }
        modelRef.close(); // Close modal after handling comments
      });
    }
    if(bulk){
      modelRef.componentInstance.status.subscribe(async resp => {
        if (resp === "ok" && status === 'Decline') {
          this.updateTimesheetStatus(content, status); 
        }
        modelRef.close();
      });
    }
  
    // Handle status change separately
    modelRef.componentInstance.status.subscribe(async resp => {
      if (resp === "ok" && status !== 'Decline') {
        await this.updateTimesheetStatus(content, status);
        modelRef.close(); // Close only for non-Decline actions
      } else if (resp !== "ok") {
        modelRef.close(); // Close modal if action is cancelled
      }
    });
  }
  
  updateTimesheetStatus(content, status,comment?) {
    const confirmText = status === 'Approve' ? 'approved' : 'declined'
    let date = new Date()
    let formattedDate = this.datepipe.transform(date,'yyyy-MM-dd')
    let data =   {}
    if(content){
      if(status === 'Approve'){
      data =   {
        id: content.id,
        status: status === 'Approve' ? 2 : 3,
        organization: this.org_id,
        employee: content.created_by,
        approved_by: this.user_id || null,
        approved_on: formattedDate || null,
        rejected_by: null,
        rejected_on: null
      }
      this.api.postData(`${environment.live_url}/${environment.update_timesheet_status}/`,data).subscribe(res => {
        if (res) {
          this.api.showSuccess(`Timesheet ${confirmText} successfully!`)
          this.buttonClick.emit('')
        }
      }, (error => {
        this.api.showError(error?.error?.message)
      }))
    }if(status === 'Decline'){
        const data = {
          timesheet_id: content.id,
          comment: comment,
          status:3,
         rejected_by: this.user_id || null
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
      
    }else{
      data =   {
        id: this.timesheetId,
        status: status === 'Approve' ? 2 : 3,
        organization: this.org_id,
        approved_by: status === 'Approve' ? this.user_id :null,
        approved_on: status === 'Approve' ? formattedDate :null,
        rejected_by: status === 'Decline' ? this.user_id :null,
        rejected_on: status === 'Decline' ? formattedDate :null
      }
      this.api.updateData(`${environment.live_url}/${environment.update_timesheet_status}/`,data).subscribe(res => {
        if (res) {
          this.api.showSuccess(`Timesheet ${confirmText} successfully!`)
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
