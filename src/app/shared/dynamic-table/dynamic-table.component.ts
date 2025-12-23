// dynamic-table.component.ts
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren, ViewContainerRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { DynamicTableConfig } from './dynamic-table-config.model';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { fileToBase64, urlToFile } from '../fileUtils.utils';
import { OverlayRef } from '@angular/cdk/overlay';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { WeeklySelectionStrategy } from '../weekly-selection-strategy';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  providers: [NgbDropdownConfig]

})
export class DynamicTableComponent implements OnInit, OnChanges {
@Output() filterOpened = new EventEmitter<any>(); // new
@Output() filterScrolled = new EventEmitter<any>(); //new
@Output() filterEvent = new EventEmitter<{ detail: any, key: string }>();
nextPage: { [key: string]: number } = {}; //new
@Output() filterSearched = new EventEmitter<any>(); //new
searchSubjects: { [key: string]: Subject<string> } = {}; // new
selectedItemsMap: { [key: string]: any[] } = {};  //new

  @Input() config!: DynamicTableConfig;
  overlayRef: OverlayRef | null = null;
  filterTriggers: { [key: string]: MatMenuTrigger } = {};
  activeFilterColumn: string | null = null;
  @Output() actionEvent = new EventEmitter<any>();
  @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;
  paginationId = 'pagination-' + Math.random();
  filteredData: any[] = [];
  paginatedData: any[] = [];
  startDate;
  endDate;
  mainStartDate:any;
  mainEndDate:any;
  currentPage = 1;
  tableSizes = [50,75,100,150,200];
  columnFilters: { [key: string]: any } = {};
  arrowState: { [sortKey: string]: boolean } = {};
  sortValue: string = '';
  directionValue: string;
  filterSearchText: { [key: string]: string } = {};
  tableSize: number = 50;
  activeDateColumn: string | null = null;
  dateFilterValue: any = null;
  paginationConfig: any = {
    itemsPerPage: 50,
    currentPage: 1,
    totalItems: 0
  }
  isCurrent:boolean=true;
  isHistory:boolean=false;
  selected_client_id:any=null;
  user_id:any;
  userRole:any;
  allow_sending_status:boolean=false;
  previousFilters: { [key: string]: any[] } = {};
  selectedDateRange;
  mainDateRange:any
  selectedLeaveType:any;
  leaveTypes:any =[];
  tableFormGroup:FormGroup;
  isEditBtn:boolean=false;
  resetWeekDate:boolean=false;
file: any=[];
fileLink: any=[];
selectedFile:(File | null)[] = [];
  filterMenuTemplate: any;
  selectedValue: any;
  selectedKey: string;
  selectedDate: any;
  selectedEmployeeId:any;
  private lastEmittedFilters: { [key: string]: string } = {}; // To store JSON string of last emitted filter value per key
  dateRangeStartDate: string | null;
  is_leaveTypes:boolean;
  is_employeeDropdown:boolean = false;
  constructor(
    private fb:FormBuilder,
    private datePipe: DatePipe,
    private api:ApiserviceService,
    private ngbConfig: NgbDropdownConfig
  ) {
		this.ngbConfig.autoClose = 'outside'; // Changed from false to 'outside'
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }
  tempFilters: { [key: string]: any[] } = {};
  searchSubject = new Subject<string>();
  ngOnInit(): void {
    this.tempFilters = JSON.parse(JSON.stringify(this.columnFilters));
    if(this.is_leaveTypes){
      this.getAllLeaveTypes();
    } 
    this.searchSubject
    .pipe(
      debounceTime(500),
      distinctUntilChanged()
    )
    .subscribe((value) => {
      this.actionEvent.emit({ actionType:'search', detail: value });
      this.applyFilters();
    });
   }

