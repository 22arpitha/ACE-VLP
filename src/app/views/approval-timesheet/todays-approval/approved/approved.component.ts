import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss']
})
export class ApprovedComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<any>();
  @Output() filter: any = new EventEmitter<any>();

  slno: any;
  date: any;
  people: any;
  timesheet: any;
  time: any;
  savedon: any;
  approvedon: any;
  approvedby: any;
  status: any;
  action: any;
  term: any = '';
  page: any = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  approvedAll: any = [];
  list: any = [];
  entryPoint: any;
  user_id: any;
  accessConfig: any = [];
  orgId: any;
  @Input() data: any
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };
  paginationConfig: any = {
    itemsPerPage: this.tableSize,
    currentPage: 1,
    totalItems: 0
  }
  constructor(private api: ApiserviceService, private _timeSheetService: TimesheetService
    , private modalService: NgbModal, private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService) { }

  ngOnInit(): void {
    this.entryPoint = JSON.parse(sessionStorage.getItem('entryPoint'))
    this.user_id = sessionStorage.getItem('user_id');
    this.orgId = sessionStorage.getItem('organization_id');
  }

  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.list = changes['data'].currentValue;
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
  

  delete(items: any) {
    let params = {
      module: "TIMESHEET",
      menu: "TODAY_APPROVAL_TIMESHEET",
      method: "DELETE",
      user_id: this.user_id
    }
    this._timeSheetService.deleteTodaysApproval(items.id, params).subscribe((data: any) => {
      this.api.showWarning('Approved TimeSheet Deleted Successfully!')
    }, error => {
      //console.log(error);

    })

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
          this.delete(content);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }



  }
  filterSearch() {
    let tableData = {
      search_key: this.term,
      page: this.page,
      tableSize: this.tableSize
    }
    this.buttonClick.emit(tableData);
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
    this.buttonClick.emit(tableData)
  }
  }
  openDialogue(content, status) {
    if (content) {
      const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
      const confirmText = status === 'APPROVED' ? 'Approve' : 'Decline'
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `Are you sure you want to ${selectedStatus}`;
      modelRef.componentInstance.message = `${confirmText} confirmation`;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.updateStatus(content, status);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  updateStatus(content, status) {
    //let currStatus =  status === 'Approved'?  "APPROVED": "DECLINED";
    let currMethod = status === 'DECLINED' ? 'REJECT' : 'ACCEPT';
    let manager_id = sessionStorage.getItem('manager_id')
    let data = {
      time_sheet_ids: null,
      time_sheet_id: content,
      status_name: status,
      reporting_manager_ref: manager_id,
      module: "TIMESHEET",
      menu: "TODAY_APPROVAL_TIMESHEET",
      method: currMethod,
      user_id: this.user_id
    }
    this._timeSheetService.updateStatus(data).subscribe(res => {
      if (res) {
        const toastText = status === 'DECLINED' ? 'declined' : 'approved'
        this.api.showSuccess(`Timesheet ${toastText} successfully`)
        let tableData = {
          search_key: this.term,
          page: this.page,
          tableSize: this.tableSize
        }
        this.buttonClick.emit(tableData)
      }

    })
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
