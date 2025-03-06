import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-deadline-yetto-approve',
  templateUrl: './deadline-yetto-approve.component.html',
  styleUrls: ['./deadline-yetto-approve.component.scss']
})
export class DeadlineYettoApproveComponent implements OnInit {
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
  tableSize = 10;
  tableSizes = [10, 25, 50, 100];
  yetcount = 0;
  user_id: any;
  accessConfig: any = [];
  @Input() data: any;
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };
  orgId: any;
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  }
 
  constructor(private _timesheet: TimesheetService,
    private modalService: NgbModal,
    private api: ApiserviceService,
    private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService) {

  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.orgId = sessionStorage.getItem('org_id');
  }

  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.yetToApproveAll = changes['data'].currentValue;
    }
    if (changes['totalCount']?.currentValue) {
      this.paginationConfig.totalItems = changes['totalCount'].currentValue.pageCount * this.tableSize;
      this.paginationConfig.currentPage = changes['totalCount'].currentValue.currentPage;
      this.paginationConfig.itemsPerPage = this.tableSize;
      this.page = changes['totalCount'].currentValue.currentPage;
      this.count = changes['totalCount'].currentValue.pageCount * this.tableSize;
    }
    this.cdref.detectChanges();
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
      search_key: this.term,
      page: this.page,
      tableSize: this.tableSize
    }
    this.buttonClick.emit(tableData)
  }
  onTableSizeChange(event: any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    const calculatedPageNo = this.count / this.tableSize
    if (calculatedPageNo < this.page) {
      this.page = 1
    }
    let tableData = {
      search_key: this.term,
      page: this.page,
      tableSize: this.tableSize
    }
    this.buttonClick.emit(tableData)
  }
  open(content, status) {
    const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
    const confirmText = status === 'APPROVED' ? 'Approve' : 'Decline'
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `Are you sure you want to ${selectedStatus}`;
      modelRef.componentInstance.message = `${confirmText}`;
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
    let currMethod = status === 'DECLINED' ? 'REJECT' : 'ACCEPT'
    let data = {
      user_id: this.user_id,
      update: "TRUE",
      approved_by_manager_id: this.user_id,
      module: "TIMESHEET",
      menu: "MONTH_APPROVAL_TIMESHEET",
      method: currMethod,
      time_sheet_id_list: [],
      time_sheet_id: content,
      approved_state: status
    }
    this._timesheet.updateStatus(data).subscribe(res => {
      this.buttonClick.emit(this.page)
      if (res) {
        this.api.showSuccess(`${status} updated successfully`)
        this.buttonClick.emit(this.page)
      }

    })
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