   getEmployeesList(reset:boolean){
    let query = `?page=1&page_size=50&is_active=True&employee=True`;
    if (this.userRole === 'Manager') {
      query += `&reporting_manager_id=${this.user_id}`;
    }
    this.api.getData(`${environment.live_url}/${environment.user}/${query}`).subscribe((respData: any) => {
      this.dropdownState['employee']['list'] = respData.results;
      this.dropdownState['employee']['initialized'] = true;
      this.dropdownState['employee']['loading'] = false;
      this.dropdownState['employee']['totalPages'] = Math.ceil(respData.total_no_of_record / 50);
      this.updateSelectedItems('employee', respData?.results[0].user_id);
      this.selectedEmployeeId = respData?.results[0].user_id;
      this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:reset,user_id:this.selectedEmployeeId}});
    }, (error: any) => {
      this.api.showError(error?.error?.detail);
    })
   }

   getAllLeaveTypes(){
     this.api.getData(`${environment.live_url}/${environment.settings_leave_type}/`).subscribe((respData: any) => {
      this.leaveTypes = respData;
      if (this.leaveTypes?.length > 0 ) {
        // this.selectedLeaveType = this.leaveTypes[0].id;
        // this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false,user_id:this.user_id}});
        this.selectedLeaveType = this.leaveTypes[0].id;
        if(this.is_employeeDropdown && this.is_leaveTypes){
          this.getEmployeesList(false);
        } else{
            this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false,user_id:this.user_id}});
        }
    }
    }, (error: any) => {
      this.api.showError(error?.error?.detail);
    })
   }

   shouldShowLeaveType(config:any): boolean {
    if(config.defaultLeaveTypes && !this.selectedLeaveType){
       this.selectedLeaveType = this.leaveTypes[0].id;
    }
    return !!this.config?.leaveTypes; 
  }
// onSelectionChange(newSelected: any[], col: any): void {
//   const key = col.key;
//   this.tempFilters[key] = newSelected;
//   this.columnFilters[key] = newSelected;
//   // this.onFilterChange(newSelected, col); // Emits to API
//    this.onFilterChange(newSelected, col, true);
//   this.applyFilters(); // Applies locally
// }

  // Add this trackBy function
  trackByColumnKey(index: number, col: any): string {
    return col.sortKey; // Or any unique identifier for the column
  }

   get rows(): FormArray {
    return this.tableFormGroup?.get('rows') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initializeTable();
    this.paginationConfig = {
      totalItems: this.config.totalRecords ?? 0,
      currentPage: this.config.currentPage ?? 1,
      itemsPerPage: this.config.tableSize ?? 50
    };
    this.is_leaveTypes = this.config?.leaveTypes ?? false;
    this.is_employeeDropdown = this.config?.employeeDropdown ?? false;

  }

  
  private initializeTable(): void {
    if(this.config.data && this.config.data?.length > 0){
     this.filteredData = this.config.data;
    }else{
      this.filteredData = [];
    }
    // console.log('Filtered Data:', this.config);
    this.config.columns?.forEach(col => {
      // this.arrowState[col.sortKey] = false;
      if(this.directionValue){
         this.arrowState[this.sortValue] = this.directionValue === 'ascending'? true : false;
      } else{
        this.arrowState[col.sortKey] = false;
      }
      //this.columnFilters[col.key] = col.filterType === 'multi-select' ? [] : '';
    });
    if(this.config.formContent && this.config.data){
      this.isEditBtn=false;
      this.tableFormGroup = this.fb.group({
        rows: this.fb.array([])
      });
      this.buildDynamicTableForm(this.config.data);
    }
    else{
      this.rows?.clear();
    }
    // this.applyFilters();
    this.updatePagination()
  }
  get hasColumnFilters(): boolean {
    return this.config.columns?.some(col => col.filterable);
  }

  onSearch(term: string): void {
    this.actionEvent.emit({ actionType:'search' , detail:term });
    this.applyFilters();
  }

  private suppressNextFilterEvent = false;
