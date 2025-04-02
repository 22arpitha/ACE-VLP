import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { TimesheetService } from 'src/app/service/timesheet.service';

@Component({
  selector: 'app-month-approve',
  templateUrl: './month-approve.component.html',
  styleUrls: ['./month-approve.component.scss']
})
export class MonthApproveComponent implements OnInit {
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
  approvedAll: any = [];
  userId: any = 1;
  page: any = 1;
  approveCount = 0;
  tableSize = 5;
  tableSizes = [5,10, 25, 50, 100];
  count = 0;
  accessConfig: any = [];
  user_id: any;
  noOfPages: any;
  org_id: any;
  userRole: String;
  accessPermissions = []

  @Input() data: any
  @Input() totalCount: { 'pageCount': any, 'currentPage': any };
  paginationConfig: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  }
  constructor( private cdref: ChangeDetectorRef, private accessControlService: SubModuleService) {}
  ngOnInit() {
    this.user_id = sessionStorage.getItem('user_id')
    this.org_id = sessionStorage.getItem('organization_id')
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
  }


  ngOnChanges(changes: SimpleChange): void {
    if (changes['data'].currentValue) {
      this.approvedAll = changes['data'].currentValue;
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

  

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
