import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '../../../../service/common-service.service';
import { tableColumns} from './overall-productivity-config';
import { environment } from 'src/environments/environment';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { downloadFileFromUrl } from 'src/app/shared/file-download.util';

@Component({
  selector: 'app-overall-productivity',
  templateUrl: './overall-productivity.component.html',
  styleUrls: ['./overall-productivity.component.scss']
})
export class OverallProductivityComponent implements OnInit,OnChanges {
@Input() dropdwonFilterData:any;
BreadCrumbsTitle: any = 'Overall Productivity';
        tableConfig:any = {
          columns: [],
          data: [],
          actions: [],
          accessConfig: [],
          pagination: false,
          showDownload:true,
        };
        user_role_name:any;
      user_id:any;
        constructor(private common_service:CommonServiceService,private router:Router, private api:ApiserviceService) { 
                this.user_role_name = sessionStorage.getItem('user_role_name');
                this.user_id = sessionStorage.getItem('user_id');
              }
        ngOnChanges(changes: SimpleChanges): void {
          if(changes['dropdwonFilterData']){
          const prev = changes['dropdwonFilterData'].previousValue || {};
          const current = changes['dropdwonFilterData'].currentValue;
          const employeeIdChanged = prev.employee_id !== current.employee_id;
          const periodicityChanged = prev.periodicity !== current.periodicity;
          const periodChanged = prev.period !== current.period;
          if (employeeIdChanged || periodicityChanged || periodChanged) {
            this.dropdwonFilterData = current;
            if(this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period){
              this.getOverAllProductivity();
            }
          }
          }
        }

        ngOnInit(): void {
          this.common_service.setTitle(this.BreadCrumbsTitle);
        }

         // Called from <app-dynamic-table> via @Output actionEvent
            handleAction(event: { actionType: string; detail: any }) {
              switch (event.actionType) {
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
              let query= this.getUpdateFilterQueryParams();
              query+=`&file-type=${fileType}&download=True`;
              const url = `${environment.live_url}/${environment.over_all_productivity_reports}/${query}`;
              downloadFileFromUrl({
                url,
                fileName: 'VLP - Overall-Productivity Report',
                fileType
              });
            }

        triggerAction(event: any) {
          this.handleAction(event);
        }
getOverAllProductivity(){
        let query = this.getUpdateFilterQueryParams();
        this.api.getData(`${environment.live_url}/${environment.over_all_productivity_reports}/${query}`).subscribe(
          (res:any)=>{
                        this.tableConfig = {
                          columns: tableColumns.map(col => ({
                            ...col,
                          })),
                         data: res.report_data ? [res.report_data] : [],
                         actions: [],
                         accessConfig: [],
                         pagination: false,
                         searchable: false,
                         showDownload:true,
                        };
                    },
                              (error)=>{
                                this.api.showError(error?.error?.detail);
          }
        )
       }
public getUpdateFilterQueryParams(){
  let query ='';
  if (this.dropdwonFilterData) {
    const params = [];
    if (this.dropdwonFilterData.periodicity) {
      params.push(`periodicity=${this.dropdwonFilterData.periodicity}`);
    }
    if (this.dropdwonFilterData.period) {
      params.push(`period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}`);
    }
    
     if(this.user_role_name ==='Admin')
            {
              if (this.dropdwonFilterData.employee_id) {
                params.push(`employee-id=${this.dropdwonFilterData.employee_id}`);
              }else{
                 params.push(`admin=True`);
              }
            }else{
              if (this.dropdwonFilterData.employee_id) {
                params.push(`employee-id=${this.dropdwonFilterData.employee_id}`);
              }else{
                params.push(`employee-id=${this.user_id}`);
              }
            }
    if (params.length) {
      query = '?' + params.join('&');
    }
  }
  return query;
}
}
