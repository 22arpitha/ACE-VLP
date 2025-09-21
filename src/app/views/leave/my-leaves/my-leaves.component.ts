import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { GenericRemoveComponent } from 'src/app/generic-components/generic-remove/generic-remove.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {

  userRole: any = "";
  user_id: any;

  constructor(private apiService: ApiserviceService, private modalService: NgbModal,private datePipe: DatePipe,) {
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
    employee_name: false,
  };
  filterQuery: string;
  leaveOptions: any = [];
   leaveStatus: any = [];
   mainStartDate: any;
  mainEndDate: any;
  filters: { leave_type: string[], employees: string[], status_name: string[] } = {
    leave_type: [],
    employees: [],
    status_name: [],
  }
  ngOnInit(): void {
    this.getLeaveStatus();
    this.getallLeaveTypes();
    this.getMyLeaves();
  }

  getLeaveStatus() {
    this.apiService.getData(`${environment.live_url}/${environment.leave_status}/`).subscribe(
      (res: any) => {
        this.leaveStatus = res?.data?.map((item: any) => ({
          id: item.key,
          name: item.value
        }));
      },
      (error) => {
        console.log(error)
      }
    )
  }
   getallLeaveTypes() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/`).subscribe((respData: any) => {
      this.leaveOptions = respData?.map((item: any) => ({
        id: item.id,
        name: item.leave_type_name
      }));
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };

  mainDateChange(event: any) {
    // const selectedDate = event.value;
    // const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }
  mainEndDateChange(event: any) {
    if (event.value) {
      this.getMyLeaves();
    }
  }
  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
     this.getMyLeaves();
  }
  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getMyLeaves()
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getMyLeaves();
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  getMyLeaves() {
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.leave_type.length) {
      this.filterQuery += `&leave_type_ids=[${this.filters.leave_type.join(',')}]`
    }
    if (this.filters.status_name.length) {
      this.filterQuery += `&status_values=[${this.filters.status_name.join(',')}]`;
    }
    if(this.mainStartDate && this.mainEndDate){
      let start_date = this.datePipe.transform(this.mainStartDate, 'yyyy-MM-dd');
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery +=`&leave-start-date=${start_date}&leave-end-date=${end_date}`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.apply_leaves}/${this.filterQuery}`).subscribe(
      (res: any) => {
        console.log(res.results);
        this.myLeavesList = res.results
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.page = res?.['current_page'];
      }
    )
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const employeeParam = `&leave_employee_id=${this.user_id}`;
    // const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';

    return `${base}${employeeParam}`;
  }

  revoke(data) {
    console.log(data)
    const modelRef = this.modalService.open(GenericRemoveComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true
    });
    modelRef.componentInstance.title = `Are you sure you want to revoke`;
    modelRef.componentInstance.message = `Revoke`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        this.revokeContent(data?.id);
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }

  revokeContent(id) {
    console.log(id)
    let data = {
      leave_applied_id: id
    }
    this.apiService.updateData(`${environment.live_url}/${environment.revoke_my_leave}/`, data).subscribe(
      (res: any) => {
        console.log(res);
        this.apiService.showSuccess(res.message);
        this.getMyLeaves()
      },
      (error: any) => {

      }
    )
  }
}
