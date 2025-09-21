import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  all_employees_under_manager: any = [];
  selectedItems: any = [];
  dropdownSettings: any = {};


  BreadCrumbsTitle: any = 'Dashboard';
  accessPermissions = [];
  user_id: any;
  userRole: any;
  upcoming_holidays: any;
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  filterQuery:any;
  upcomingPendingLeaves:any =[]
  constructor(private common_service: CommonServiceService, private accessControlService: SubModuleService,
    private apiService: ApiserviceService,) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getEmployeeLeaves();
    this.getUpcomingHoliday();
    this.getPendingLeaves();
  }

  all_leaves: any;

  getEmployeeLeaves() {
    console.log(this.selectedItemsMap['employee'])
    let user_id:any
    if(this.selectedItemsMap['employee'].length>0){
      user_id = this.selectedItemsMap['employee'][0].user_id
    }
    else{
      user_id = this.user_id
    }
    this.apiService.getData(`${environment.live_url}/${environment.employees_leave}/?employee=${user_id}`).subscribe(
      (res: any) => {
        this.all_leaves = res.results
      },
      (err) => {

      }
    )
  }
   public onEmployeeChange(event: any) {
    this.updateSelectedItems('employee', event.value);
    this.getEmployeeLeaves();
  }

  // clearEmployeeSelection(){
  //   this.selectedItemsMap['employee'] = [];
  //   this.getEmployeeLeaves();
  //   console.log(this.selectedItemsMap)
  // }
 

  getUpcomingHoliday() {
    this.apiService.getData(`${environment.live_url}/${environment.holiday_calendar}/?is-upcoming=True`).subscribe(
      (res: any) => {
        this.upcoming_holidays = res
      }
    )
  }

  getPendingLeaves(){
    this.filterQuery = this.getFilterBaseUrl()
    this.filterQuery += `&status_values=[pending]`
    this.apiService.getData(`${environment.live_url}/${environment.apply_leaves}/${this.filterQuery}`).subscribe(
      (res: any) => {
        console.log(res.results);
        this.upcomingPendingLeaves = res.results
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

  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        // this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  pageSizeDropdown = 50;

  dropdownState = {
    employee: {
      page: 1,
      list: [],
      search: '',
      totalPages: 1,
      loading: false,
      initialized: false
    }
  };

  dropdownEndpoints = {
    employee: environment.user,
  };

  private scrollListeners: { [key: string]: (event: Event) => void } = {};

  // Selected items for pagination dropdowns
  selectedItemsMap: { [key: string]: any[] } = {
    employee: [],
  };


  removeScrollListener(key: string) {
    const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
    if (panel && this.scrollListeners[key]) {
      panel.removeEventListener('scroll', this.scrollListeners[key]);
      delete this.scrollListeners[key];
    }
  }

  onScroll(key: string, event: Event) {
    const target = event.target as HTMLElement;
    const state = this.dropdownState[key];
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 5;
    if (atBottom && !state.loading && state.page < state.totalPages) {
      state.page++;
      this.fetchData(key, true);
    }
  }

  // Search input for pagination
  onSearch(key: string, text: string) {
    const state = this.dropdownState[key];
    state.search = text.trim();
    state.page = 1;
    state.list = [];
    this.fetchData(key, false);
  }

  // Clear search input
  clearSearchDropD(key: string) {
    this.dropdownState[key].search = '';
    this.dropdownState[key].page = 1;
    this.dropdownState[key].list = [];
    this.fetchData(key, false);
  }

  // Fetch data from API with pagination and search
  fetchData(key: string, append = false) {
    const state = this.dropdownState[key];
    state.loading = true;

    let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
    if (state.search) {
      query += `&search=${encodeURIComponent(state.search)}`;
    }
    if (key === 'employee') {
      query += `&is_active=True&employee=True`;
      if (this.userRole === 'Manager') {
        query += `&reporting_manager_id=${this.user_id}`;
      }
    }


    this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
      .subscribe((res: any) => {
        state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
        const selectedItems = this.selectedItemsMap[key] || [];
        const selectedIds = selectedItems.map(item => item.user_id);
        const filteredResults = res.results.filter(
          (item: any) => !selectedIds.includes(item.user_id)
        );
        if (append) {
          state.list = [...state.list, ...filteredResults];
        } else {
          state.list = [...selectedItems, ...filteredResults];
        }
        state.loading = false;
      }, () => {
        state.loading = false;
      });
  }

  // Update selectedItemsMap with full objects to keep selected at top & no duplicates
  updateSelectedItems(key: string, selectedIds: any[]) {
    if (!Array.isArray(selectedIds)) {
      selectedIds = selectedIds != null ? [selectedIds] : [];
    }
    const state = this.dropdownState[key];
    let selectedItems = this.selectedItemsMap[key] || [];
    // removing the unselected datas
    selectedItems = selectedItems.filter(item => selectedIds.includes(item.user_id));
    selectedIds.forEach(id => {
      if (!selectedItems.some(item => item.user_id === id)) {
        const found = state.list.find(item => item.user_id === id);
        if (found) {
          selectedItems.push(found);
        } else {
          // if we want then fetch item from API if not found 
        }
      }
    });

    this.selectedItemsMap[key] = selectedItems;
  }

  // Return options with selected items on top, no duplicates
  getOptionsWithSelectedOnTop(key: string) {
    const state = this.dropdownState[key];
    const selectedItems = this.selectedItemsMap[key] || [];
    const unselectedItems = state.list.filter(item =>
      !selectedItems.some(sel => sel.user_id === item.user_id)
    );
    return [...selectedItems, ...unselectedItems];
  }


  // Called when the dropdown opens or closes
  onDropdownOpened(isOpen, key: string) {
    if (isOpen) {
      if (!this.dropdownState[key].initialized || this.dropdownState[key].list.length === 0) {
        this.dropdownState[key].page = 1;
        this.fetchData(key, false);
        this.dropdownState[key].initialized = true;
      }
      setTimeout(() => {
        this.removeScrollListener(key);

        const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
        if (panel) {
          this.scrollListeners[key] = (event: Event) => this.onScroll(key, event);
          panel.addEventListener('scroll', this.scrollListeners[key]);
        }
      }, 0);
    } else {
      this.removeScrollListener(key);
    }
  }


  commonOnchangeFun(event, key) {
    this.updateSelectedItems(key, event.value);
  }

}
