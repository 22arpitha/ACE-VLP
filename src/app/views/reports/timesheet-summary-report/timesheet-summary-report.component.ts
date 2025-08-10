import { Component, OnInit } from '@angular/core';
import { tableColumns } from './timesheet-summary-config';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { CommonServiceService } from '../../../service/common-service.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { environment } from '../../../../environments/environment';
import { getUniqueValues, getUniqueValues2 } from '../../../shared/unique-values.utils';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Router } from '@angular/router';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-timesheet-summary-report',
  templateUrl: './timesheet-summary-report.component.html',
  styleUrls: ['./timesheet-summary-report.component.scss'],

})
export class TimesheetSummaryReportComponent implements OnInit {
  BreadCrumbsTitle: string = 'Timesheet Summary Report';
  term: string = '';
  tableSize: number = 50;
  page: number = 1;
  tableSizes = [50,75,100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 50,
    pagination: true,
    navigation:true,
    showDownload:true,
  };
  user_id: string | null;
  user_role_name: string;
  fromDate:any = {};
  selectedDate: any;
  time = {
    start_date: '',
    end_date: ''
  };
  employees: any = [];
  filterOptions: { id: any; name: string; }[];
  selectedEmployeeId: any = [];
  employeeName: any = [];

  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private router:Router,
    private dialog: MatDialog,
    private datePipe:DatePipe
  ) {

  }

  async ngOnInit(){
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
    // this.getEmployeeList();
     this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term });
  }

  onTableDataChange(event: number): void {
    this.page = event;
    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term,employee_ids:this.selectedEmployeeId, fromdate: this.fromDate });
  }

  onTableSizeChange(event: any): void {
    const newSize = Number(event.value || event);
    this.tableSize = newSize;
    this.page = 1;
    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term, employee_ids:this.selectedEmployeeId, fromdate: this.fromDate });
  }

  handleAction(event: { actionType: string; detail: any }): void {
    switch (event.actionType) {
      case 'tableDataChange':
        this.onTableDataChange(event.detail);
        break;
      case 'tableSizeChange':
        this.onTableSizeChange(event.detail);
        break;
      case 'search':
        this.onSearch(event.detail);
        break;
      case 'export_csv':
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
        case 'filter':
        this.selectedEmployeeId = event.detail;
        this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term , employee_ids: event.detail});
        break;
      case 'weekDate':
        this.fromDate = event.detail;
        this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term , employee_ids:this.selectedEmployeeId, fromdate: this.fromDate })
        break;
      case 'navigate':
        this.getEmployeeDetails(event['row'],event['selectedDay'])
        break;
      default:
        this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term});
    }
  }
  getEmployeeDetails(employee,selectedDate): void {
    // console.log('employee Data',employee,selectedDate);
         this.dialog.open(EmployeeDetailsComponent, {
         panelClass: 'custom-details-dialog',
         data: { employee:employee,selectedDay:selectedDate }
       });

  }
  exportCsvOrPdf(fileType: string): void {
    let query = buildPaginationQuery({ page: this.page, pageSize: this.tableSize });

    if (this.user_role_name !== 'Admin') {
      query += `&employee-id=${this.user_id}`;
    }
    const startDate = this.fromDate?.start_date ?? this.time.start_date;
    const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    query += `&from-date=${formattedStartDate}`;

    if (this.selectedEmployeeId?.length > 0) {
      query += `&employee-ids=[${this.selectedEmployeeId}]`;
    }
    const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=summary`;
    downloadFileFromUrl({ url, fileName: 'VLP - Timesheet Summary Report', fileType: fileType as 'csv' | 'pdf' });
  }

  filterByDate(date: string): void {
    this.getTableData({ page: this.page, pageSize: this.tableSize, searchTerm: this.term ,employee_ids:this.selectedEmployeeId, fromdate: date });
  }
 getEmployeeList(){
        this.api.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((res: any) => {
          if(res){
            this.employeeName = res?.map((item: any) => ({
              id: item.user_id,
              name: item.user__full_name
            }));
             this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: this.term });
          }
        })
      }

  // async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; fromdate?:any; employee_ids?: any; startDate?; endDate? }) {

  //     this.filterOptions =  this.employeeName

  //     if(this.filterOptions && this.filterOptions.length > 0){
  //       this.selectedEmployeeId = params?.employee_ids
  //       const page = params?.page ?? this.page;
  //       const pageSize = params?.pageSize ?? this.tableSize;
  //       const searchTerm = params?.searchTerm ?? this.term;
  //      // const employeeIds = params?.employee_ids ?? this.selectedEmployeeId;

  //       // Get current week's start and end date
  //       const today = new Date();
  //       const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

  //       const startOfWeek = new Date(today);
  //       startOfWeek.setDate(today.getDate() - dayOfWeek);

  //       const endOfWeek = new Date(today);
  //       endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

  //       // Save the week range in 'time'
  //       this.time.start_date = startOfWeek.toISOString();
  //       this.time.end_date = endOfWeek.toISOString();

  //       // Build query params
  //       let query = buildPaginationQuery({ page, pageSize, searchTerm });

  //       // Consolidate employee ID filtering logic
  //       const currentSelectedIds = params?.employee_ids ?? this.selectedEmployeeId ?? [];

  //       if (this.user_role_name !== 'Admin') {
  //           // For Non-Admins:
  //           if (currentSelectedIds.length > 0) {
  //               // If filters are selected by a non-admin, combine them with the logged-in user's ID
  //               const idsForQuery = new Set<string>();
  //               currentSelectedIds.forEach(id => {
  //                   if (id != null) idsForQuery.add(String(id));
  //               });

  //               // Only add the parameter if the set is not empty after processing
  //               if (idsForQuery.size > 0) {
  //                   query += `&employee-ids=[${Array.from(idsForQuery).join(',')}]`;
  //               }else{
  //                 // If no filters are selected, use the logged-in user's ID
  //                 if (this.user_id != null) {
  //                   query += `&employee-id=${this.user_id}&timesheet-report-type=detailed`;
  //                 }
  //               }
  //           } else {
  //               // If no filters are selected by a non-admin, query by their own ID using employee-id
  //               if (this.user_id != null) {
  //                   query += `&employee-id=${this.user_id}&timesheet-report-type=detailed`;
  //               }
  //           }
  //       } else {
  //           // For Admins:
  //           // Only use selected filters, if any
  //           if (currentSelectedIds.length > 0) {
  //               const idsForQuery = new Set<string>();
  //               currentSelectedIds.forEach(id => {
  //                   if (id != null) idsForQuery.add(String(id));
  //               });
  //               // Ensure we only add the param if the set is not empty after processing
  //               if (idsForQuery.size > 0) {
  //                    query += `&employee-ids=[${Array.from(idsForQuery).join(',')}]`;
  //               }
  //           }
  //           // If Admin and no filters selected, no employee-specific parameter is added by this block.
  //       }


  //     const startDate = params?.fromdate?.start_date ?? this.time.start_date;
  //     const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
  //     query += `&from-date=${formattedStartDate}`;

  //     await this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}`)
  //       .subscribe(async (res: any) => {
  //        if(res){
  //          const employees = res?.results;

  //          const formattedData = employees?.map((employee: any, index: number) => {
  //            const row: any = {
  //              sl: (page - 1) * pageSize + index + 1,
  //              ...employee,
  //              employee_name: employee?.employee_name,
  //              employee_worked_hours: employee?.employee_worked_hours,
  //              total_working_hours:employee?.total_working_hours,
  //              short_fall: employee.color!='black'? employee?.short_fall : 'No ShortFall',
  //              is_locked:employee?.is_locked === false ? 'Not Locked Yet' : 'Locked',
  //              keyId: employee?.employee_id
  //            };
  //            employee?.timesheet_data?.forEach((entry: any) => {
  //              row[entry.day] = entry?.total_time;
  //              row[`${entry?.day}_date`] = entry?.date;
  //            });
  //            return row;
  //          });
  //              this.tableConfig = {
  //                columns:  tableColumns?.map(col => {
  //                  if (col.filterable && col.key === 'employee_name') {
  //                    return { ...col, filterOptions: this.filterOptions };
  //                  }
  //                  return col;
  //                }),
  //                data: formattedData,
  //                searchTerm: this.term,
  //                actions: [],
  //                accessConfig: [],
  //                tableSize: pageSize,
  //                pagination: true,
  //                searchable: true,
  //                currentPage: page,
  //                totalRecords: res.total_no_of_record,
  //                dateRangeFilter: true,
  //                navigation: true,
  //                showDownload:true,
  //                searchPlaceholder:'Search by Employee',
  //              };
  //            }
  //        });
  //      }



  // }

  onSearch(term: string): void {
    this.term = term;
    this.getTableData({ page: 1, pageSize: this.tableSize, searchTerm: term, employee_ids:this.selectedEmployeeId, fromdate: this.fromDate });
  }
  getCurrentWeekDates() {
    this.selectedDate = this.fromDate || JSON.stringify(this.time);
  }


  // new code