onFilterChange(selectedValue: any, columnConfig: any, fromCheckbox: boolean = false) {
  // console.log('onFilterChange triggered', { fromCheckbox, selectedValue });
  const filterKey = columnConfig.key;
  const backendParamKey = columnConfig.paramskeyId || filterKey;
  const currentFilterValueStr = JSON.stringify(selectedValue);
  const lastEmittedValueStr = this.lastEmittedFilters[filterKey];

  if (currentFilterValueStr !== lastEmittedValueStr) {
    this.lastEmittedFilters[filterKey] = currentFilterValueStr;

    if (fromCheckbox) {
      this.suppressNextFilterEvent = true; // stop duplicate
      this.actionEvent.emit({
        actionType: 'filter',
        detail: selectedValue,
        key: backendParamKey,
        fromFilter: true
      });
    } else {
      this.filterEvent.emit({
        detail: { page: 1, pageSize: 20, search: '', reset: true },
        key: backendParamKey
      });
    }
  }

  if (this.config.showIncludeAllJobs) {
    this.isIncludeFlagEnableLogic();
  }
}

    applyFilters(): void {
      this.filteredData = this.config.data?.filter(row => {
        const matchSearch = !this.config.searchTerm || this.config.columns?.some(col =>
          row[col.key]?.toString()?.toLowerCase()?.includes(this.config.searchTerm!?.toLowerCase())
        );
        const matchColumns = Object.keys(this.columnFilters)?.every(key => {
          const filterVal = this.columnFilters[key];
          const cellVal = row[key];

          if (!filterVal || (Array.isArray(filterVal) && filterVal.length === 0)) {
            return true;
          }

          if (Array.isArray(filterVal)) {
            return filterVal?.includes(cellVal);
          }

          const cleanCellVal = cellVal?.toString()?.trim()?.split(' ')[0];
          const cleanFilterVal = filterVal?.toString()?.trim()?.split(' ')[0];
          return cleanCellVal === cleanFilterVal;
        });

        return matchSearch && matchColumns;
      });
      this.updatePagination();
    }

  weekDatePicker(event: any) {
    console.log(event)
    this.selectedDate = event;
    this.actionEvent.emit({ actionType: 'weekDate', detail: this.selectedDate });
    this.resetWeekDate = true;
  }

  sort(direction: string, column: string) {
    // Reset the state of all columns except the one being sorted
    Object.keys(this.arrowState).forEach(sortKey => {
      this.arrowState[sortKey] = false;
    });
    // Update the state of the currently sorted column
    this.arrowState[column] = direction === 'ascending'? true : false;
    this.directionValue = direction;
    this.sortValue = column;
      this.actionEvent.emit({ actionType: 'sorting', detail: {directionValue:this.directionValue,sortValue:this.sortValue}});
  }

  onPageChange(event: number): void {
    this.currentPage = event;
    this.updatePagination();
  }

  private updatePagination(): void {
    // Determine the page size, defaulting to 50 if config.tableSize is not a positive number.
    const pageSize = (this.config?.tableSize && this.config.tableSize > 0) ? this.config.tableSize : 50;

    const start = (this.currentPage - 1) * pageSize;
    // Ensure filteredData is an array.
    const dataToPaginate = Array.isArray(this.filteredData) ? this.filteredData : [];
    this.paginatedData = dataToPaginate.slice(start, start + pageSize);
  }

  onColumnFilterChange(columnKey: string, value: any): void {
    this.columnFilters[columnKey] = value;
    this.applyFilters();
  }

  downloadCSV(): void {
    this.actionEvent.emit({ actionType:'export_csv' , detail:'csv' });
  }

  requestReset(){
    this.selectedLeaveType = '';
    this.config.searchTerm = '';
    this.currentPage = 1;
    this.tableSize = 50;
    this.dateRangeStartDate = '';
    this.selectedDate = '';
    this.resetWeekDate = true;
    this.mainStartDate = '',
    this.mainEndDate = ''
    this.tempFilters = {};
    this.columnFilters = {};
    this.arrowState = {};
    this.sortValue = '';
    this.directionValue = '';
    if(this.is_employeeDropdown && this.is_leaveTypes){
      this.selectedLeaveType = this.leaveTypes[0].id;
        this.getEmployeesList(true);
    } 
    else if(!this.is_employeeDropdown && this.is_leaveTypes){
       this.selectedLeaveType = this.leaveTypes[0].id;
       this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:true,user_id:this.user_id}});
    } else{

      this.actionEvent.emit({ actionType: 'reset', detail: '' });
    }
  }
  downloadPDF(): void {
    this.actionEvent.emit({ actionType:'export_pdf' , detail:'pdf' });
  }

  triggerAction(actionType: string, row: any): void {
    this.actionEvent.emit({ actionType, row });
  }



// getFilteredOptions(colKey: string): { id: any; name: string }[] {
//   const options = this.config.columns.find(c => c.key === colKey)?.filterOptions || [];
//   const search = this.filterSearchText[colKey]?.toLowerCase() || '';
//   return options
//     .filter((option: any) => typeof option === 'string' || (typeof option === 'object' && option.name?.toLowerCase().includes(search)))
//     .map((option: any) => typeof option === 'string' ? { id: null, name: option } : option);
// }
  // getFilteredOptions(colKey: string): { id: any; name: string }[] {
  //   const column = this.config.columns?.find(c => c.key === colKey);
  //   const options = column?.filterOptions || [];
  //   const search = this.filterSearchText[colKey]?.toLowerCase() || '';

  //   const filtered = options
  //     .filter((option: any) => {
  //       const optionName = typeof option === 'string' ? option : option?.name;
  //       return optionName?.toLowerCase().includes(search);
  //     })
  //     .map((option: any) =>
  //       typeof option === 'string' ? { id: option, name: option } : option
  //     );
  //   return filtered;
  // }
