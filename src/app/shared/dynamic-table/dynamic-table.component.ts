// dynamic-table.component.ts
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, SimpleChanges, ViewChildren, ViewContainerRef } from '@angular/core';
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
@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  providers: [
    NgbDropdownConfig,
    {
          provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
          useClass: WeeklySelectionStrategy
    }
  ],

})
export class DynamicTableComponent implements OnInit {
  @Input() config!: DynamicTableConfig;
  overlayRef: OverlayRef | null = null;
  filterTriggers: { [key: string]: MatMenuTrigger } = {};
  activeFilterColumn: string | null = null;
  @Output() actionEvent = new EventEmitter<any>();
  @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;
  filteredData: any[] = [];
  paginatedData: any[] = [];
  startDate;
  endDate;
  currentPage = 1;
  tableSizes = [50,75,100,150,200];
  columnFilters: { [key: string]: any } = {};
  arrowState: { [key: string]: boolean } = {};
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

  private lastEmittedFilters: { [key: string]: string } = {}; // To store JSON string of last emitted filter value per key
  dateRangeStartDate: string | null;

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
  ngOnInit(): void {
this.tempFilters = JSON.parse(JSON.stringify(this.columnFilters));
   }
onSelectionChange(newSelected: any[], col: any): void {
  const key = col.key;
  this.tempFilters[key] = newSelected;
  this.columnFilters[key] = newSelected;
  this.onFilterChange(newSelected, col); // Emits to API
  this.applyFilters(); // Applies locally
}

  // Add this trackBy function
  trackByColumnKey(index: number, col: any): string {
    return col.key; // Or any unique identifier for the column
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
  }
  private initializeTable(): void {
    if(this.config.data && this.config.data?.length > 0){
     this.filteredData = this.config.data;
    }else{
      this.filteredData = [];
    }
    console.log('Filtered Data:', this.config.data);
    this.config.columns?.forEach(col => {
      this.arrowState[col.key] = false;
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

  // Removed async, added guard based on lastEmittedFilters
  onFilterChange(selectedValue: any, columnConfig: any) {
    const filterKey = columnConfig.key; // The key used for columnFilters
    const backendParamKey = columnConfig.paramskeyId || filterKey; // The key to be sent to backend
    const currentFilterValueStr = JSON.stringify(selectedValue);
    const lastEmittedValueStr = this.lastEmittedFilters[filterKey];

    // Only emit if the filter value has actually changed since the last emission for this key
    if (currentFilterValueStr !== lastEmittedValueStr) {
      this.lastEmittedFilters[filterKey] = currentFilterValueStr;

      // console.log(`Emitting filter change for ${filterKey} (backend key: ${backendParamKey}). Value:`, selectedValue);
      this.actionEvent.emit({
        actionType: 'filter',
        detail: selectedValue,
        key: backendParamKey
      });
    } else {
      // console.log(`Filter value for ${filterKey} (backend key: ${backendParamKey}) has not changed since last emit. Emission skipped.`);
    }
    if(this.config.showIncludeAllJobs){
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
            debugger;
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
    this.selectedDate = event;
    this.actionEvent.emit({ actionType: 'weekDate', detail: this.selectedDate });
    this.resetWeekDate = true;
  }

  sort(direction: string, column: string) {
    // Reset the state of all columns except the one being sorted
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });

    // Update the state of the currently sorted column
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
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
getFilteredOptions(columnKey: string): any[] {
  const allOptions = this.config.columns.find(col => col.key === columnKey)?.filterOptions || [];
  const searchText = this.filterSearchText[columnKey]?.toLowerCase() || '';
  const selectedIds = this.columnFilters[columnKey] || [];

  const selected = allOptions.filter((opt:any) => selectedIds.includes(opt.id));
  const searched = allOptions.filter((opt:any) => opt.name?.toLowerCase().includes(searchText));

  const merged = [...selected, ...searched];
  const uniqueMap = new Map(merged.map((opt:any) => [opt.id, opt]));
  return Array.from(uniqueMap.values());
}

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

navigateToEmployee(event){
  this.actionEvent.emit({ actionType: 'navigate', row: event });
}

// Header Tabs events
public getCurrentDatasetList(){
  this.isHistory = false;
  this.isCurrent = true;
  this.actionEvent.emit({ actionType: 'headerTabs', action:'True' });
}

public getHistoryDatasetList(){
  this.isCurrent = false;
  this.isHistory = true;
  this.actionEvent.emit({ actionType: 'headerTabs', action:'False'});
}
// Include All Jobs Checkbox event
public onIncludeJobsChange(event:any){
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
    (obj: any) => obj['client'] === clientNameFilter[0]
  );
  this.selected_client_id = matchedClient?.client ?? null;
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
          this.fileLink[index]=`${environment.media_url+item?.work_ethics_file}`
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

public onFileSelected(event: Event,index:any): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
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
  if (workCulData && workCulData.length >= 1) {
    // Use for...of to ensure we await properly inside the loop
    for (let index = 0; index < workCulData.length; index++) {
      // Handle each file type asynchronously
      if (this.file && this.file[index]) {
        workCulData[index].work_ethics_file = await this.convertFileToBase64(this.file[index]);
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
    } else if (number >= 0) {
        return "positiveText";
    } else if (number < 0) {
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
  const selectedDate = event.value;
  const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
//  this.rows.at(index).patchValue({ month: formattedDate });
  this.selectedDateRange = formattedDate;
  this.actionEvent.emit({ actionType: 'dateRange', detail: {startDate:this.dateRangeStartDate,endDate:formattedDate,key:key}});
  this.resetWeekDate = true;
}
}