private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map(col =>
      col.keyId === key
        ? {
            ...col,
            filterOptions: cache.data,
            currentPage: cache.page,
            totalPages: Math.ceil(cache.total / 20)
          }
        : col
    );
  }

    filterDataCache: {
  [key: string]: { data: any[], page: number, total: number, searchTerm: string }
} = {};

 async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; fromdate?:any; employee_ids?: any; startDate?; endDate? }) {

      this.filterOptions =  this.employeeName

      // if(this.filterOptions && this.filterOptions.length > 0){
        this.selectedEmployeeId = params?.employee_ids
        const page = params?.page ?? this.page;
        const pageSize = params?.pageSize ?? this.tableSize;
        const searchTerm = params?.searchTerm ?? this.term;
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

        // Save the week range in 'time'
        this.time.start_date = startOfWeek.toISOString();
        this.time.end_date = endOfWeek.toISOString();

        // Build query params
        let query = buildPaginationQuery({ page, pageSize, searchTerm });

        // Consolidate employee ID filtering logic
        const currentSelectedIds = params?.employee_ids ?? this.selectedEmployeeId ?? [];

        if (this.user_role_name !== 'Admin') {
            // For Non-Admins:
            if (currentSelectedIds.length > 0) {
                // If filters are selected by a non-admin, combine them with the logged-in user's ID
                const idsForQuery = new Set<string>();
                currentSelectedIds.forEach(id => {
                    if (id != null) idsForQuery.add(String(id));
                });

                // Only add the parameter if the set is not empty after processing
                if (idsForQuery.size > 0) {
                    query += `&employee-ids=[${Array.from(idsForQuery).join(',')}]`;
                }else{
                  // If no filters are selected, use the logged-in user's ID
                  if (this.user_id != null) {
                    query += `&employee-id=${this.user_id}&timesheet-report-type=detailed`;
                  }
                }
            } else {
                // If no filters are selected by a non-admin, query by their own ID using employee-id
                if (this.user_id != null) {
                    query += `&employee-id=${this.user_id}&timesheet-report-type=detailed`;
                }
            }
        } else {
            // For Admins:
            // Only use selected filters, if any
            if (currentSelectedIds.length > 0) {
                const idsForQuery = new Set<string>();
                currentSelectedIds.forEach(id => {
                    if (id != null) idsForQuery.add(String(id));
                });
                // Ensure we only add the param if the set is not empty after processing
                if (idsForQuery.size > 0) {
                     query += `&employee-ids=[${Array.from(idsForQuery).join(',')}]`;
                }
            }
            // If Admin and no filters selected, no employee-specific parameter is added by this block.
        }


      const startDate = params?.fromdate?.start_date ?? this.time.start_date;
      const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
      query += `&from-date=${formattedStartDate}`;
      await this.api.getData(`${environment.live_url}/${environment.timesheet_summary}/${query}`)
        .subscribe(async (res: any) => {
         if(res){
           const employees = res?.results;

           const formattedData = employees?.map((employee: any, index: number) => {
             const row: any = {
               sl: (page - 1) * pageSize + index + 1,
               ...employee,
               employee_name: employee?.employee_name,
               employee_worked_hours: employee?.employee_worked_hours,
               total_working_hours:employee?.total_working_hours,
               short_fall: employee.color!='black'? employee?.short_fall : 'No ShortFall',
               is_locked:employee?.is_locked === false ? 'Not Locked Yet' : 'Locked',
               keyId: employee?.employee_id
             };
             employee?.timesheet_data?.forEach((entry: any) => {
               row[entry.day] = entry?.total_time;
               row[`${entry?.day}_date`] = entry?.date;
             });
             return row;
           });
               this.tableConfig = {
                 columns:  tableColumns?.map(col => {
                   let filterOptions: any = [];
                  //  if (col.filterable && col.key === 'employee_name') {
                  //    return { ...col, filterOptions: this.filterOptions };
                  //  }
                  //  return col;

                  const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
            if (existingCol?.filterOptions?.length) {
              filterOptions = existingCol.filterOptions;
            } else if (col.filterable) {
              // Fallback to initial options if none present
              if (col.key === 'employee_name') {
                filterOptions = this.employeeName;
              }
                  
            }
            return {
              ...col,
              filterOptions
            };
                 }),
                 data: formattedData,
                 searchTerm: this.term,
                 actions: [],
                 accessConfig: [],
                 tableSize: pageSize,
                 pagination: true,
                 searchable: true,
                 currentPage: page,
                 totalRecords: res.total_no_of_record,
                 dateRangeFilter: true,
                 navigation: true,
                 showDownload:true,
                 searchPlaceholder:'Search by Employee',
               };
             }
         });
      //  }



  }


