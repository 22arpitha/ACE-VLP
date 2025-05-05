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
allEmployeesList:any=[];
 selectedEmployeesList:any=[];
 selectedPeriodictyDetails:any;
 selectedPeriodDetails:any;
  BreadCrumbsTitle: any = 'Overall Productivity';
        tableConfig:any = {
          columns: [],
          data: [],
          actions: [],
          accessConfig: [],
          pagination: false,
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
            this.getOverAllProductivity();
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
              const url = `${environment.live_url}/${environment.over_all_productivity_reports}/?file-type=${fileType}&productivity-type=over-all-productivity-reports`;
              downloadFileFromUrl({
                url,
                fileName: 'over_all_productivity_reports',
                fileType
              });
            }

        triggerAction(event: any) {
          this.handleAction(event);
        }
getOverAllProductivity(){
        let query = '';
        if (this.dropdwonFilterData) {
          const params = [];
          if (this.dropdwonFilterData.periodicity) {
            params.push(`periodicity=${this.dropdwonFilterData.periodicity}`);
          }
          if (this.dropdwonFilterData.period) {
            params.push(`period=${this.dropdwonFilterData.period}`);
          }
          if (this.dropdwonFilterData.employee_id) {
            this.selectedEmployeesList=[];
            params.push(`employee_id=${this.dropdwonFilterData.employee_id}`);
            this.selectedEmployeesList = [this.allEmployeesList?.find((emp:any)=>(emp?.user_id === this.dropdwonFilterData?.employee_id))];
          }else{
            this.selectedEmployeesList = this.allEmployeesList;
          }
          if(this.user_role_name !='Admin')
            {
              params.push(`logged-in-user-id=${this.user_id}`);
            }else{
              params.push(`admin=True`);
            }
          if (params.length) {
            query = '?' + params.join('&');
          }
        }
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
                        };
                    },
                              (error)=>{
                                this.api.showError(error?.error?.detail);
          }
        )
       }



}
