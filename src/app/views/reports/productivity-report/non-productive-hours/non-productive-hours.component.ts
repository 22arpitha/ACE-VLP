import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableColumns } from './non-productive-hours-config';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
import { JobTimeSheetDetailsPopupComponent } from '../../common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-non-productive-hours',
  templateUrl: './non-productive-hours.component.html',
  styleUrls: ['./non-productive-hours.component.scss']
})
export class NonProductiveHoursComponent implements OnInit,OnChanges {
@Input() dropdwonFilterData:any;
  BreadCrumbsTitle: any = 'Non Productive Hours';
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

  user_id: string;
  user_role_name: string;
     constructor(
       private common_service:CommonServiceService,
       private api:ApiserviceService,
       private dialog:MatDialog,
     ) {
      this.user_id = sessionStorage.getItem('user_id') || '' ;
      this.user_role_name = sessionStorage.getItem('user_role_name') || '';
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
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term
      });
     }

     // Called when user changes page number from the dynamic table
   onTableDataChange(event: any) {
     console.log('Page changed to:', event);
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
       default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
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
        query+= this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}`:this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
        query+= this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}`:'';
        query+= this.dropdwonFilterData.period ? `&period=${this.dropdwonFilterData.period}`:'';
       }else{
        query += this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
       }
     }
     const url = `${environment.live_url}/${environment.productivity_reports}/${query}&file-type=${fileType}&productivity-type=non-productive-hour`;
     downloadFileFromUrl({
       url,
       fileName: 'non_productive_hours',
       fileType
     });
   }

   // Fetch table data from API with given params
   getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
     const page = params?.page ?? this.page;
     const pageSize = params?.pageSize ?? this.tableSize;
     const searchTerm = params?.searchTerm ?? this.term;

     let query = buildPaginationQuery({ page, pageSize, searchTerm });
     let finalQuery = query;
      if(this.dropdwonFilterData){
       finalQuery += this.dropdwonFilterData.employee_id ? `&timesheet-employee=${this.dropdwonFilterData.employee_id}`:this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
       finalQuery += this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}`:'';
       finalQuery += this.dropdwonFilterData.period ? `&period=${this.dropdwonFilterData.period}`:'';
      }else{
       finalQuery += this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
      }
     this.api.getData(`${environment.live_url}/${environment.timesheet}/${finalQuery}&client-name=Vedalekha professionals`).subscribe((res: any) => {
       const formattedData = res.results.map((item: any, i: number) => ({
         sl: (page - 1) * pageSize + i + 1,
         ...item
       }));
       this.tableConfig = {
        columns: tableColumns,
        data: formattedData ? formattedData : [],
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        currentPage:page,
        totalRecords: res.total_no_of_record,
        hideDownload:true,
        showDownload:true,
      };
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
public viewtimesheetDetails(item:any){
      this.dialog.open(JobTimeSheetDetailsPopupComponent, {
      panelClass: 'custom-details-dialog',
      data: { 'job_id': item?.job_id,'job_name':item?.job_name,'employee_id':item.employee_id
},
    });
    }
  }

