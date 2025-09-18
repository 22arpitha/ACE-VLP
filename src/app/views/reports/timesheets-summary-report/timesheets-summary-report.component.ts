import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { tableColumns } from './timesheets-summary-report-config'
import { ApiserviceService } from '../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../shared/file-download.util';
import { buildPaginationQuery } from '../../../shared/pagination.util';
import { environment } from '../../../../environments/environment';
import { JobTimeSheetDetailsPopupComponent } from '../common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-timesheets-summary-report',
  templateUrl: './timesheets-summary-report.component.html',
  styleUrls: ['./timesheets-summary-report.component.scss']
})
export class TimesheetsSummaryReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'Timesheet summary report';
  term: string = '';
  tableSize: number = 50;
     page: any = 1;
     tableSizes = [50,75,100];
     tableConfig:any = {
       columns: [],
       data: [],
       searchTerm: '',
       actions: [],
       accessConfig: [],
       tableSize: 50,
       pagination: true,
       showDownload:true,
       reset:true,
     };
     tabStatus:any='True';
     allJobStatus:any=[];
     statusList:String[]=[];
     fromDate:any = {};
      selectedDate: any;
      time = {
        start_date: '',
        end_date: ''
      };
      user_id:any;
     userRole:any;
     client_id:any;
     isIncludeAllJobEnable:boolean=true;
     isIncludeAllJobValue:boolean=false;
    jobFilterList: any = [];
    clientName: { id: any; name: string; }[];
    jobName: { id: any; name: string; }[];
    statusName: { id: any; name: string; }[];
    selectedClientIds: any = [];
    selectedJobIds: any = [] ;
    selectedEmployeeIds: any = [];
    selectedStatusIds: any = [];
    formattedData: any = [];
    sortValue: string = '';
    directionValue: string = '';
   constructor(
       private common_service:CommonServiceService,
       private api:ApiserviceService,
       private dialog:MatDialog,
       private datePipe:DatePipe
     ) {
      this.user_id = sessionStorage.getItem('user_id');
      this.userRole = sessionStorage.getItem('user_role_name');
        // this.getJobList();
        // this.getClientList();
        // this.getStatusList();
      }
  
     ngOnInit(): void {
       this.common_service.setTitle(this.BreadCrumbsTitle)
       this.tableConfig = tableColumns;
       setTimeout(() => {
        this.getTableData({
              page: this.page,
              pageSize: this.tableSize,
              searchTerm: this.term
            });
       }, 500);
     }
  
     getJobStatusList() {
      this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
        (resData: any) => {
          if(resData){
            this.allJobStatus = resData;
            this.getTableData({
              page: this.page,
              pageSize: this.tableSize,
              searchTerm: this.term
            });
          }
        },
        (error:any)=>{
          this.api.showError(error?.error?.detail);
        }
      )
    }
  
     // Called when user changes page number from the dynamic table
   onTableDataChange(event: any) {
     const page = event;
     this.page = page;
  
     this.getTableData({
       page: page,
       pageSize: this.tableSize,
       searchTerm: this.term,
       employee_ids: this.selectedEmployeeIds,
       client_ids: this.selectedClientIds,
         job_ids: this.selectedJobIds,
     });
   }
  
   // Called when user changes page size from the dynamic table
   onTableSizeChange(event: any): void {
     if(event){
       const newSize = Number(event.value || event);
       this.tableSize = newSize;
       this.page = 1; // reset to first page
       this.getTableData({
         page: this.page,
         pageSize: this.tableSize,
         searchTerm: this.term,
         client_ids: this.selectedClientIds,
         job_ids: this.selectedJobIds,
         employee_ids: this.selectedEmployeeIds,
       });
     }
  
   }
  
   // Called from <app-dynamic-table> via @Output actionEvent
   handleAction(event: { actionType: string; detail: any,key:any}) {
     switch (event.actionType) {
        case 'navigate':
          this.viewtimesheetDetails(event['row']);
         break;
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
          this.onApplyFilter(event.detail,event.key);
         break;
         case 'mainDateRangeFilter':
          this.time.start_date = event.detail?.startDate;
          this.time.end_date = event.detail?.endDate
          this.getTableData({ 
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds, 
          employee_ids: this.selectedEmployeeIds,
        })
         break;
         case 'weekDate':
        this.fromDate = event.detail;
        this.getTableData({ 
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds, 
        })
        break;
       default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term,
          client_ids: this.selectedClientIds,
          job_ids: this.selectedJobIds,
        });
     }
   }
  
   onSorting(data){
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      employee_ids: this.selectedEmployeeIds,
    });
   }

   resetData(data:any){
    console.log(data);
    this.formattedData =[];
    this.term = ''
    this.page = 1;
    this.tableSize = 50;
    this.selectedClientIds = [];
    this.selectedJobIds = [];
    this.selectedStatusIds = [];
    this.selectedEmployeeIds = [];
    this.time.start_date= '';
    this.time.end_date= '';
    this.directionValue ='';
    this.sortValue = '';
     this.tableConfig = {
       columns: [],
       data: this.formattedData,
       searchTerm: '',
       actions: [],
       accessConfig: [],
       tableSize: 50,
       pagination: true,
       searchable: true,
       startAndEndDateFilter: true,
       showDownload:true,
       reset:true,
       searchPlaceholder:'Search by Client/Job/Employee',
     };
     this.getTableData({
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term
      });
   }
   
  onApplyFilter(filteredData: any[], filteredKey: string): void {
  
    if (filteredKey === 'client-ids') {
      this.selectedClientIds = filteredData;
      // if(filteredData && filteredData.length===0 || filteredData.length>1){
      //   this.isIncludeAllJobEnable=true;
      //   this.isIncludeAllJobValue=false;
      //   this.client_id=null;
      // }else{
      //   this.isIncludeAllJobEnable=false;
      // }
      
    }
    if (filteredKey === 'job-ids') {
      this.selectedJobIds = filteredData;
    }
    if (filteredKey === 'job-status-ids') {
      this.selectedStatusIds = filteredData;
    }
    if (filteredKey === 'timesheet-employee-ids') {
      this.selectedEmployeeIds = filteredData;
    }
  this.formattedData = [];
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term,
      client_ids: this.selectedClientIds,
      job_ids: this.selectedJobIds,
      employee_ids: this.selectedEmployeeIds,
    });
  }
   exportCsvOrPdf(fileType) {
     let query = buildPaginationQuery({
       page: this.page,
       pageSize: this.tableSize,
     });
     query += this.client_id ? `&client=${this.client_id}` : '';
     query += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
        if (this.selectedClientIds?.length) {
          query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
        }
        if (this.selectedJobIds?.length) {
          query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
        }
        // if (this.selectedStatusIds?.length) {
        //   query += `&job-status-ids=[${this.selectedStatusIds.join(',')}]`;
        // }
        if (this.selectedEmployeeIds?.length) {
         query += `&timesheet-employee-ids=[${this.selectedEmployeeIds.join(',')}]`;
       }
        if(this.time?.start_date && this.time?.end_date){
         query += `&start-date=${this.time?.start_date}&end-date=${this.time?.end_date}`;
       }

        // const startDate = this.fromDate?.start_date ?? this.time.start_date;
        // const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
        // query += `&from-date=${formattedStartDate}`;
// &job-status=[${this.statusList}]
     const url = `${environment.live_url}/${environment.job_reports}/${query}&report-type=timesheet-summary-report-new&file-type=${fileType}`;
     downloadFileFromUrl({
       url,
       fileName: 'VLP - Timesheet-summary-report',
       fileType
     });
   }
   getClientList(){
  let query = `?status=True`;
   query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
    this.api.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe((res: any) => {
      if(res){
        this.clientName = res?.map((item: any) => ({
          id: item.id,
          name: item.client_name
        }));
      }
    })
    return this.clientName;
  }
    getJobList(){
      let query = `?status=${this.tabStatus}`;
      query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
      this.api.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
        if(res){
          this.jobName = res?.map((item: any) => ({
            id: item.id,
            name: item.job_name
          }));
        }
      })
      return this.jobName;
    }
  getStatusList(){
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((res: any) => {
      if(res){
        this.statusName = res?.map((item: any) => ({
          id: item.id,
          name: item.status_name
        }));
      }
    })
    // console.log('statusName',this.statusName);
    return this.statusName;
  }
  getJobTypeList(){
    this.api.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe((res: any) => {
      if(res){
        this.statusName = res?.map((item: any) => ({
          id: item.id,
          name: item.status_name
        }));
      }
    })
    // console.log('statusName',this.statusName);
    return this.statusName;
  }
  
     onSearch(term: string): void {
       this.term = term;
       this.getTableData({
         page: 1,
         pageSize: this.tableSize,
         searchTerm: term,
         client_ids: this.selectedClientIds,
         job_ids: this.selectedJobIds,
         employee_ids: this.selectedEmployeeIds,
       });
     }
  
  
  jobStatusList(status:any){
    const isActive = status === 'True';
    this.statusList = this.allJobStatus
      ?.filter((jobstatus: any) => isActive
        ? jobstatus?.status_name !== "Cancelled" && jobstatus?.status_name !== "Completed"
        : jobstatus?.status_name === "Cancelled" || jobstatus?.status_name === "Completed")
      .map((status: any) => status?.status_name);
  }
  // Send Email Action Button event
  public sendEamils(){
     let finalQuery = `?send_mail=True&file-type=pdf&report-type=job-time-report`;
     finalQuery += this.client_id ? `&client=${this.client_id}` : '';
     this.jobStatusList(this.tabStatus);
    //  finalQuery += `&job-status=[${this.statusList}]`;
      // Yet to integrate
        if(this.client_id){
                this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((respData: any) => {
                    if (respData) {
                this.api.showSuccess(respData['message']);
                 }
                  },
                  (error:any)=>{
                    this.api.showError(error?.error?.detail);
  
  }
  )
  }
  }
  public viewtimesheetDetails(item:any){
        this.dialog.open(JobTimeSheetDetailsPopupComponent, {
        panelClass: 'custom-details-dialog',
        data: { 'job_id': item?.id,'job_name':item?.job_name,'report_type':'timesheet-summary-report'}
      });
      }
  
  
      // new code
      private updateFilterColumn(key: string, cache: any) {
          this.tableConfig.columns = this.tableConfig.columns.map(col =>
            col.paramskeyId === key
              ? {
                  ...col,
                  filterOptions: cache.data,
                  currentPage: cache.page,
                  totalPages: Math.ceil(cache.total / 20)
                }
              : col
          );
        }
      
      async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string;client_ids?: any[]; job_ids?: any[];employee_ids?:any; fromdate?:any; startDate?; endDate? }) {
    let finalQuery;
     this.formattedData = [];
     const page = params?.page ?? this.page;
     const pageSize = params?.pageSize ?? this.tableSize;
     const searchTerm = params?.searchTerm ?? this.term;
    //  const today = new Date();
    //   const dayOfWeek = today.getDay(); 
    //   const startOfWeek = new Date(today);
    //   startOfWeek.setDate(today.getDate() - dayOfWeek);
    //   const endOfWeek = new Date(today);
    //   endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    //   this.time.start_date = startOfWeek.toISOString();
    //   this.time.end_date = endOfWeek.toISOString();
     const query = buildPaginationQuery({ page, pageSize, searchTerm });
     this.jobStatusList(this.tabStatus);
      finalQuery = query 
      finalQuery += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
      finalQuery += this.client_id ? `&client=${this.client_id}` : '';
      finalQuery += `&report-type=timesheet-summary-report-new`;
        if (params?.client_ids?.length) {
          finalQuery += `&client-ids=[${params.client_ids.join(',')}]`;
        }
        if (params?.job_ids?.length) {
          finalQuery += `&job-ids=[${params.job_ids.join(',')}]`;
        }
        if (params?.employee_ids?.length) {
          finalQuery += `&employee-ids=[${params.employee_ids.join(',')}]`;
        }
        if(this.directionValue && this.sortValue){
          finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
        }
      //  const selected_startDate = this.datePipe.transform(params?.fromdate?.start_date, 'yyyy-MM-dd') ;
      //  const selected_endtDate = this.datePipe.transform(params?.fromdate?.end_date, 'yyyy-MM-dd') ;
      //  const current_startDate = this.datePipe.transform(startOfWeek, 'yyyy-MM-dd')
      //  const current_endtDate = this.datePipe.transform(endOfWeek, 'yyyy-MM-dd')
       if(this.time?.start_date && this.time?.end_date){
         finalQuery += `&timesheet-start-date=${this.time?.start_date}&timesheet-end-date=${this.time?.end_date}`;
       }
      await this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((res: any) => {
        if(res.results){
        this.formattedData = res.results?.map((item: any, i: number) => ({
          sl: (page - 1) * pageSize + i + 1,
          ...item,
          is_primary:item?.employees?.find((emp: any) => emp?.is_primary === true)?.employee_name || '',
        }));
          this.tableConfig = {
              columns: tableColumns?.map(col => {
                 let filterOptions:any = [];
                  const existingCol = this.tableConfig?.columns?.find(c => c.key === col.key);
                  if (existingCol?.filterOptions?.length) {
                    filterOptions = existingCol.filterOptions;
                  } else if (col.filterable) {
                    // Fallback to initial options if none present
                    if (col.key === 'client_name') {
                        filterOptions = this.clientName;
                      }else if (col.key === 'job_name') {
                        filterOptions = this.jobName;
                      }else if (col.key === 'job_status_name') {
                        filterOptions = this.statusName;
                      }
                  }
  
                //  if (col.filterable) {
                //    if (col.key === 'client_name') {
                //      filterOptions = this.clientName;
                //    }else if (col.key === 'job_name') {
                //      filterOptions = this.jobName;
                //    }else if (col.key === 'job_status_name') {
                //      filterOptions = this.statusName;
                //    }
                //  }
                 return {
                   ...col,
                   filterOptions
                 };
               }),
         data: this.formattedData,
         searchTerm: this.term,
         actions: [],
         accessConfig: [],
         tableSize: pageSize,
         pagination: true,
         searchable: true,
         startAndEndDateFilter: true,
         reset:true,
        //  headerTabs:true,
        //  showIncludeAllJobs:true,
        //  includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
        //  includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
        //  selectedClientId:this.client_id ? this.client_id:null,
        //  sendEmail:true,
         currentPage:page,
         totalRecords: res.total_no_of_record,
         showDownload:true,
         searchPlaceholder:'Search by Client/Job/Employee',
        };
      }
      else{
        this.tableConfig = {
        columns: tableColumns?.map(col => {
                let filterOptions:any = [];
                if (col.filterable) {
                  if (col.key === 'client_name') { filterOptions = this.clientName; }
                  else if (col.key === 'job_name') { filterOptions = this.jobName; }
                 else if (col.key === 'employee_name') {
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
          searchable: true,
          // headerTabs:true,
          // showIncludeAllJobs:true,
          // includeAllJobsEnable:this.isIncludeAllJobEnable ? this.isIncludeAllJobEnable : false,
          // includeAllJobsValue:this.isIncludeAllJobValue ? this.isIncludeAllJobValue : false,
          // selectedClientId:this.client_id ? this.client_id:null,
          // sendEmail:true,
          currentPage:page,
          totalRecords: 0,
          showDownload:true,
          searchPlaceholder:'Search by Client/Job/Status',
        };
      }
  
     },(error:any)=>{  this.api.showError(error?.error?.detail);
     });
    }
  
      
        filterDataCache: {
        [key: string]: { data: any[], page: number, total: number, searchTerm: string }
      } = {};
      
      getFilterOptions(event: { detail: any; key: string }) {
        const { detail, key } = event;
        console.log(this.selectedClientIds,'id')
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
        if (key === 'client-ids') {
          endpoint = environment.clients;
          query += `&status=True`;
          query += this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
        }
        if (key === 'job-ids'){
          endpoint = environment.jobs
          query +=  this.userRole ==='Admin' ? '': `&employee-id=${this.user_id}`;
        } ;
        if (key === 'job-status-ids'){
          endpoint = environment.settings_job_status;
        } 
        if (key === 'timesheet-employee-ids'){
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
              'client-ids': { id: 'id', name: 'client_name' },
              'job-ids': { id: 'id', name: 'job_name' },
              'job-status-ids': { id: 'id', name: 'status_name' },
              'timesheet-employee-ids': { id: 'user_id', name: 'user__full_name' },
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
        this.getFilterOptions({ detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, key: event.column.paramskeyId });
      }
      
      // when user scrolls
      onFilterScrolled(event: any) {
        this.getFilterOptions({ detail: { page: event.page, pageSize: 10, search: event.search }, key: event.column.paramskeyId });
      }
      onFilterSearched(event: any) {
        this.getFilterOptions({ 
          detail: { page: 1, pageSize: 10, search: event.search, reset: event.reset }, 
          key: event.column.paramskeyId 
        });
      }
  }
  