getFilterOptions(event: { detail: any; key: string }) {
  const { detail, key } = event;
  let cache = this.filterDataCache[key];
  const searchTerm = detail.search || '';

  if (!cache || detail.reset || cache.searchTerm !== searchTerm) {
  cache = this.filterDataCache[key] = {
    data: [],
    page: 0,
    total: 0,
    searchTerm
  };
}

  // If already loaded all records, don’t fetch again
  if (cache.data.length >= cache.total && cache.total > 0) {
    this.updateFilterColumn(key, cache);
    return;
  }

  const nextPage = cache.page + 1;
  let query = `?page=${nextPage}&page_size=${detail.pageSize}`;
  if (searchTerm) query += `&search=${searchTerm}`;

  let endpoint = '';
  if (key === 'employee_id'){
    endpoint = environment.employee;
    query +=  `&is_active=True&employee=True`
  } 
  // if (key === 'timesheet-task-ids') {
  //   // Task filter static
  //   this.updateFilterColumn(key, { data: this.taskName, page: 1, total: this.taskName.length, searchTerm: '' });
  //   return;
  // }

  this.api.getData(`${environment.live_url}/${endpoint}/${query}`)
    .subscribe((res: any) => {
      if (!res) return;

      const fieldMap: any = {
        'employee_id': { id: 'user_id', name: 'user__full_name' },
      };

      const newData = res.results?.map((item: any) => ({
        id: item[fieldMap[key]?.id] || '',
        name: item[fieldMap[key]?.name] || ''
      }));

      cache.data = [
        ...cache.data,
        ...newData.filter(opt => !cache.data.some(existing => existing.id === opt.id))
      ];
      cache.page = nextPage;
      cache.total = res.total_no_of_record || cache.total;
      
      this.updateFilterColumn(key, cache);
    });
}

// when filter opens or checkboxes selected
onFilterOpened(event: any) {
  this.getFilterOptions({ detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, key: event.column.keyId });
}

// when user scrolls
onFilterScrolled(event: any) {
  this.getFilterOptions({ detail: { page: event.page, pageSize: 10, search: event.search }, key: event.column.keyId });
}
onFilterSearched(event: any) {
  this.getFilterOptions({ 
    detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, 
    key: event.column.keyId 
  });
}
}
