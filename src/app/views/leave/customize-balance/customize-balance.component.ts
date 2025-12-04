import { Component, OnInit } from '@angular/core';
import { AddCustomizeBalanceComponent } from '../add-customize-balance/add-customize-balance.component';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { DropDownPaginationService } from 'src/app/service/drop-down-pagination.service';
import { environment } from 'src/environments/environment';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-customize-balance',
  templateUrl: './customize-balance.component.html',
  styleUrls: ['./customize-balance.component.scss']
})
export class CustomizeBalanceComponent implements OnInit {

  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    employee_name: false,
    leave_type: false,
    type: false,
    leave_period: false,
    date_of_request: false,
    days_or_hours_taken: false,
  };
  searchLeave: any;
  accessPermissions = [];
  user_id: any;
  userRole: any;
  filterQuery: any
  AllEmployeeBalanceList:any =[];
  leaveTypes:any = [];
  filters: { employees: IdNamePair[] } = {
    employees: [],
  };
  constructor(private accessControlService: SubModuleService,
    private dialog: MatDialog, private dropdownService: DropDownPaginationService,
    private apiService: ApiserviceService,) { }

  ngOnInit(): void {
    this.getEmployeesBalance();
  }

  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }


  public clearSearch(key: any, i?: any) {
    if (key === 'leave_type') {
      this.searchLeave = '';
    }
  }

  selectAll = false;

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getEmployeesBalance()
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    this.getEmployeesBalance();
  }

   private ids(filterArray: any[]): string {
    if (!Array.isArray(filterArray)) return '';
    return filterArray.map(x => x.id).join(',');
  }
  getEmployeesBalance() {
     this.count = 0;
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.employees.length) {
      this.filterQuery += `&employee-ids=[${this.ids(this.filters.employees)}]`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.all_emp_custom_balance}/${this.filterQuery}`)
      .subscribe((res: any) => {
        this.AllEmployeeBalanceList = res.results;
        this.leaveTypes = Array.from(
        new Set(
          this.AllEmployeeBalanceList.flatMap(emp =>
            emp.leave.map(l => l.name)
          )
        )
      );
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      },
      (error:any)=>{
        console.log(error)
      }
    );
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    return `${base}`;
  }

  getLeaveBalance(emp: any, leaveName: string): number {
  const leave = emp.leave.find((l: any) => l.name === leaveName);
  return leave ? leave.available : 0;
}

  customize(data) {
    sessionStorage.setItem('access-name', this.access_name?.name)
   const dialogRef = this.dialog.open(AddCustomizeBalanceComponent, {
      data: { edit: true, item:data },
      panelClass: 'custom-details-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      if(resp.data==='refresh'){
        this.getEmployeesBalance();
      }
    });
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
  fetchEmployees = (page: number, search: string) => {
    const extraParams = {
      is_active: 'True',
      employee: 'True',
    };
    return this.dropdownService.fetchDropdownData$(
      environment.employee,
      page,
      search,
      (item) => ({ id: item.user_id, name: item.user__full_name }),
      extraParams
    );
  };

}
