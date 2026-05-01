import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericRemoveComponent } from '../../../generic-components/generic-remove/generic-remove.component';
import { DatePipe } from '@angular/common';
import { FilterQueryService } from '../../../service/filter-query.service';
@Component({
  selector: 'app-user-comp-off-list',
  templateUrl: './user-comp-off-list.component.html',
  styleUrls: ['./user-comp-off-list.component.scss'],
})
export class UserCompOffListComponent implements OnInit {
  userRole: any = '';
  user_id: any;

  constructor(
    private apiService: ApiserviceService,
    private modalService: NgbModal,
    private datePipe: DatePipe,
      private filterQueryService: FilterQueryService,
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
  }

  myLeavesList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    from_date: false,
    number_of_leaves_applying_for: false,
    created_datetime: false,
    status: false,
    message: false,
    rejected_reason: false,
  };
  filterQuery!: string;
  leaveOptions: any = [];
  leaveStatus: any = [];
  mainStartDate: any;
  mainEndDate: any;
   filters: any = {
    leave_type: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    status_name: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  }
  ngOnInit(): void {
    this.getLeaveStatus();
    this.getallLeaveTypes();
    this.getCompoffMyLeaves();
  }

  getLeaveStatus() {
    this.apiService
      .getData(`${environment.live_url}/${environment.leave_status}/`)
      .subscribe(
        (res: any) => {
          this.leaveStatus = res?.data
            // ?.filter((item: any) => item.value !== 'Pending')
            .map((item: any) => ({
              id: item.key,
              name: item.value,
            }));
        },
        (error) => {
          console.log(error);
        },
      );
  }
  getallLeaveTypes() {
    this.apiService
      .getData(`${environment.live_url}/${environment.settings_leave_type}/`)
      .subscribe(
        (respData: any) => {
          this.leaveOptions = respData?.map((item: any) => ({
            id: item.id,
            name: item.leave_type_name,
          }));
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        },
      );
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  mainDateChange(event: any) {
    // const selectedDate = event.value;
    // const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getCompoffMyLeaves();
  }
  mainEndDateChange(event: any) {
    if (event.value) {
      this.getCompoffMyLeaves();
    }
  }
  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.getCompoffMyLeaves();
  }
  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getCompoffMyLeaves();
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getCompoffMyLeaves();
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map((x) => x.id).join(',');
  }
    private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'leave_type': 'leave-type', //leave_type_ids
    };
    return mapping[filterType] || filterType;
  }

  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }


  getCompoffMyLeaves() {
    this.filterQuery = this.getFilterBaseUrl();
    if(this.filters.status_name?.selectAllValue==true){
      this.filterQuery += `&status_values=[${this.leaveStatus.map((status: any) => `${status.id}`).join(',')}]`
    } else if(this.filters.status_name?.selectAllValue==false){
      const excludedIds = this.filters.status_name?.excludedIds?.map((e:any) => e.id) || [];
      let temp = this.leaveStatus.filter(
          (status: any) => !excludedIds.includes(status.id)).map((status:any)=>status.id)
      console.log(temp)
      this.filterQuery += `&status_values=[${temp}]`;
    } else if(this.filters.status_name?.selectAllValue==null && this.filters.status_name?.selectedOptions.length>0){
      this.filterQuery += `&status_values=[${this.filters.status_name?.selectedOptions.map((option: any) => option.id).join(',')}]`;
    }
    // if (this.filters.status_name.length === 0) {
    //   this.filterQuery += `&status_values=[Approved,Rejected]`;
    // }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    if (this.mainStartDate && this.mainEndDate) {
      let start_date = this.datePipe.transform(
        this.mainStartDate,
        'yyyy-MM-dd',
      );
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery += `&leave-start-date=${start_date}&leave-end-date=${end_date}`;
    }
    this.apiService
      .getData(
        `${environment.live_url}/${environment.comp_off_list}/${this.filterQuery}`,
      )
      .subscribe((res: any) => {
        console.log(res.results);
        this.myLeavesList = res.results;
        const noOfPages: number = res?.['total_pages'];
        this.count = noOfPages * this.tableSize;
        this.page = res?.['current_page'];
      });
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const employeeParam = `&leave_employee_id=${this.user_id}`;
    // const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';

    return `${base}${employeeParam}`;
  }

  revoke(data:any) {
    console.log(data);
    const modelRef = this.modalService.open(GenericRemoveComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = `Are you sure you want to revoke`;
    modelRef.componentInstance.message = `Revoke`;
    modelRef.componentInstance.status.subscribe((resp:any) => {
      if (resp == 'ok') {
        this.revokeContent(data?.id);
        modelRef.close();
      } else {
        modelRef.close();
      }
    });
  }

  revokeContent(id:any) {
    console.log(id);
    let data = {
      leave_applied_id: id,
    };
    this.apiService
      .updateData(
        `${environment.live_url}/${environment.revoke_my_leave}/`,
        data,
      )
      .subscribe(
        (res: any) => {
          console.log(res);
          this.apiService.showSuccess(res.message);
          this.getCompoffMyLeaves();
        },
        (error: any) => {},
      );
  }

  reset() {
    this.page = 1;
    this.tableSize = 50;
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.filters = { leave_type: [], employees: [], status_name: [] };
    this.getCompoffMyLeaves();
  }
}