// getFilteredOptions(columnKey: string): any[] {
//   const allOptions = this.config.columns.find(col => col.key === columnKey)?.filterOptions || [];
//   const searchText = this.filterSearchText[columnKey]?.toLowerCase() || '';
//   const selectedIds = this.columnFilters[columnKey] || [];

//   const selected = allOptions.filter((opt:any) => selectedIds.includes(opt.id));
//   const searched = allOptions.filter((opt:any) => opt.name?.toLowerCase().includes(searchText));

//   const merged = [...selected, ...searched];
//   const uniqueMap = new Map(merged.map((opt:any) => [opt.id, opt]));
//   return Array.from(uniqueMap.values());
// }

onTableDataChange(event: any) {
  this.actionEvent.emit({ actionType:'tableDataChange' , detail:event });
}
onTableSizeChange(event: any): void {
  this.actionEvent.emit({ actionType:'tableSizeChange' , detail:event.value });
}


setDateFilterColumn(columnKey: string): void {
  this.activeDateColumn = columnKey;
  // Initialize dateFilterValue with the current filter for this column, if any.
  // Use null for the datepicker model if no value is set.
  this.dateFilterValue = this.columnFilters[columnKey] ? new Date(this.columnFilters[columnKey]) : null;
}

// On date selection from calendar
onDateSelected(event: any): void {
  const selectedValue = event.value; // This is a Date object or null

  if (this.activeDateColumn) {
    const formattedDate = selectedValue ? this.datePipe.transform(selectedValue, 'yyyy-MM-dd') : null;

    this.columnFilters[this.activeDateColumn] = formattedDate;
    // Keep dateFilterValue (the ngModel for the picker) in sync.
    // It should already be `selectedValue` due to two-way binding, but explicit set is fine.
    this.dateFilterValue = selectedValue;

    this.actionEvent.emit({ actionType:'dateFilter' , detail:formattedDate, key:this.activeDateColumn });
    // Parent component is expected to handle the data refresh.
  }
}

clearDateFilter(columnKey: string): void {
  this.columnFilters[columnKey] = null; // Clear the stored filter for this specific column
  this.actionEvent.emit({ actionType:'dateFilter' , detail: null, key:columnKey });

  // If the column being cleared is the one currently active in the datepicker, reset dateFilterValue
  if (this.activeDateColumn === columnKey) {
    this.dateFilterValue = null;
  }
  // Parent component is expected to handle the data refresh.
}
clearRangeDateFilter(columnKey: string): void {
  this.startDate = '';
  this.endDate = ''
  this.columnFilters[columnKey] = null; // Clear the stored filter for this specific column
  this.actionEvent.emit({ actionType:'dateRange' , detail: null, key:columnKey });

  // If the column being cleared is the one currently active in the datepicker, reset dateFilterValue
  if (this.activeDateColumn === columnKey) {
    this.dateFilterValue = null;
  }
  // Parent component is expected to handle the data refresh.
}

navigateToEmployee(event,col:any){
  if ('keyId' in event) {
  this.actionEvent.emit({ actionType: 'navigate', row: event, selectedDay:event[col.keyId] });
  }
  else{
  this.actionEvent.emit({ actionType: 'navigate', row: event });
  }
}

// Header Tabs events
public getCurrentDatasetList(){
  this.isHistory = false;
  this.isCurrent = true;
  this.tempFilters = {}
  this.columnFilters = {};
  this.loadingFilters = {};
  this.startDate = '';
  this.endDate= '';
  this.config.columns.forEach(col => {
    col.filterOptions = [];
  });
  this.nextPage = {};
  this.filterSearchText = {};
  this.selectedItemsMap = {};
  this.actionEvent.emit({ actionType: 'headerTabs', action:'True' });
}

public getHistoryDatasetList(){
  this.isCurrent = false;
  this.isHistory = true;
  this.tempFilters = {}
  this.columnFilters = {};
  this.loadingFilters = {};
  this.startDate = '';
  this.endDate= '';
  this.config.columns.forEach(col => {
    col.filterOptions = [];
  });
  this.nextPage = {};
  this.filterSearchText = {};
  this.selectedItemsMap = {};
  this.actionEvent.emit({ actionType: 'headerTabs', action:'False'});
}
// Include All Jobs Checkbox event
public onIncludeJobsChange(event:any){
  const filtersToReset = ['job_name', 'is_primary'];
    filtersToReset.forEach(key => {
    this.selectedItemsMap[key] = [];
    this.columnFilters[key] = [];
    this.tempFilters[key] = [];
    this.loadingFilters[key] = {};
    this.filterSearchText[key] = '';
    this.nextPage[key] = 1;

    // Clear dropdown data
    this.config.columns.forEach(col => {
      if (col.key === key) {
        col.filterOptions = [];
      }
    });
  });
  // this.selectedItemsMap['job_name']=[];
  // this.columnFilters['job_name']=[];
  // this.tempFilters['job_name']=[];
  // this.loadingFilters['job_name'] = {};
  // this.filterSearchText['job_name'] = '';
  // this.nextPage['job_name'] = 1;
  // this.config.columns.forEach(col => {
  //   if (col.key === 'job_name') {
  //     col.filterOptions = [];
  //   }
  // });
  this.actionEvent.emit({ actionType: 'includeAllJobs', action:event.checked,client_id:this.selected_client_id});
}

