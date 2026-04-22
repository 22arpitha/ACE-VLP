import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tableColumns } from '../wfh-prolonged-health-issues-transaction-report/wfh-prolonged-health-issues-transaction-report.config';
import { buildPaginationQuery } from 'src/app/shared/pagination.util';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-wfh-prolonged-health-issues-transaction-report',
  templateUrl:
    './wfh-prolonged-health-issues-transaction-report.component.html',
  styleUrls: [
    './wfh-prolonged-health-issues-transaction-report.component.scss',
  ],
  standalone: false,
})
export class WfhProlongedHealthIssuesTransactionReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'WFH Prolonged Health Issues Transaction Report';
  // term: string = '';
  // user_id: any;
  // userRole: any;
  // tableSize: number = 50;
  // page: any = 1;
  // tableSizes = [50, 75, 100];
  // tableConfig: any = {
  //   columns: [],
  //   data: [],
  //   searchTerm: '',
  //   actions: [],
  //   accessConfig: [],
  //   tableSize: 50,
  //   pagination: true,
  //   showDownload: false,
  //   leaveTypes: true,
  //   reset: true,
  //   employeeDropdown: sessionStorage.getItem('user_role_name') === 'Admin' || sessionStorage.getItem('user_role_name') === 'Manager',
  // };
  // tabStatus: any = 'True';
  // allJobStatus: any = [];
  // statusList: String[] = [];
  // fromDate: any = {};
  // selectedDate: any;
  // time = {
  //   start_date: '',
  //   end_date: '',
  // };
  // client_id: any;
  // isIncludeAllJobEnable: boolean = true;
  // isIncludeAllJobValue: boolean = false;
  // jobFilterList: any = [];
  // clientName: { id: any; name: string }[];
  // jobName: { id: any; name: string }[];
  // statusName: { id: any; name: string }[];
  // leaveTypes: { id: any; name: string }[];
  // selectedClientIds: any = [];
  // selectedJobIds: any = [];
  // selectedEmployeeIds: any;
  // selectedLeaveType: any;
  // selectedStatusIds: any = [];
  // formattedData: any = [];
  // sortValue: string = '';
  // directionValue: string = '';
  // constructor(
  //   private common_service: CommonServiceService,
  //   private api: ApiserviceService,
  //   private dialog: MatDialog,
  //   private datePipe: DatePipe,
  // ) {
  //   this.user_id = sessionStorage.getItem('user_id');
  //   this.userRole = sessionStorage.getItem('user_role_name');
  //   // this.getJobList();
  //   // this.getClientList();
  //   // this.getStatusList();
  // }

  // ngOnInit(): void {
  //   this.common_service.setTitle(this.BreadCrumbsTitle);
  //   // this.tableConfig = tableColumns;
  //   this.selectedEmployeeIds =
  //     this.userRole === 'Accountant' ? this.user_id : '';
  //   // setTimeout(() => {
  //   //   this.getTableData({
  //   //     page: this.page,
  //   //     pageSize: this.tableSize,
  //   //     searchTerm: this.term
  //   //   });
  //   // }, 500);
  // }

  // getLeaveTypes() {
  //   this.api
  //     .getData(`${environment.live_url}/${environment.settings_leave_type}/`)
  //     .subscribe(
  //       (respData: any) => {
  //         this.leaveTypes = respData?.map((item: any) => ({
  //           id: item.id,
  //           name: item.leave_type_name,
  //         }));
  //       },
  //       (error: any) => {
  //         this.api.showError(error?.error?.detail);
  //       },
  //     );
  // }

  // // Called when user changes page number from the dynamic table
  // onTableDataChange(event: any) {
  //   const page = event;
  //   this.page = page;

  //   this.getTableData({
  //     page: page,
  //     pageSize: this.tableSize,
  //     searchTerm: this.term,
  //     leave_type: this.selectedLeaveType,
  //     employee_ids: this.selectedEmployeeIds,
  //   });
  // }

  // // Called when user changes page size from the dynamic table
  // onTableSizeChange(event: any): void {
  //   if (event) {
  //     const newSize = Number(event.value || event);
  //     this.tableSize = newSize;
  //     this.page = 1; // reset to first page
  //     this.getTableData({
  //       page: this.page,
  //       pageSize: this.tableSize,
  //       searchTerm: this.term,
  //       leave_type: this.selectedLeaveType,
  //       employee_ids: this.selectedEmployeeIds,
  //     });
  //   }
  // }

  // // Called from <app-dynamic-table> via @Output actionEvent
  // handleAction(event: { actionType: string; detail: any; key: any }) {
  //   switch (event.actionType) {
  //     case 'tableDataChange':
  //       this.onTableDataChange(event.detail);
  //       break;
  //     case 'tableSizeChange':
  //       this.onTableSizeChange(event.detail);
  //       break;
  //     case 'export_csv':
  //       this.exportCsvOrPdf(event.detail);
  //       break;
  //     case 'export_pdf':
  //       this.exportCsvOrPdf(event.detail);
  //       break;
  //     case 'sorting':
  //       this.onSorting(event);
  //       break;
  //     case 'reset':
  //       this.resetData(event);
  //       break;
  //     case 'filter':
  //       this.onApplyFilter(event.detail, event.key);
  //       break;
  //     case 'leaveType':
  //       this.onLeaveType(event.detail);
  //       break;
  //     case 'mainDateRangeFilter':
  //       this.time.start_date = event.detail?.startDate;
  //       this.time.end_date = event.detail?.endDate;
  //       this.getTableData({
  //         page: 1,
  //         pageSize: this.tableSize,
  //         searchTerm: this.term,
  //         leave_type: this.selectedLeaveType,
  //         employee_ids: this.selectedEmployeeIds,
  //       });
  //       break;
  //     case 'weekDate':
  //       this.fromDate = event.detail;
  //       this.getTableData({
  //         page: 1,
  //         pageSize: this.tableSize,
  //         searchTerm: this.term,
  //         leave_type: this.selectedLeaveType,
  //         employee_ids: this.selectedEmployeeIds,
  //       });
  //       break;
  //     default:
  //       this.getTableData({
  //         page: 1,
  //         pageSize: this.tableSize,
  //         searchTerm: this.term,
  //         leave_type: this.selectedLeaveType,
  //         employee_ids: this.selectedEmployeeIds,
  //       });
  //   }
  // }

  // onLeaveType(detail) {
  //   if (detail.reset === true) {
  //     this.formattedData = [];
  //     this.term = '';
  //     this.page = 1;
  //     this.tableSize = 50;
  //     this.time.start_date = '';
  //     this.time.end_date = '';
  //     this.directionValue = '';
  //     this.sortValue = '';
  //     this.tableConfig = {
  //       columns: [],
  //       data: this.formattedData,
  //       searchTerm: '',
  //       actions: [],
  //       accessConfig: [],
  //       tableSize: 50,
  //       pagination: true,
  //       searchable: false,
  //       startAndEndDateFilter: true,
  //       leaveTypes: true,
  //       showDownload: false,
  //       reset: true,
  //       searchPlaceholder: 'Search',
  //       employeeDropdown: this.userRole === 'Admin' ,
  //     };
  //   } else {
  //     this.page = 1;
  //     this.selectedEmployeeIds = this.userRole === 'Manager' ? '' : (detail?.user_id ?? '');
  //   }
  //   this.selectedLeaveType = detail?.leave_type;
  //   this.getTableData({
  //     page: this.page,
  //     pageSize: this.tableSize,
  //     searchTerm: this.term,
  //     leave_type: this.selectedLeaveType,
  //     employee_ids: this.selectedEmployeeIds,
  //   });
  // }
  // onSorting(data) {
  //   this.directionValue = data.detail.directionValue;
  //   this.sortValue = data.detail.sortValue;
  //   this.getTableData({
  //     page: this.page,
  //     pageSize: this.tableSize,
  //     searchTerm: this.term,
  //     leave_type: this.selectedLeaveType,
  //     employee_ids: this.selectedEmployeeIds,
  //   });
  // }

  // resetData(data: any) {
  //   this.formattedData = [];
  //   this.term = '';
  //   this.page = 1;
  //   this.tableSize = 50;
  //   this.selectedClientIds = [];
  //   this.selectedJobIds = [];
  //   this.selectedStatusIds = [];
  //   this.selectedEmployeeIds =
  //     this.userRole === 'Accountant' ? this.user_id : '';
  //   this.time.start_date = '';
  //   this.time.end_date = '';
  //   this.directionValue = '';
  //   this.sortValue = '';
  //   this.tableConfig = {
  //     columns: [],
  //     data: this.formattedData,
  //     searchTerm: '',
  //     actions: [],
  //     accessConfig: [],
  //     tableSize: 50,
  //     pagination: true,
  //     searchable: false,
  //     startAndEndDateFilter: true,
  //     leaveTypes: true,
  //     showDownload: false,
  //     reset: true,
  //     employeeDropdown: this.userRole === 'Admin',
  //     searchPlaceholder: 'Search by Client/Job/Employee',
  //   };
  //   this.getTableData({
  //     page: this.page,
  //     pageSize: this.tableSize,
  //     searchTerm: this.term,
  //     employee_ids: this.selectedEmployeeIds,
  //   });
  // }

  // onApplyFilter(filteredData: any[], filteredKey: string): void {
  //   if (filteredKey === 'employee_id') {
  //     this.selectedEmployeeIds = filteredData;
  //   }
  //   this.formattedData = [];
  //   this.getTableData({
  //     page: 1,
  //     pageSize: this.tableSize,
  //     searchTerm: this.term,
  //     leave_type: this.selectedLeaveType,
  //     employee_ids: this.selectedEmployeeIds,
  //   });
  // }
  // exportCsvOrPdf(fileType: string) {
  //   let query = `?file-type=${fileType}&download=true`;
  //   if (this.selectedEmployeeIds) {
  //     query += `&employee_id=${this.selectedEmployeeIds}`;
  //   }
  //   //  if (this.selectedLeaveType) {
  //   //    query += `&leave_type_id=${this.selectedLeaveType}`;
  //   //  }
  //   if (this.directionValue && this.sortValue) {
  //     query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
  //   }
  //   if (this.time?.start_date && this.time?.end_date) {
  //     query += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
  //   }
  //   const url = `${environment.live_url}/${environment.wfh_prolonged_health_transaction_report}/${query}`;
  //   // console.log(url);
  //   window.open(url, '_blank');
  // }

  // // new code
  // private updateFilterColumn(key: string, cache: any) {
  //   this.tableConfig.columns = this.tableConfig.columns.map((col) =>
  //     col.paramskeyId === key
  //       ? {
  //           ...col,
  //           filterOptions: cache.data,
  //           currentPage: cache.page,
  //           totalPages: Math.ceil(cache.total / 20),
  //         }
  //       : col,
  //   );
  // }
  // //  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string; employee_ids?: any; leave_type?: any }) {
  // //      let finalQuery;
  // //      this.formattedData = [];
  // //      const page = params?.page ?? this.page;
  // //      const pageSize = params?.pageSize ?? this.tableSize;
  // //      const searchTerm = params?.searchTerm ?? this.term;
  // //      const query = buildPaginationQuery({ page, pageSize, searchTerm });
  // //      finalQuery = query
  // //      if (params?.employee_ids) {
  // //        finalQuery += `&employee_id=${params.employee_ids}`;
  // //      }
  // //      if (params?.leave_type) {
  // //        finalQuery += `&leave_type_id=${params.leave_type}`;
  // //      }
  // //      if (this.directionValue && this.sortValue) {
  // //        finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
  // //      }
  // //      if (this.time?.start_date && this.time?.end_date) {
  // //        finalQuery += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
  // //      }
  // //      await this.api.getData(`${environment.live_url}/${environment.wfh_prolonged_health_transaction_report}/${finalQuery}`).subscribe((res: any) => {
  // //        if (res.results) {
  // //          this.formattedData = res.results?.map((item: any, i: number) => ({
  // //            sl: (page - 1) * pageSize + i + 1,
  // //            ...item,
  // //          }));
  // //          this.tableConfig = {
  // //            columns: tableColumns?.map((col:any) => {
  // //              let filterOptions: any = [];
  // //              const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
  // //              if (existingCol?.filterOptions?.length) {
  // //                filterOptions = existingCol.filterOptions;
  // //              } else if (col.filterable) {
  // //                // Fallback to initial options if none present
  // //                if (col.key === 'client_name') {
  // //                  filterOptions = this.clientName;
  // //                } else if (col.key === 'job_name') {
  // //                  filterOptions = this.jobName;
  // //                } else if (col.key === 'job_status_name') {
  // //                  filterOptions = this.statusName;
  // //                }
  // //              }
  // //              return {
  // //                ...col,
  // //                filterOptions
  // //              };
  // //            }),
  // //            data: this.formattedData,
  // //            searchTerm: this.term,
  // //            actions: [],
  // //            accessConfig: [],
  // //            tableSize: pageSize,
  // //            pagination: true,
  // //            searchable: false,
  // //            startAndEndDateFilter: true,
  // //            leaveTypes: true,
  // //            reset: true,
  // //            currentPage: page,
  // //            totalRecords: res.total_no_of_record,
  // //            showDownload: true,
  // //            showCsv:true,
  // //            showPdf:false,
  // //            searchPlaceholder: 'Search by Client/Job/Employee',
  // //            employeeDropdown: this.userRole === 'Admin',
  // //          };
  // //        }
  // //        else {
  // //          this.tableConfig = {
  // //            columns: tableColumns?.map((col:any) => {
  // //              let filterOptions: any = [];
  // //              if (col.filterable) {
  // //                if (col.key === 'client_name') { filterOptions = this.clientName; }
  // //                else if (col.key === 'job_name') { filterOptions = this.jobName; }
  // //                else if (col.key === 'employee_name') {
  // //                  filterOptions = [];
  // //                }
  // //              }
  // //              return { ...col, filterOptions };
  // //            }),
  // //            data: [],
  // //            searchTerm: this.term,
  // //            actions: [],
  // //            accessConfig: [],
  // //            tableSize: pageSize,
  // //            pagination: true,
  // //            searchable: false,
  // //            // headerTabs:true,
  // //            // showIncludeAllJobs:true,
  // //            // includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
  // //            // includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
  // //            // selectedClientId:this.client_id ? this.client_id:null,
  // //            // sendEmail:true,
  // //            currentPage: page,
  // //            totalRecords: 0,
  // //            showDownload: false,
  // //            searchPlaceholder: 'Search by Client/Job/Status',
  // //          };
  // //        }

  // //      }, (error: any) => {
  // //        this.api.showError(error?.error?.detail);
  // //      });
  // //    }

  // async getTableData(params?: {
  //   page?: number;
  //   pageSize?: number;
  //   searchTerm?: string;
  //   employee_ids?: any;
  //   leave_type?: any;
  // }) {
  //   let finalQuery;
  //   this.formattedData = [];

  //   const page = params?.page ?? this.page;
  //   const pageSize = params?.pageSize ?? this.tableSize;
  //   const searchTerm = params?.searchTerm ?? this.term;

  //   const query = buildPaginationQuery({ page, pageSize, searchTerm });
  //   finalQuery = query;

  //   const hasEmployeeFilter = Array.isArray(params?.employee_ids)
  //     ? params.employee_ids.length > 0
  //     : (params?.employee_ids !== '' && params?.employee_ids != null);

  //   if (this.userRole === 'Manager' && !hasEmployeeFilter) {
  //     finalQuery += `&manager-id=${this.user_id}`;
  //   }

  //   if (hasEmployeeFilter) {
  //     if (Array.isArray(params.employee_ids) && params.employee_ids.length) {
  //       const ids = params.employee_ids.map((e: any) => e.id ?? e).join(',');
  //       finalQuery += `&employee-ids=[${ids}]`;
  //     } else if (!Array.isArray(params.employee_ids) && params.employee_ids !== '') {
  //       finalQuery += `&employee-ids=[${params.employee_ids}]`;
  //     }
  //   }

  //   if (this.directionValue && this.sortValue) {
  //     finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
  //   }

  //   if (this.time?.start_date && this.time?.end_date) {
  //     finalQuery += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
  //   }

  //   this.api
  //     .getData(
  //       `${environment.live_url}/${environment.wfh_prolonged_health_transaction_report}${finalQuery}`,
  //     )
  //     .subscribe(
  //       (res: any) => {
  //         if (res?.results?.length) {
  //           this.formattedData = res.results.map((item: any, i: number) => ({
  //             sl: (page - 1) * pageSize + i + 1,
  //             employee: item.employee,
  //             from_date: item.from_date,
  //             to_date: item.to_date,
  //             wfh_category: this.formatCategoryName(item.wfh_category),
  //             description: item.description,
  //             days_applied: item.days_applied ?? 0,
  //             approved_by: item.approved_by,
  //             approved_on: item.approved_on,
  //             created_on: item.created_on,
  //           }));

  //           this.tableConfig = {
  //             columns: tableColumns?.map((col: any) => {
  //               let filterOptions: any = [];
  //               const existingCol = this.tableConfig?.columns?.find(
  //                 (c: any) => c.key === col.key,
  //               );

  //               if (existingCol?.filterOptions?.length) {
  //                 filterOptions = existingCol.filterOptions;
  //               }

  //               return {
  //                 ...col,
  //                 filterOptions,
  //                 ...(col.key === 'employee' && this.userRole === 'Accountant' ? { filterable: false } : {}),
  //               };
  //             }),
  //             data: this.formattedData,
  //             searchTerm: this.term,
  //             actions: [],
  //             accessConfig: [],
  //             tableSize: pageSize,
  //             pagination: true,
  //             searchable: false,
  //             startAndEndDateFilter: true,
  //             leaveTypes: false,
  //             reset: true,
  //             currentPage: res.current_page ?? page,
  //             totalRecords: res.total_no_of_record ?? 0,
  //             showDownload: true,
  //             showCsv: true,
  //             showPdf: false,
  //             searchPlaceholder: 'Search by Employee',
  //             employeeDropdown: this.userRole === 'Admin' ,
  //           };
  //         } else {
  //           this.tableConfig = {
  //             columns: tableColumns.map((col: any) => ({
  //               ...col,
  //               ...(col.key === 'employee' && this.userRole === 'Accountant' ? { filterable: false } : {}),
  //             })),
  //             data: [],
  //             searchTerm: this.term,
  //             actions: [],
  //             accessConfig: [],
  //             tableSize: pageSize,
  //             pagination: true,
  //             searchable: false,
  //             currentPage: page,
  //             totalRecords: 0,
  //             showDownload: false,
  //             searchPlaceholder: 'Search by Employee',
  //           };
  //         }
  //       },
  //       (error: any) => {
  //         this.api.showError(error?.error?.detail);
  //       },
  //     );
  // }

  // filterDataCache: {
  //   [key: string]: {
  //     data: any[];
  //     page: number;
  //     total: number;
  //     searchTerm: string;
  //   };
  // } = {};

  // getFilterOptions(event: { detail: any; key: string }) {
  //   const { detail, key } = event;
  //   let cache = this.filterDataCache[key];
  //   const searchTerm = detail.search || '';

  //   if (!cache || detail.reset || cache.searchTerm !== searchTerm) {
  //     cache = this.filterDataCache[key] = {
  //       data: [],
  //       page: 0,
  //       total: 0,
  //       searchTerm,
  //     };
  //   }

  //   // If already loaded all records, don’t fetch again
  //   if (cache.data.length >= cache.total && cache.total > 0) {
  //     this.updateFilterColumn(key, cache);
  //     return;
  //   }

  //   const nextPage = cache.page + 1;
  //   let query = `?page=${nextPage}&page_size=${detail.pageSize}`;
  //   if (searchTerm) query += `&search=${searchTerm}`;

  //   let endpoint = '';
  //   if (key === 'client-ids') {
  //     endpoint = environment.clients;
  //     query += `&status=True`;
  //     query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
  //   }
  //   if (key === 'job-ids') {
  //     endpoint = environment.jobs;
  //     query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
  //   }
  //   if (key === 'job-status-ids') {
  //     endpoint = environment.settings_job_status;
  //   }
  //   if (key === 'timesheet-employee-ids' || key === 'employee_id') {
  //     endpoint = environment.employee;
  //     query += `&is_active=True&employee=True`;
  //   }

  //   if (!endpoint) return;

  //   if (this.userRole === 'Manager') {
  //     query += `&reporting_manager_id=${this.user_id}`;
  //   }

  //   // if (key === 'timesheet-task-ids') {
  //   //   // Task filter static
  //   //   this.updateFilterColumn(key, { data: this.taskName, page: 1, total: this.taskName.length, searchTerm: '' });
  //   //   return;
  //   // }

  //   this.api
  //     .getData(`${environment.live_url}/${endpoint}/${query}`)
  //     .subscribe((res: any) => {
  //       if (!res) return;

  //       const fieldMap: any = {
  //         'client-ids': { id: 'id', name: 'client_name' },
  //         'job-ids': { id: 'id', name: 'job_name' },
  //         'job-status-ids': { id: 'id', name: 'status_name' },
  //         'timesheet-employee-ids': { id: 'user_id', name: 'user__full_name' },
  //         'employee_id': { id: 'user_id', name: 'user__full_name' },
  //       };

  //       const newData = res?.results?.map((item: any) => ({
  //         id: item[fieldMap[key]?.id] || '',
  //         name: item[fieldMap[key]?.name] || '',
  //       }));

  //       cache.data = [
  //         ...cache.data,
  //         ...(newData?.filter(
  //           (opt: any) => !cache.data.some((existing: any) => existing.id === opt.id),
  //         ) ?? []),
  //       ];
  //       cache.page = nextPage;
  //       cache.total = res.total_no_of_record || cache.total;

  //       this.updateFilterColumn(key, cache);
  //     });
  // }

  // // when filter opens or checkboxes selected
  // onFilterOpened(event: any) {
  //   this.getFilterOptions({
  //     detail: {
  //       page: 1,
  //       pageSize: 10,
  //       search: event.search,
  //       reset: event.reset,
  //     },
  //     key: event.column.paramskeyId,
  //   });
  // }

  // // when user scrolls
  // onFilterScrolled(event: any) {
  //   this.getFilterOptions({
  //     detail: { page: event.page, pageSize: 10, search: event.search },
  //     key: event.column.paramskeyId,
  //   });
  // }
  // onFilterSearched(event: any) {
  //   this.getFilterOptions({
  //     detail: {
  //       page: 1,
  //       pageSize: 10,
  //       search: event.search,
  //       reset: event.reset,
  //     },
  //     key: event.column.paramskeyId,
  //   });
  // }

  term: string = '';
  user_id: any;
  userRole: any;
  tableSize: number = 50;
  page: any = 1;
  tableSizes = [50, 75, 100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: 50,
    pagination: true,
    showDownload: false,
    leaveTypes: true,
    reset: true,
    employeeDropdown: sessionStorage.getItem('user_role_name') === 'Admin',
  };
  tabStatus: any = 'True';
  allJobStatus: any = [];
  statusList: String[] = [];
  fromDate: any = {};
  selectedDate: any;
  time = {
    start_date: '',
    end_date: '',
  };
  client_id: any;
  isIncludeAllJobEnable: boolean = true;
  isIncludeAllJobValue: boolean = false;
  jobFilterList: any = [];
  clientName: { id: any; name: string }[];
  jobName: { id: any; name: string }[];
  statusName: { id: any; name: string }[];
  leaveTypes: { id: any; name: string }[];
  selectedClientIds: any = [];
  selectedJobIds: any = [];
  selectedEmployeeIds: any;
  selectedLeaveType: any;
  selectedStatusIds: any = [];
  formattedData: any = [];
  sortValue: string = '';
  directionValue: string = '';
  defaultEmployeeId: any = '';
  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    // this.getJobList();
    // this.getClientList();
    // this.getStatusList();
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    if (this.userRole === 'Admin') {
      this.api
        .getData(
          `${environment.live_url}/${environment.employee}/?page=1&page_size=1&is_active=True&employee=True`,
        )
        .subscribe((res: any) => {
          this.defaultEmployeeId = res?.results?.[0]?.user_id ?? '';
          this.selectedEmployeeIds = this.defaultEmployeeId;
        });
    } else {
      this.selectedEmployeeIds =
        this.userRole === 'Accountant' ? this.user_id : '';
    }
    // setTimeout(() => {
    //   this.getTableData({
    //     page: this.page,
    //     pageSize: this.tableSize,
    //     searchTerm: this.term
    //   });
    // }, 500);
  }

  getLeaveTypes() {
    this.api
      .getData(`${environment.live_url}/${environment.settings_leave_type}/`)
      .subscribe(
        (respData: any) => {
          this.leaveTypes = respData?.map((item: any) => ({
            id: item.id,
            name: item.leave_type_name,
          }));
        },
        (error: any) => {
          this.api.showError(error?.error?.detail);
        },
      );
  }

  // Called when user changes page number from the dynamic table
  onTableDataChange(event: any) {
    const page = event;
    this.page = page;

    this.getTableData({
      page: page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      leave_type: this.selectedLeaveType,
      employee_ids: this.selectedEmployeeIds,
    });
  }

  // Called when user changes page size from the dynamic table
  onTableSizeChange(event: any): void {
    if (event) {
      const newSize = Number(event.value || event);
      this.tableSize = newSize;
      this.page = 1; // reset to first page
      this.getTableData({
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term,
        leave_type: this.selectedLeaveType,
        employee_ids: this.selectedEmployeeIds,
      });
    }
  }

  // Called from <app-dynamic-table> via @Output actionEvent
  handleAction(event: { actionType: string; detail: any; key: any }) {
    switch (event.actionType) {
      case 'tableDataChange':
        this.onTableDataChange(event.detail);
        break;
      case 'tableSizeChange':
        this.onTableSizeChange(event.detail);
        break;
      case 'export_csv':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'sorting':
        this.onSorting(event);
        break;
      case 'reset':
        this.resetData(event);
        break;
      case 'filter':
        this.onApplyFilter(event.detail, event.key);
        break;
      case 'leaveType':
        this.onLeaveType(event.detail);
        break;
      case 'mainDateRangeFilter':
        this.time.start_date = event.detail?.startDate;
        this.time.end_date = event.detail?.endDate;
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          leave_type: this.selectedLeaveType,
          employee_ids: this.selectedEmployeeIds,
        });
        break;
      case 'weekDate':
        this.fromDate = event.detail;
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          leave_type: this.selectedLeaveType,
          employee_ids: this.selectedEmployeeIds,
        });
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          leave_type: this.selectedLeaveType,
          employee_ids: this.selectedEmployeeIds,
        });
    }
  }

  onLeaveType(detail) {
    if (detail.reset === true) {
      this.formattedData = [];
      this.term = '';
      this.page = 1;
      this.tableSize = 50;
      this.time.start_date = '';
      this.time.end_date = '';
      this.directionValue = '';
      this.selectedEmployeeIds =
        this.userRole === 'Admin'
          ? this.defaultEmployeeId
          : this.userRole === 'Manager'
            ? ''
            : this.user_id;
      this.tableConfig = {
        columns: [],
        data: this.formattedData,
        searchTerm: '',
        actions: [],
        accessConfig: [],
        tableSize: 50,
        pagination: true,
        searchable: false,
        startAndEndDateFilter: true,
        leaveTypes: false,
        showDownload: false,
        reset: true,
        searchPlaceholder: 'Search',
        employeeDropdown:
          this.userRole === 'Admin' || this.userRole === 'Manager',
      };
    } else {
      this.page = 1;
      this.selectedEmployeeIds = detail?.user_id ?? '';
    }
    this.selectedLeaveType = detail?.leave_type;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      leave_type: this.selectedLeaveType,
      employee_ids: this.selectedEmployeeIds,
    });
  }
  onSorting(data) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      leave_type: this.selectedLeaveType,
      employee_ids: this.selectedEmployeeIds,
    });
  }

  resetData(data: any) {
    this.formattedData = [];
    this.term = '';
    this.page = 1;
    this.tableSize = 50;
    this.selectedClientIds = [];
    this.selectedJobIds = [];
    this.selectedStatusIds = [];
    this.userRole === 'Admin'
      ? this.defaultEmployeeId
      : this.userRole === 'Manager'
        ? this.user_id
        : this.userRole === 'Accountant'
          ? this.user_id
          : '';
    this.time.start_date = '';
    this.time.end_date = '';
    this.directionValue = '';
    this.sortValue = '';
    this.tableConfig = {
      columns: [],
      data: this.formattedData,
      searchTerm: '',
      actions: [],
      accessConfig: [],
      tableSize: 50,
      pagination: true,
      searchable: false,
      startAndEndDateFilter: true,
      leaveTypes: false,
      showDownload: false,
      reset: true,
      employeeDropdown:
        this.userRole === 'Admin' || this.userRole === 'Manager',
      searchPlaceholder: 'Search by Client/Job/Employee',
    };
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      employee_ids: this.selectedEmployeeIds,
    });
  }

  onApplyFilter(filteredData: any[], filteredKey: string): void {
    if (filteredKey === 'timesheet-employee-ids') {
      const hasSelection = Array.isArray(filteredData)
        ? filteredData.length > 0
        : !!filteredData;
      if (hasSelection) {
        this.selectedEmployeeIds = filteredData;
      } else {
        // filter cleared — restore role default
        this.selectedEmployeeIds =
          this.userRole === 'Manager'
            ? ''
            : this.userRole === 'Admin'
              ? this.defaultEmployeeId
              : this.user_id;
      }
    }
    this.formattedData = [];
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      leave_type: this.selectedLeaveType,
      employee_ids: this.selectedEmployeeIds,
    });
  }
  exportCsvOrPdf(fileType: string) {
    let query = `?file-type=${fileType}&download=true`;
    if (this.selectedEmployeeIds) {
      query += `&employee-ids=${this.selectedEmployeeIds}`;
    }

    if (this.userRole === 'Manager' && !this.selectedEmployeeIds) {
      query += `&employee-ids=${this.user_id}`;
    }
    // query += this.userRole === 'Manager' ? `&employee-ids=${this.user_id}` : '';
    // if (this.selectedLeaveType) {
    //   query += `&leave_type_id=${this.selectedLeaveType}`;
    // }
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    if (this.time?.start_date && this.time?.end_date) {
      query += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
    }
    const url = `${environment.live_url}/${environment.wfh_prolonged_health_transaction_report}${query}`;
    // console.log(url);
    window.open(url, '_blank');
  }

  // new code
  private updateFilterColumn(key: string, cache: any) {
    this.tableConfig.columns = this.tableConfig.columns.map((col) =>
      col.paramskeyId === key
        ? {
            ...col,
            filterOptions: cache.data,
            currentPage: cache.page,
            totalPages: Math.ceil(cache.total / 20),
          }
        : col,
    );
  }
  async getTableData(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    employee_ids?: any;
    leave_type?: any;
  }) {
    let finalQuery;
    this.formattedData = [];
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;
    const query = buildPaginationQuery({ page, pageSize, searchTerm });
    finalQuery = query;

    if (params?.employee_ids) {
      finalQuery += `&employee-ids=${params.employee_ids}`;
    }
    if (this.userRole === 'Accountant') {
      finalQuery += `&employee_id=${this.user_id}`;
    }
    if (this.userRole === 'Manager' && !params?.employee_ids) {
      finalQuery += `&employee-ids=${this.user_id}`;
    }
    // if (params?.leave_type) {
    //   finalQuery += `&leave_type_id=${params.leave_type}`;
    // }
    if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    if (this.time?.start_date && this.time?.end_date) {
      finalQuery += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
    }
    await this.api
      .getData(
        `${environment.live_url}/${environment.wfh_prolonged_health_transaction_report}${finalQuery}`,
      )
      .subscribe(
        (res: any) => {
          if (res.results) {
            this.formattedData = res.results?.map((item: any, i: number) => ({
              sl: (page - 1) * pageSize + i + 1,
              ...item,
              from_date: item.from_date
                ? this.datePipe.transform(
                    this.parseApiDate(item.from_date),
                    'dd/MM/yyyy',
                  )
                : '',
              to_date: item.to_date
                ? this.datePipe.transform(
                    this.parseApiDate(item.to_date),
                    'dd/MM/yyyy',
                  )
                : '',
              approved_on: item.approved_on
                ? this.datePipe.transform(
                    this.parseApiDate(item.approved_on),
                    'dd/MM/yyyy',
                  )
                : '',
              created_on: item.created_on
                ? this.datePipe.transform(
                    this.parseApiDate(item.created_on),
                    'dd/MM/yyyy',
                  )
                : '',
            }));
            this.tableConfig = {
              columns: tableColumns?.map((col: any) => {
                let filterOptions: any = [];
                const existingCol = this.tableConfig?.columns?.find(
                  (c) => c.key === col.key,
                );
                if (existingCol?.filterOptions?.length) {
                  filterOptions = existingCol.filterOptions;
                } else if (col.filterable) {
                  // Fallback to initial options if none present
                  if (col.key === 'client_name') {
                    filterOptions = this.clientName;
                  } else if (col.key === 'job_name') {
                    filterOptions = this.jobName;
                  } else if (col.key === 'job_status_name') {
                    filterOptions = this.statusName;
                  }
                }
                return {
                  ...col,
                  filterOptions,
                };
              }),
              data: this.formattedData,
              searchTerm: this.term,
              actions: [],
              accessConfig: [],
              tableSize: pageSize,
              pagination: true,
              searchable: false,
              startAndEndDateFilter: true,
              leaveTypes: false,
              reset: true,
              currentPage: page,
              totalRecords: res.total_no_of_record,
              showDownload: true,
              showCsv: true,
              showPdf: false,
              searchPlaceholder: 'Search by Client/Job/Employee',
              employeeDropdown:
                this.userRole === 'Admin' || this.userRole === 'Manager',
            };
          } else {
            this.tableConfig = {
              columns: tableColumns?.map((col: any) => {
                let filterOptions: any = [];
                if (col.filterable) {
                  if (col.key === 'client_name') {
                    filterOptions = this.clientName;
                  } else if (col.key === 'job_name') {
                    filterOptions = this.jobName;
                  } else if (col.key === 'employee_name') {
                    filterOptions = [];
                  }
                }
                return { ...col, filterOptions };
              }),
              data: [],
              searchTerm: this.term,
              actions: [],
              accessConfig: [],
              tableSize: pageSize,
              pagination: true,
              searchable: false,
              // headerTabs:true,
              // showIncludeAllJobs:true,
              // includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
              // includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
              // selectedClientId:this.client_id ? this.client_id:null,
              // sendEmail:true,
              currentPage: page,
              totalRecords: 0,
              showDownload: false,
              searchPlaceholder: 'Search by Client/Job/Status',
            };
          }
        },
        (error: any) => {
          this.api.showError(error?.error?.detail);
        },
      );
  }

  filterDataCache: {
    [key: string]: {
      data: any[];
      page: number;
      total: number;
      searchTerm: string;
    };
  } = {};

  getFilterOptions(event: { detail: any; key: string }) {
    const { detail, key } = event;
    let cache = this.filterDataCache[key];
    const searchTerm = detail.search || '';

    if (!cache || detail.reset || cache.searchTerm !== searchTerm) {
      cache = this.filterDataCache[key] = {
        data: [],
        page: 0,
        total: 0,
        searchTerm,
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
    if (key === 'client-ids') {
      endpoint = environment.clients;
      query += `&status=True`;
      query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
    }
    if (key === 'job-ids') {
      endpoint = environment.jobs;
      query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
    }
    if (key === 'job-status-ids') {
      endpoint = environment.settings_job_status;
    }
    if (key === 'timesheet-employee-ids') {
      endpoint = environment.employee;
      query += `&is_active=True&employee=True`;
    }
    if (this.userRole === 'Manager') {
      query += `&manager-id=${this.user_id}`;
    }
    // if (key === 'timesheet-task-ids') {
    //   // Task filter static
    //   this.updateFilterColumn(key, { data: this.taskName, page: 1, total: this.taskName.length, searchTerm: '' });
    //   return;
    // }

    this.api
      .getData(`${environment.live_url}/${endpoint}/${query}`)
      .subscribe((res: any) => {
        if (!res) return;

        const fieldMap: any = {
          'client-ids': { id: 'id', name: 'client_name' },
          'job-ids': { id: 'id', name: 'job_name' },
          'job-status-ids': { id: 'id', name: 'status_name' },
          'timesheet-employee-ids': { id: 'user_id', name: 'user__full_name' },
        };

        const newData = res.results?.map((item: any) => ({
          id: item[fieldMap[key]?.id] || '',
          name: item[fieldMap[key]?.name] || '',
        }));

        cache.data = [
          ...cache.data,
          ...newData.filter(
            (opt) => !cache.data.some((existing) => existing.id === opt.id),
          ),
        ];
        cache.page = nextPage;
        cache.total = res.total_no_of_record || cache.total;

        this.updateFilterColumn(key, cache);
      });
  }

  // when filter opens or checkboxes selected
  onFilterOpened(event: any) {
    this.getFilterOptions({
      detail: {
        page: 1,
        pageSize: 10,
        search: event.search,
        reset: event.reset,
      },
      key: event.column.paramskeyId,
    });
  }

  // when user scrolls
  onFilterScrolled(event: any) {
    this.getFilterOptions({
      detail: { page: event.page, pageSize: 10, search: event.search },
      key: event.column.paramskeyId,
    });
  }
  onFilterSearched(event: any) {
    this.getFilterOptions({
      detail: {
        page: 1,
        pageSize: 10,
        search: event.search,
        reset: event.reset,
      },
      key: event.column.paramskeyId,
    });
  }

  formatCategoryName(name: string): string {
    if (!name) return '';

    return name
      .replace(/_/g, ' ') // underscores → spaces
      .toLowerCase() // all lowercase
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
  }

  /** Converts API date strings like "13-05-2026" (dd-MM-yyyy) into a Date object */
  parseApiDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    // Handle dd-MM-yyyy
    const ddMMyyyyDash = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateStr.match(ddMMyyyyDash);
    if (match) {
      return new Date(`${match[3]}-${match[2]}-${match[1]}`);
    }
    // Fallback: let the browser try to parse it
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
}
