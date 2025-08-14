import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnChanges {
  user_role_name: any;
  user_id: any;
  allEmployeeList: any = [];
  searchEmployeeText: any;
  selectedEmployeeVal: any;
  @Input() resetFilterField: boolean = false;
  @Output() selectEmployee: EventEmitter<any> = new EventEmitter<any>();
  constructor(private apiService: ApiserviceService) {
    this.user_role_name = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetFilterField'] && changes['resetFilterField'].currentValue ===true) {
      this.resetFilterField = changes['resetFilterField'].currentValue
      if (this.user_role_name === 'Accountant') {
        this.selectedEmployeeVal = this.allEmployeeList[0]?.user_id;
        this.selectEmployee.emit(this.allEmployeeList[0]?.user_id);
      } else {
        this.selectedEmployeeVal = null;
        this.searchEmployeeText='';
        this.selectEmployee.emit(null);
      }
      this.selectedItemsMap['employee'] = [];
      this.clearSearchDropD('employee');
    }
  }

  ngOnInit(): void {
    // this.getAllEmployeeList();
    if(this.user_role_name==='Accountant'){
      this.onDropdownOpened(true,'employee')
    } else if(this.user_role_name==='Manager'){
      this.getManagerData()
    }
  }

  // public getAllEmployeeList() {
  //   this.allEmployeeList = [];
  //   let queryparams = `?is_active=True&employee=True`;
  //   if (this.user_role_name === 'Accountant') {
  //     queryparams += `&employee_id=${this.user_id}`;
  //   } else if (this.user_role_name === 'Manager') {
  //     queryparams += `&reporting_manager_id=${this.user_id}`;
  //   }
  //   this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
  //     this.allEmployeeList = respData;
  //     this.allEmployeeList.push(...this.managerData);
  //     if (this.user_role_name === 'Accountant') {
  //       this.selectedEmployeeVal = this.allEmployeeList[0].user_id;
  //       this.selectEmployee.emit(this.allEmployeeList[0].user_id);
        
  //     }
  //     if (this.user_role_name === 'Manager') {
  //       this.getManagerData()
  //     }
  //   }, (error => {
  //     this.apiService.showError(error?.error?.detail)
  //   }));
  // }

  managerData: any = []
  getManagerData() :void{
    let queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`;
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.managerData = respData;
      // this.allEmployeeList.push(...this.managerData); // uncomment only if you are not using pagination for the emp dropdown
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }
  filteredEmployeeList() {
    if (!this.searchEmployeeText) {
      return this.allEmployeeList;
    }
    return this.allEmployeeList.filter((emp: any) =>
      emp?.user__full_name?.toLowerCase()?.includes(this.searchEmployeeText?.toLowerCase())
    );
  }

  public clearSearch() {
    this.searchEmployeeText = '';
  }

  public onSelectedEmployee(event: any) {
    this.selectedEmployeeVal = event.value;
    this.selectEmployee.emit(event.value);
    this.updateSelectedItems('employee',event.value)
  }

  // new code

  pageSizeDropdown = 10;

dropdownState = {
    employee: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  },
};

dropdownEndpoints = {
  employee: environment.employee,
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

// Scroll handler for infinite scroll
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
  state.search = text
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
 if(key==='employee'){
  query += `&is_active=True&employee=True`
   if (this.user_role_name === 'Accountant') {
      query += `&employee_id=${this.user_id}`;
    } else if (this.user_role_name === 'Manager') {
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
      if(this.user_role_name ==='Accountant'){
         this.selectedEmployeeVal = res.results[0].user_id;
        this.selectEmployee.emit(res.results[0].user_id);
      } else if (this.user_role_name === 'Manager' && this.managerData?.length) {
          let newManagerItems = this.managerData;
          if (state.search) {
            const searchLower = state.search.toLowerCase();
            newManagerItems = newManagerItems.filter(
              mgr =>
                mgr.user__full_name?.toLowerCase().includes(searchLower)
            );
          }
          newManagerItems = newManagerItems.filter(
            mgr => !state.list.some(item => item.user_id === mgr.user_id)
          );
          if (newManagerItems.length) {
            state.list = [...state.list, ...newManagerItems];
          }
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

  // Add new selected items from currently loaded list if missing
  selectedIds.forEach(user_id => {
    if (!selectedItems.some(item => item.user_id === user_id)) {
      const found = state.list.find(item => item.user_id === user_id);
      if (found) {
        selectedItems.push(found);
      } else {
        // if we want then fetch item from API if not found 
      }
    }
  });
  this.selectedItemsMap[key] = selectedItems;
}

getOptionsWithSelectedOnTop(key: string) {
  const state = this.dropdownState[key];
  const selectedItems = this.selectedItemsMap[key] || [];
  const unselectedItems = state.list.filter(item =>
    !selectedItems.some(sel => sel.user_id === item.user_id)
  );

  return [...selectedItems, ...unselectedItems];
}

onDropdownOpened(isOpen, key: string) {
  if (isOpen) {
    // ⬇⬇ ADD THIS BLOCK ⬇⬇
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

commonOnchangeFun(event, key){
  this.updateSelectedItems(key, event.value);
}

patchDropdownValuesForEdit(data: any) {
  const setDropdownValue = (key: string, idKey: string, nameKey: string) => {
    const idVal = data?.[idKey];
    const nameVal = data?.[nameKey];
    if (idVal != null) {
      const obj: any = { id: idVal, [nameKey]: nameVal ?? '' };
      this.selectedItemsMap[key] = [obj];
      // this.timesheetFormGroup.get(key)?.patchValue(idVal);
      if (!this.dropdownState[key]) {
        this.dropdownState[key] = {
          page: 1,
          list: [],
          search: '',
          totalPages: 1,
          loading: false,
          initialized: false
        };
      }
      this.dropdownState[key].list = this.dropdownState[key].list.filter(
        (it: any) => it?.id !== idVal
      );
      this.dropdownState[key].list.unshift(obj);
    }
  };
  setDropdownValue('employee', 'employee', 'user__full_name');
}


}