public sendEmailEvent(){
  this.actionEvent.emit({ actionType: 'sendEmail', action:this.filteredData,client_id:this.selected_client_id});
}
public enableFormFields(){
  this.isEditBtn=true;
  this.rows.controls?.forEach((control) => {
    (control as FormGroup).enable();
  });
}

public async submitWorkCultureDetails(){
  if(this.rows.valid){
    let reqPayload:any={};
    let workCultureData:any = this.rows.getRawValue();
    await this.UpdateFileFieldData(workCultureData).then((updatedData) => {
      reqPayload['data']=updatedData;
    }).catch((error) => {
      reqPayload['data']=[];
    });
this.actionEvent.emit({ actionType: 'submitWorkCulture', action:reqPayload});
  }

}
private isIncludeFlagEnableLogic(): void {
  const clientNameFilter = this.columnFilters['client_name'];
  // Case 1: No client selected — clear everything
  if (!clientNameFilter || clientNameFilter.length === 0) {
    this.allow_sending_status=false;
    this.selected_client_id = null;
    this.config.includeAllJobsEnable = true;
    this.config.includeAllJobsValue = false;
    return;
  }
  // Case 2: Multiple clients selected
  if (clientNameFilter.length > 1) {
    this.allow_sending_status=false;
    this.config.includeAllJobsEnable = true;
    this.config.includeAllJobsValue = false;
    this.selected_client_id = null;
   return;
  }
  // Case 3: Exactly one client selected
  const matchedClient = this.filteredData?.find(
    (obj: any) => obj['client'] == clientNameFilter[0]
  );
  // this.selected_client_id = matchedClient?.client_id ?? null; // commented this line because anyway will get the client id in this clientNameFilter[0]
   this.selected_client_id = clientNameFilter[0] ?? null;
  this.config.includeAllJobsEnable = false;
  if(this.selected_client_id){
    this.allow_sending_status=false;
    this.getClientDetails();
  }
}

get estimatedTotal(): number {
  return this.paginatedData.reduce((sum, item) => sum + parseFloat(item.estimatedTime), 0);
}

get actualTotal(): number {
  return this.paginatedData.reduce((sum, item) => sum + parseFloat(item.actualTime), 0);
}

get averageProductivity(): number {
  const estimated = this.estimatedTotal;
  const actual = this.actualTotal;
  return estimated > 0 ? (actual / estimated) * 100 : 0;
}

onDateRangeChange(event,endDate) {
  if(endDate){
  let startDate = this.datePipe.transform(event,'yyyy-MM-dd')
  this.actionEvent.emit({ actionType: 'date_range', detail: startDate });
  }
}
public getClientDetails(){
this.api.getData(`${environment.live_url}/${environment.clients}/${this.selected_client_id}/`).subscribe((respData: any) => {
if(respData){
  this.allow_sending_status = respData?.allow_sending_status_report_to_client;
}
}, (error: any) => {
  this.api.showError(error?.error?.detail);
})

}
get isDisabled(): boolean {
  if (!this.allow_sending_status) return true;
  if (this.filteredData.length===0) return true;
  if (this.userRole !== 'Admin') {
    return !this.config.includeAllJobsValue;
  } else {
    return !this.selected_client_id;
  }
}
get tooltipMessage(): string | null {
  if (!this.allow_sending_status) return 'Allow sending the status report to client is not enabled.';
  if (this.filteredData.length === 0) return 'There is no data to send.';
  if (this.userRole !== 'Admin' && !this.config.includeAllJobsValue) {
    return 'You must include all jobs to proceed.';
  }
  if (this.userRole === 'Admin' && !this.selected_client_id) {
    return 'Please select a client first.';
  }
  return null;
}

getFormGroup(index: number): FormGroup {
  return this.rows.at(index) as FormGroup;
}

