import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableColumns } from './qualitative-productivity-config';
import { environment } from '../../../../../environments/environment';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
import { ApiserviceService } from '../../../../service/apiservice.service';

@Component({
  selector: 'app-qualitative-productivity',
  templateUrl: './qualitative-productivity.component.html',
  styleUrls: ['./qualitative-productivity.component.scss']
})
export class QualitativeProductivityComponent implements OnInit,OnChanges {

BreadCrumbsTitle: any = 'Qualitative Productivity';
@Input() dropdwonFilterData:any;
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
            averageProductivity:true,
            showDownload:true,
          };

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
            if (changes['dropdwonFilterData']) {
              const prev = changes['dropdwonFilterData'].previousValue || {};
              const current = changes['dropdwonFilterData'].currentValue;
              const employeeIdChanged = prev.employee_id !== current.employee_id;
              const periodicityChanged = prev.periodicity !== current.periodicity;
              const periodChanged = prev.period !== current.period;
              if (employeeIdChanged || periodicityChanged || periodChanged) {
                this.dropdwonFilterData = current;
              if(this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period){
              this.getTableData({
                page: this.page,
                pageSize: this.tableSize,
                searchTerm: this.term
              });
              }
              }
            }
          }
          ngOnInit(): void {
            this.common_service.setTitle(this.BreadCrumbsTitle)
            // this.getTableData()
          }

          // Called when user changes page number from the dynamic table
        onTableDataChange(event: any) {
          // console.log('Page changed to:', event);
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
              this.getTableData({
                page: this.page,
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
              query+= this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}`:'';
              query+= this.dropdwonFilterData.employee_id || this.dropdwonFilterData.periodicity || this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'';
              }else{
              query += this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
             }
           }
          const url = `${environment.live_url}/${environment.productivity_reports}/${query}&file-type=${fileType}&productivity-type=qualitative`;
          downloadFileFromUrl({
            url,
            fileName: 'VLP - Qualitative Productivity Report',
            fileType
          });
        }

        // Fetch table data from API with given params
        getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
          const page = params?.page ?? this.page;
          const pageSize = params?.pageSize ?? this.tableSize;
          const searchTerm = params?.searchTerm ?? this.term;

          let query = buildPaginationQuery({ page, pageSize, searchTerm });
          query+=`&productivity-type=qualitative`;
          if(this.dropdwonFilterData){
            query+= this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}`:this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
            query+= this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}`:'';
            query+= this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}`:'';
            query+= this.dropdwonFilterData.employee_id || this.dropdwonFilterData.periodicity || this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'';
            }else{
            query += this.user_role_name ==='Admin' ? '':`&employee-id=${this.user_id}`;
           }
          this.api.getData(`${environment.live_url}/${environment.jobs}/${query}`).subscribe((res: any) => {
            const formattedData = res.results.map((item: any, i: number) => ({
              sl: (page - 1) * pageSize + i + 1,
              ...item
            }));
            let tableFooterContent = {'avg_qualitative_productivity':res?.avg_qualitative_productivity}
            this.tableConfig = {
             columns: tableColumns,
             data: formattedData ? formattedData : [],
             searchTerm: this.term,
             actions: [],
             accessConfig: [],
             averageProductivity:true,
             tableFooterContent:tableFooterContent,
             tableSize: pageSize,
             pagination: true,
             searchable: true,
             currentPage:page,
             totalRecords: res.total_no_of_record,
             hideDownload:true,
             showDownload:true,
            searchPlaceholder:'Search by Client/Job',
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
