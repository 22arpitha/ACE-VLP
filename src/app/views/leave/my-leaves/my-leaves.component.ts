import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service'
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { MatDialog } from '@angular/material/dialog';
import {CancelLeaveRequestComponent} from '../cancel-leave-request/cancel-leave-request.component'

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {

  userRole: any = "";
  user_id: any;

  constructor(private apiService: ApiserviceService, private modalService: NgbModal,private datePipe: DatePipe,
    private router: Router,private dialog: MatDialog,
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
     leave_type_id: false,
     from_date:false,
     number_of_leaves_applying_for: false,
     created_datetime: false,
     status: false,
    to_date: false,
    employee_id: false,
    rejected_reason: false,
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
  selectedItemData:any;
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
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getMyLeaves();
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

  private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map(x => x.id).join(',');
  }

  getMyLeaves() {
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.leave_type.length) {
      this.filterQuery += `&leave_type_ids=[${this.ids(this.filters.leave_type)}]`
    }
    if (this.filters.status_name.length) {
      this.filterQuery += `&status_values=[${this.ids(this.filters.status_name)}]`;
    }
    if(this.mainStartDate && this.mainEndDate){
      let start_date = this.datePipe.transform(this.mainStartDate, 'yyyy-MM-dd');
      let end_date = this.datePipe.transform(this.mainEndDate, 'yyyy-MM-dd');
      this.filterQuery +=`&leave-start-date=${start_date}&leave-end-date=${end_date}`;
    }
     if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.my_leaves}/${this.filterQuery}`).subscribe(
      (res: any) => {
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

  selectedItem(item:any){
    this.selectedItemData = item;
  }
   editItem(item:any){
     this.router.navigate([`/leave/leave-application/${item?.id}`])
    // try {
    //       const modalRef = await this.modalService.open(GenericEditComponent, {
    //         size: 'sm',
    //         backdrop: 'static',
    //         centered: true
    //       });
    //       modalRef.componentInstance.status.subscribe((resp:any) => {
    //         if (resp === 'ok') {
    //           modalRef.dismiss();
    //           this.router.navigate([`/leave/leave-application/${item?.id}`])
    //         } else {
    //           modalRef.dismiss();
    //         }
    //       });
    //     } catch (error) {
    //       console.error('Error opening modal:', error);
    //     }
  }
  revoke(data:any) {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
            size: <any>'sm',
            backdrop: true,
            centered: true
          });
          modelRef.componentInstance.status.subscribe((resp:any) => {
            if (resp == "ok") {
              this.revokeContent(data?.id);
              modelRef.close();
            }
            else {
              modelRef.close();
            }
          })
  }

  revokeContent(id:any) {
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

  cancelRequest(data:any){
    const dialogRef= this.dialog.open(CancelLeaveRequestComponent, {
          data: data,
          // panelClass: 'custom-details-dialog',
          panelClass: 'cancel-leave-details-dialog',
          disableClose: true,
        });
       
        dialogRef.afterClosed().subscribe((resp: any) => {
          if(resp?.data==='refresh'){
            this.getMyLeaves()
          }
          // console.log('resp',resp);
          //  this.initalCall();
        });
  }

  reset(){
    this.page = 1;
    this.tableSize = 50;
    this.mainStartDate = '';
    this.mainEndDate = '';
    this.filters = {leave_type: [],employees: [],status_name: []};
    this.getMyLeaves();
  }
}