buildDynamicTableForm(tableData){
  this.rows.clear();
  tableData?.forEach((item,index) => {
    this.rows.push(this.fb.group({
      full_name:[item?.full_name],
      employee_id:[item?.employee_id],
      month:[item?.month],
      work_ethics_file: [null],
      points: [item?.points],
    }));
    if(item && item?.work_ethics_file){
      urlToFile(item?.work_ethics_file, this.getFileName(item?.work_ethics_file))
      .then(file => {
        if(file){
          this.file[index] = file;
          this.selectedFile[index] = this.file[index];
          this.fileLink[index]=`${item?.work_ethics_file}`
          // this.fileLink[index]=`${environment.media_url+item?.work_ethics_file}`
        }else{
        this.file[index] = null;
        this.selectedFile[index] = null;
        this.fileLink[index]=null;
        this.rows?.at(index)?.patchValue({'work_ethics_file':null});
        }
      }

      )
      .catch(error => console.error('Error:', error));
      }else{
        this.rows?.at(index)?.patchValue({'work_ethics_file':null});
      }
  });
  this.rows.controls?.forEach((control) => {
    (control as FormGroup).disable();
  });
}

public validateKeyPress(event: KeyboardEvent) {
  // Get the key code of the pressed key
  const keyCode = event.which || event.keyCode;

  // Allow only digits (0-9), backspace, and arrow keys
  if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
    event.preventDefault(); // Prevent the default action (i.e., entering the character)
  }
}
public getFileName(url:any){
  return url?.split('/')?.pop();
}

isDragActive: { [row: number]: boolean } = {};
onDragOverWorkEthics(event: DragEvent) {
  if (!this.isEditBtn) return;

  event.preventDefault();
  const zone = (event.target as HTMLElement).closest('.drop-zone');
  if (!zone) return;

  const row = Number(zone.getAttribute("data-row"));
  this.isDragActive[row] = true;
}

onDragLeaveWorkEthics(event: DragEvent) {
  const zone = (event.target as HTMLElement).closest('.drop-zone');
  if (!zone) return;

  const row = Number(zone.getAttribute("data-row"));
  this.isDragActive[row] = false;
}
onDropWorkEthics(event: DragEvent) {
  if (!this.isEditBtn) return;

  event.preventDefault();

  const zone = (event.target as HTMLElement).closest('.drop-zone');
  if (!zone) return;

  const row = Number(zone.getAttribute("data-row"));
  this.isDragActive[row] = false;

  const files = event.dataTransfer?.files;
  if (!files?.length) return;

  // Fake event so we can reuse your existing function
  const fakeEvent: any = { target: { files } };

  this.onFileSelected(fakeEvent, row);
}


public onFileSelected(event: Event,index:any): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files?.length > 0) {
    const selectedFile = input.files[0];
    this.file[index] = selectedFile;
    this.selectedFile[index] = this.file[index];
    this.fileLink[index]=null;
    // Reset input value after a slight delay to allow re-selection
    setTimeout(() => {
      input.value = "";
    }, 100); // Small delay to ensure the selection is registered

  }
}

public triggerFileInput(index:any) {
  const fileInput = this.fileInputs?.toArray()[index];
  if (fileInput) {
    fileInput?.nativeElement?.click();
  }
 }

public openFileInNewTab(index:any){
window.open(this.fileLink[index], '_blank');
}
public async UpdateFileFieldData(workCulData: any) {
  if (workCulData && workCulData?.length >= 1) {
    // Use for...of to ensure we await properly inside the loop
    for (let index = 0; index < workCulData?.length; index++) {
      // Handle each file type asynchronously
      if (this.file && this.file[index]) {
        workCulData[index].work_ethics_file = await this.convertFileToBase64(this.file[index]);
        workCulData[index].file_name = this.selectedFile[index]?.name;
      }
    }
  }
  return workCulData;
}

private async convertFileToBase64(file: File): Promise<string | null> {
  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch (error) {
    console.error('Error converting file to base64', error);
    return null;
  }
}

