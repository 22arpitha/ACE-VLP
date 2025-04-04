import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-declined',
  templateUrl: './declined.component.html',
  styleUrls: ['./declined.component.scss']
})
export class DeclinedComponent implements OnInit {
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
  page: any = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  declinedAll: any = [];
  list: string;
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
  constructor(private api: ApiserviceService, private _timeSheetService: TimesheetService,
    private modalService: NgbModal, private cdref: ChangeDetectorRef,
    private common_service: CommonServiceService) { }

  ngOnInit(): void {
    this.entryPoint = JSON.parse(sessionStorage.getItem('entryPoint'))
    this.user_id = sessionStorage.getItem('user_id');
    this.orgId = sessionStorage.getItem('organization_id');
  }
  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.declinedAll = changes['data'].currentValue;
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
    this.buttonClick.emit(tableData)
  }
  }
 
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
