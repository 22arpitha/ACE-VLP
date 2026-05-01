import { Component, OnInit } from '@angular/core';
import { AddCustomizeBalanceComponent } from '../add-customize-balance/add-customize-balance.component';
import { SubModuleService } from '../../../service/sub-module.service';
import { MatDialog } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { environment } from '../../../../environments/environment';
import { FilterQueryService } from '../../../service/filter-query.service';
export interface IdNamePair {
  id: any;
  name: string;
}
export interface FilterState {
  selectAllValue: boolean | null;
  selectedOptions: IdNamePair[];
  excludedIds: IdNamePair[];
  selectedCount: number;
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
  filters: any = {
    employees: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  };
  constructor(private accessControlService: SubModuleService,
    private dialog: MatDialog, private dropdownService: DropDownPaginationService,
    private apiService: ApiserviceService, private filterQueryService: FilterQueryService) { }

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
    this.getEmployeesBalance();
  }


  public clearSearch(key: any, i?: any) {
    if (key === 'leave_type') {
      this.searchLeave = '';
    }
  }

  selectAll = false;

  onFilterChange(event: any, filterType: string) {
    this.filters[filterType] = event;
    this.page = 1;
    this.getEmployeesBalance();
  }

  private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'employees': 'customize-employee', // old employee-ids
    };
    return mapping[filterType] || filterType;
  }

  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }

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
    this.filterQuery += this.buildFilterQuery('employees');
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.all_emp_custom_balance}/${this.filterQuery}`)
      .subscribe((res: any) => {
        this.AllEmployeeBalanceList = res.results;
        this.leaveTypes = Array.from(
        new Set(
          this.AllEmployeeBalanceList.flatMap((emp: any) =>
            emp.leave.map((l: any) => l.name)
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
  return leave ? leave.closing_balance_leaves : 0;
}

  customize(data: string) {
    sessionStorage.setItem('access-name', this.access_name?.name)
   const dialogRef = this.dialog.open(AddCustomizeBalanceComponent, {
      data: { edit: true, item:data },
      panelClass: 'customize-balance-dialog',
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