ngOnDestroy() {
  if (this.overlayRef) {
    this.overlayRef.dispose();
  }
}
isPositiveOrNegative(value: string): string {
    const number = parseFloat(value);
    if (isNaN(number)) {
        return "";
    } else if (number > 0) {
        return "positiveText";
    } else if (number < 0 || Object.is(number, -0)) {
        return "negativeText";
    } else {
        return "";
    }
}
onDateChange(event: any,key:any) {
  const selectedDate = event.value;
  const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
//  this.rows.at(index).patchValue({ month: formattedDate });
  this.dateRangeStartDate = formattedDate;
 // this.actionEvent.emit({ actionType: 'dateChange', detail: formattedDate });
  this.resetWeekDate = true;
}
onEndDateChange(event: any,key) {
if(event.value){
  const selectedDate = event.value;
  const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
//  this.rows.at(index).patchValue({ month: formattedDate });
  this.columnFilters[key]=formattedDate;
  this.selectedDateRange = formattedDate;
  this.actionEvent.emit({ actionType: 'dateRange', detail: {startDate:this.dateRangeStartDate,endDate:formattedDate,key:key}});
  this.resetWeekDate = true;
}
}


mainDateChange(event: any) {
  const selectedDate = event.value;
  const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  this.dateRangeStartDate = formattedDate;
}
mainEndDateChange(event: any) {
if(event.value){
  const selectedDate = event.value;
  const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  // this.columnFilters[key]=formattedDate;
  this.mainDateRange = formattedDate;
  this.actionEvent.emit({ actionType: 'mainDateRangeFilter', detail: {startDate:this.dateRangeStartDate,endDate:formattedDate}});
  this.resetWeekDate = true;
}
}

 selectLeaveTypesFunc(event) {
  if(this.is_employeeDropdown && this.is_leaveTypes){
     this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false,user_id:this.selectedEmployeeId}});
  } else{
      this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false,user_id:this.user_id}});
  }
    // this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false}});
  }

dateClass = (date: Date) => {
  return date.getDay() === 0 ? 'sunday-highlight' : '';
};





getFilteredOptions(columnKey: string): any[] {
  const apiOptions = this.config.columns.find(col => col.key === columnKey)?.filterOptions || [];
  const searchText = (this.filterSearchText[columnKey] || '').toLowerCase();
  const selectedIds = this.columnFilters[columnKey] || [];

  // Ensure selectedItemsMap for this column is always up-to-date
  if (!this.selectedItemsMap[columnKey]) {
    this.selectedItemsMap[columnKey] = [];
  }

  // Merge any newly fetched API options into the stored selected items
  const allSelected = [
    ...this.selectedItemsMap[columnKey],
    ...apiOptions.filter((opt:any) => selectedIds.includes(opt.id))
  ].filter((v, i, arr) => arr.findIndex(o => o.id === v.id) === i); // remove duplicates

  // Update stored selected items
  this.selectedItemsMap[columnKey] = allSelected;

  // Merge selected items with API options (keep selected first)
  const others = apiOptions
    .filter((opt:any) => !selectedIds.includes(opt.id))
    .filter((opt:any) => opt.name?.toLowerCase().includes(searchText));

  return [...allSelected, ...others];
}




loadingFilters: any = {};
onFilterOpen(col: any, isOpen: boolean) {
  if (isOpen) {
  const columnConfig = this.config.columns.find(c => c.key === col.key);
  if (columnConfig?.filterOptions && columnConfig.filterOptions.length > 0) {
    return;
  }
  this.nextPage[col.key] = 1;
  this.loadingFilters[col.key] = false;
     this.loadingFilters[col.key] = false;
    this.filterOpened.emit({
      column: col,
      page: 1,
      search: this.filterSearchText[col.key] || ''
    });
  }
}

onFilterScroll(event: any, col: any) {
  const element = event.target;
   const key = col.key;
  if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10 && !this.loadingFilters[key]) {
     this.loadingFilters[key] = true;
    const pageToLoad = this.nextPage[col.key] || 2;
    this.filterScrolled.emit({
      column: col,
      page: pageToLoad,
      search: this.filterSearchText[col.key] || ''
    });
    this.nextPage[col.key] = pageToLoad + 1;
    setTimeout(() => this.loadingFilters[key] = false, 300);
  }
}

// onSelectionChange(newSelected: any[], col: any) {
//   // this.tempFilters[col.key] = newSelected;
//   //  const filterKey = columnConfig.key;
//   // const backendParamKey = columnConfig.paramskeyId || filterKey;
//   // const currentFilterValueStr = JSON.stringify(selectedValue);
//   // const lastEmittedValueStr = this.lastEmittedFilters[filterKey];

