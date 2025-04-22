// dynamic-table.component.ts
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DynamicTableConfig } from './dynamic-table-config.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit {
  @Input() config!: DynamicTableConfig;
  @Output() actionEvent = new EventEmitter<any>();
  filteredData: any[] = [];
  paginatedData: any[] = [];
  currentPage = 1;
  tableSizes = [5,10,25,50,100];
  columnFilters: { [key: string]: any } = {};
  arrowState: { [key: string]: boolean } = {};
  sortValue: string = '';
  directionValue: string;
  filterTriggers: { [key: string]: MatMenuTrigger } = {};
  filterSearchText: { [key: string]: string } = {};
  tableSize: number = 5;
  activeDateColumn: string | null = null;
  dateFilterValue: any = null;
  paginationConfig: any = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 0
  }
  isCurrent:boolean=true;
  isHistory:boolean=false;
  selected_client_id:any=null;
  constructor(private datePipe: DatePipe) {}
  ngOnInit(): void { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config?.data?.length) {
      this.initializeTable();
    }

    this.paginationConfig = {
      totalItems: this.config.totalRecords ?? 0,
      currentPage: this.config.currentPage ?? 1,
      itemsPerPage: this.config.tableSize ?? 5
    };
  }
  private initializeTable(): void {
    this.filteredData = [...this.config.data];

    this.config.columns.forEach(col => {
      this.arrowState[col.key] = false;
      this.columnFilters[col.key] = col.filterType === 'multi-select' ? [] : '';
    });

    this.applyFilters();
  }
  get hasColumnFilters(): boolean {
    return this.config.columns.some(col => col.filterable);
  }

  onSearch(term: string): void {
    this.actionEvent.emit({ actionType:'search' , detail:term });
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredData = this.config.data.filter(row => {
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

        const col = this.config.columns?.find(c => c.key === key);

        if (!cellVal || !filterVal) return false;

        // Normalize both by removing time and trimming whitespace
        const cleanCellVal = cellVal?.toString()?.trim()?.split(' ')[0];
        const cleanFilterVal = filterVal?.toString()?.trim()?.split(' ')[0];
        return cleanCellVal === cleanFilterVal;
      });
      if(this.config.showIncludeAllJobs){
        this.isIncludeFlagEnableLogic();
      }
     
      return matchSearch && matchColumns;
      
    });

    this.updatePagination();
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
    const start = (this.currentPage - 1) * (this.config.tableSize || 10);
    this.paginatedData = this.filteredData.slice(start, start + (this.config.tableSize || 10));
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
  activeFilterColumn: string | null = null;

openFilterMenu(event: MouseEvent, colKey: string) {
  event?.stopPropagation();
  this.activeFilterColumn = colKey;
  if(colKey){
    const trigger = this.filterTriggers[colKey];
    if (trigger) {
      trigger.openMenu();
    }
  }

}

getFilteredOptions(colKey: string): string[] {
  const options = this.config.columns.find(c => c.key === colKey)?.filterOptions || [];
  const search = this.filterSearchText[colKey]?.toLowerCase() || '';
  return options.filter(option => option.toLowerCase().includes(search));
}
onTableDataChange(event: any) {
  this.actionEvent.emit({ actionType:'tableDataChange' , detail:event });
}
onTableSizeChange(event: any): void {
  this.actionEvent.emit({ actionType:'tableSizeChange' , detail:event.value });
}


setDateFilterColumn(columnKey: string): void {
  this.activeDateColumn = columnKey;
  this.dateFilterValue = this.columnFilters[columnKey] || '';
}

// On date selection from calendar
onDateSelected(event: any): void {
  const selectedDate = event.value;

  if (selectedDate && this.activeDateColumn) {
    const formatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    this.columnFilters[this.activeDateColumn] = formatted;
    this.applyFilters();
  }
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
// Include All Jobs Checkbo event
public onIncludeJobsChange(event:any){
  this.config.includeAllJobsValue=event.checked;
  this.actionEvent.emit({ actionType: 'includeAllJobs', action:event.checked,client_id:this.selected_client_id});
}

public sendEmailEvent(){
  this.actionEvent.emit({ actionType: 'sendEmail', action:this.filteredData});
}

private isIncludeFlagEnableLogic(){
  const clientNameFilter = this.columnFilters['client_name'];
  if (clientNameFilter) {
    const isSingleClient = clientNameFilter?.length === 1;
    this.config.includeAllJobsEnable = !isSingleClient;
    if (!isSingleClient) {
      this.config.includeAllJobsValue = false;
      this.selected_client_id=null;
    }else{
      const matchedClient = this.filteredData?.find((obj:any) => obj['client_name'] === clientNameFilter[0]);
      this.selected_client_id = matchedClient?.client;
    }
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
selectAll(columnKey: string) {
  this.columnFilters[columnKey] = [...this.getFilteredOptions(columnKey)];
}

clearAll(columnKey: string) {
  this.columnFilters[columnKey] = [];
}

}
