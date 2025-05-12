import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableColumns } from './productive-hours-config';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
@Component({
  selector: 'app-productive-hours',
  templateUrl: './productive-hours.component.html',
  styleUrls: ['./productive-hours.component.scss']
})
export class ProductiveHoursComponent implements OnInit,OnChanges {
@Input() dropdwonFilterData:any;
  BreadCrumbsTitle: any = 'Productive Hours';
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
    tableSize: this.tableSize,
    pagination: true,
    showDownload:true,
  };
  user_id:any;
  userRole:any;
  constructor(
    private common_service:CommonServiceService,
    private api:ApiserviceService
  ) { 
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dropdwonFilterData']) {
      const prev = changes['dropdwonFilterData'].previousValue || {};
      const current = changes['dropdwonFilterData'].currentValue;
      const employeeIdChanged = prev.employee_id !== current.employee_id;
      const periodicityChanged = prev.periodicity !== current.periodicity;
      const periodChanged = prev.period !== current.period;
      if (employeeIdChanged || periodicityChanged || periodChanged) {
        this.dropdwonFilterData = current;
        this.getTableData({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
      }
    }
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.getTableData({
      page: 1,
      pageSize: this.tableSize,
      searchTerm: this.term
    });
  }

  // Called when user changes page number from the dynamic table
onTableDataChange(event: any) {
  const page = event;
  this.page = page;
  this.getTableData({
    page: page,
    pageSize: this.tableSize,
    searchTerm: this.term
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
      searchTerm: this.term
    });
  }

}

// Called from <app-dynamic-table> via @Output actionEvent
handleAction(event: { actionType: string; detail: any }) {
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
      this.exportCsvOrPdf(event.detail);
      break;
      case 'export_pdf':
      this.exportCsvOrPdf(event.detail);
      break;
    default:
      console.warn('Unhandled action type:', event.actionType);
  }
}
exportCsvOrPdf(fileType) {
  let query = buildPaginationQuery({
    page: this.page,
    pageSize: this.tableSize,
    searchTerm :this.term
  });
  if(query){
    if(this.dropdwonFilterData){
      query+= this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}`:this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
      query+= this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}`:'';
      query+= this.dropdwonFilterData.period ? `&period=${this.dropdwonFilterData.period}`:'';
      query+= this.dropdwonFilterData.employee_id || this.dropdwonFilterData.periodicity || this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'';
    }else{
      query += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
     }
   }
  const url = `${environment.live_url}/${environment.productivity_reports}/${query}&file-type=${fileType}&productivity-type=productive-hour`;
  downloadFileFromUrl({
    url,
    fileName: 'productive_hours_report',
    fileType
  });
}
 // Fetch table data from API with given params
         getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
          let finalQuery;
           const page = params?.page ?? this.page;
           const pageSize = params?.pageSize ?? this.tableSize;
           const searchTerm = params?.searchTerm ?? this.term;
           const query = buildPaginationQuery({ page, pageSize, searchTerm });
           finalQuery=query+ `&productivity-type=productive-hour`;
           if(this.dropdwonFilterData){
            finalQuery+= this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}`:this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
            finalQuery+= this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}`:'';
            finalQuery+= this.dropdwonFilterData.period ? `&period=${this.dropdwonFilterData.period}`:'';
            finalQuery+= this.dropdwonFilterData.employee_id || this.dropdwonFilterData.periodicity || this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'';
          }else{
            finalQuery += this.userRole ==='Admin' ? '':`&employee-id=${this.user_id}`;
           }
           this.api.getData(`${environment.live_url}/${environment.jobs}/${finalQuery}`).subscribe((res: any) => {
            const formattedData = res.results.map((item: any, i: number) => ({
              sl: (page - 1) * pageSize + i + 1,
              ...item,
            }));
            let tableFooterContent = {'total_estimated_time':res?.total_estimated_time,'total_actual_time':res?.total_actual_time,'total_productive_hour':res?.total_productive_hour}
            this.tableConfig = {
              columns: tableColumns.map(col => ({
                ...col,
              })),
             data: formattedData ? formattedData : [],
             searchTerm: this.term,
             actions: [],
             accessConfig: [],
             tableSize: pageSize,
             pagination: true,
             searchable: true,
             average_productive_hour:true,
             currentPage:page,
             totalRecords: res.total_no_of_record,
             hideDownload:true,
             tableFooterContent:tableFooterContent,
             showDownload:true,
            };
           },(error:any)=>{  this.api.showError(error?.error?.detail);
           });
         }
        
           onSearch(term: string): void {
             this.term = term;
             this.getTableData({
               page: 1,
               pageSize: this.tableSize,
               searchTerm: term
             });
           }
        
      ngOnDestroy(): void {
        this.tableConfig=null
      }

}
