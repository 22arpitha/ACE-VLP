import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableColumns } from './non-productive-hours-config';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
@Component({
  selector: 'app-non-productive-hours',
  templateUrl: './non-productive-hours.component.html',
  styleUrls: ['./non-productive-hours.component.scss']
})
export class NonProductiveHoursComponent implements OnInit,OnChanges {
@Input() dropdwonFilterData:any;
  BreadCrumbsTitle: any = 'Non Productive Hours';
   term: string = '';
     tableSize: number = 5;
     page: any = 1;
     tableSizes = [5,10,25,50,100];
     tableConfig:any = {
       columns: [],
       data: [],
       searchTerm: '',
       actions: [],
       accessConfig: [],
       tableSize: 10,
       pagination: true,
     };
     data = [
       {
         sl:1,
         client_name:'Abin Joy',
         job_number:'10',
         job_name:'Development',
         task:'Testing',
         actual_time:'20'
       },
       {
        sl:2,
        client_name:'Abin Joy',
        job_number:'10',
        job_name:'Development',
        task:'Testing',
        actual_time:'20'
      },
      {
        sl:3,
        client_name:'Abin Joy',
        job_number:'10',
        job_name:'Development',
        task:'Testing',
        actual_time:'20'
      },
     ]
  user_id: string;
  user_role_name: string;
     constructor(
       private common_service:CommonServiceService,
       private api:ApiserviceService
     ) {
      this.user_id = sessionStorage.getItem('user_id') || '' ;
      this.user_role_name = sessionStorage.getItem('user_role_name') || '';
      }
      ngOnChanges(changes: SimpleChanges): void {
        if(changes['dropdwonFilterData']){
          this.dropdwonFilterData=changes['dropdwonFilterData']?.currentValue;
        }
      }

     ngOnInit(): void {
       this.common_service.setTitle(this.BreadCrumbsTitle)
       this.getTableData()
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
     const query = buildPaginationQuery({
       page: this.page,
       pageSize: this.tableSize,
     });

     const url = `${environment.live_url}/${environment.timesheet_reports}/${query}&file-type=${fileType}&timsheet-type=detailed`;
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
     if(this.user_role_name !== 'Admin'){
      query +=`&employee-id=${this.user_id}`
      }
     this.api.getData(`${environment.live_url}/${environment.jobs}/${query}&client-name=Vedalekha professionals`).subscribe((res: any) => {
       const formattedData = res.results.map((item: any, i: number) => ({
         sl: (page - 1) * pageSize + i + 1,
         ...item
       }));
       this.tableConfig = {
        columns: tableColumns,
        data: formattedData,
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        currentPage:page,
        totalRecords: res.total_no_of_record,
        hideDownload:true
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

  }