//   // if (currentFilterValueStr !== lastEmittedValueStr) {
//   //   this.lastEmittedFilters[filterKey] = currentFilterValueStr;
//   // }
//   this.columnFilters[col.key] = newSelected;
//   console.log('newSelected',newSelected,col)
//   if(col?.filterOptions){
//    this.actionEvent.emit({
//     actionType: 'filter',
//     detail: newSelected,
//     key: col.paramskeyId,
//     fromFilter: true
//   });
// }
// }
selectedFilterOptions: { [key: string]: any[] } = {};
onSelectionChange(newSelected: any[], col: any) {
  // this.columnFilters[col.key] = newSelected;
  // this.tempFilters[col.key] = newSelected;
  // this.selectedFilterOptions[col.paramskeyId] = [...newSelected];
  // console.log('selectedFilterOptions',this.selectedFilterOptions)
  // console.log('newSelected',newSelected,col)
  //   if(col?.filterOptions){
  //    this.actionEvent.emit({
  //     actionType: 'filter',
  //     detail: newSelected,
  //     key: col.paramskeyId,
  //     fromFilter: true
  //   });
  // }

  const prevSelected = this.selectedFilterOptions[col.paramskeyId] || [];
  const hasChanged =
    newSelected.length !== prevSelected.length ||
    newSelected.some(x => !prevSelected.includes(x));
  if (!hasChanged) {
    return;
  }
  this.columnFilters[col.key] = [...newSelected];
  this.tempFilters[col.key] = [...newSelected];
  this.selectedFilterOptions[col.paramskeyId] = [...newSelected];
  const existing = this.selectedItemsMap[col.key] || [];
  const stillSelected = existing.filter(item => newSelected.includes(item.id));
  const newlySelected = (col.filterOptions || []).filter(opt =>
    newSelected.includes(opt.id)
  );
  // if prim emp or job is added while doing the include jobs
  if(col.paramskeyId==='client-ids' && this.selected_client_id && newSelected.length>1){
    const filtersToReset = ['job_name', 'is_primary'];
    filtersToReset.forEach(key => {
    this.selectedItemsMap[key] = [];
    this.columnFilters[key] = [];
    this.tempFilters[key] = [];
    this.loadingFilters[key] = {};
    this.filterSearchText[key] = '';
    this.nextPage[key] = 1;

    // Clear dropdown data
    this.config.columns.forEach(col => {
      if (col.key === key) {
        col.filterOptions = [];
      }
    });
  });
  }
  this.selectedItemsMap[col.key] = [...stillSelected, ...newlySelected]
    .filter((item, idx, arr) => arr.findIndex(o => o.id === item.id) === idx);
  if (col?.filterOptions) {
    this.actionEvent.emit({
      actionType: 'filter',
      detail: newSelected,
      key: col.paramskeyId,
      fromFilter: true
    });
  }
 if (this.config.showIncludeAllJobs) {
    this.isIncludeFlagEnableLogic();
  }
}


onSearchInput(col: any) {
  // const searchText = this.filterSearchText[col.key] || '';
  // if (searchText.length === 0 || searchText.length >= 2) {
  //    this.nextPage[col.key] = 1; 
  //   this.filterSearched.emit({
  //     column: col,
  //     page: 1,
  //     search: searchText,
  //     reset: true
  //   });
  // }
  const key = col.key;
  const searchText = this.filterSearchText[key] || '';

  if (!this.searchSubjects[key]) {
    this.searchSubjects[key] = new Subject<string>();
    this.searchSubjects[key]
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        if (value.length === 0 || value.length >= 2) {
          this.nextPage[key] = 1;
          this.filterSearched.emit({
            column: col,
            page: 1,
            search: value,
            reset: true
          });
        }
      });
  }

  this.searchSubjects[key].next(searchText);
}





clearFilterSearch(col: any) {
  // console.log('this.config',this.tempFilters[col.key])
   
  this.filterSearchText[col.key] = '';
  this.nextPage[col.key] = 2; // reset pagination
  this.filterSearched.emit({
    column: col,
    page: 1,
    search: '',
    reset: true
  });
}

  // employee dropdown functions
  public onEmployeeChange(event: any){
    this.updateSelectedItems('employee', event.value);
     this.actionEvent.emit({ actionType: 'leaveType', detail: {leave_type:this.selectedLeaveType,reset:false,user_id:this.selectedEmployeeId}});
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
  selectedDropdownItems: { [key: string]: any[] } = {
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
  onSearchDropdown(key: string, text: string) {
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


    this.api.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
      .subscribe((res: any) => {
        state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
        const selectedItems = this.selectedDropdownItems[key] || [];
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
    let selectedItems = this.selectedDropdownItems[key] || [];
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

    this.selectedDropdownItems[key] = selectedItems;
  }

  // Return options with selected items on top, no duplicates
  getOptionsWithSelectedOnTop(key: string) {
    const state = this.dropdownState[key];
    const selectedItems = this.selectedDropdownItems[key] || [];
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

}

