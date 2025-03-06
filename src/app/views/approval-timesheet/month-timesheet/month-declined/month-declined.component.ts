import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-month-declined',
  templateUrl: './month-declined.component.html',
  styleUrls: ['./month-declined.component.scss']
})
export class MonthDeclinedComponent implements OnInit {
  @Output() buttonClick = new EventEmitter<any>();
  @Output() filter: any = new EventEmitter<any>();

  slno: any;
  date: any;
  people: any;
  timesheet: any;
  time: any;
  savedon: any;
  rejectedon: any;
  rejectedby: any;
  status: any;
  action: any;
  term: any = '';

  declinedAll: any = [];
  params: { status: string; user_id: any; page_number: any; data_per_page: number; timesheets_to_date: string; timesheets_from_date: string; };
  //userId: any = 1;
  page: any = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  declinedCount = 0;
  user_id: any;
  accessConfig: any = [];
  org_id: string;
  @Input() data: any
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  }
  constructor(private _timesheet: TimesheetService,
    private modalService: NgbModal,
    private api: ApiserviceService, private cdref: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.user_id = sessionStorage.getItem('user_id')
    this.org_id = sessionStorage.getItem('organization_id')
  }

  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.declinedAll = changes['data'].currentValue;
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
  

  filterSearch() {
    let tableData = {
      search_key: this.term,
      page: this.page,
      page_size: this.tableSize
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

  open(content, status) {
    const selectedStatus = status === 'APPROVED' ? 'approve' : 'decline'
    const confirmText = status === 'APPROVED' ? 'Approve' : 'Decline'
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'md',
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
    let currMethod = status === 'DECLINED' ? 'REJECT' : 'ACCEPT'
    let manager_id = sessionStorage.getItem('manager_id')
    let data = {
      time_sheet_ids: null,
      time_sheet_id: content,
      status_name: status,
      reporting_manager_ref: manager_id,
      module: "TIMESHEET",
      menu: "MONTH_APPROVAL_TIMESHEET",
      method: currMethod,
      user_id: this.user_id
    }
    this._timesheet.updateStatus(data).subscribe(res => {
      this.buttonClick.emit(this.page)
      if (res) {
        this.api.showSuccess(`${status} updated successfully`)
      }

    })
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
