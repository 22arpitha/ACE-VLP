import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { tableColumns } from './work-culture-and-work-ethics-config';
import { environment } from '../../../../../environments/environment';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
import { ApiserviceService } from '../../../../service/apiservice.service';

@Component({
  selector: 'app-work-culture-and-work-ethics',
  templateUrl: './work-culture-and-work-ethics.component.html',
  styleUrls: ['./work-culture-and-work-ethics.component.scss']
})
export class WorkCultureAndWorkEthicsComponent implements OnInit,OnChanges {

 BreadCrumbsTitle: any = 'Work Culture and Work Ethics';
 @Input() dropdwonFilterData:any;
 selectedPeriodDetails:any;
 selectedPeriodId:any;
 selectedperiodicityId:any;
      term: string = '';
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
      constructor(
        private common_service:CommonServiceService,
        private api:ApiserviceService
      ) { 
        this.user_role_name = sessionStorage.getItem('user_role_name');
        this.user_id = sessionStorage.getItem('user_id');
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
            if(this.dropdwonFilterData.period){
            this.getWorkCultureAndEthicsList();
            }
          }
        }
      }

      ngOnInit(): void {
        this.common_service.setTitle(this.BreadCrumbsTitle);
      }

      workCultureData:any =[]
      getWorkCultureAndEthicsList(){
        this.selectedperiodicityId=null;
        let query = this.getUpdateFilterQueryParams();
        this.api.getData(`${environment.live_url}/${environment.upload_assessment}/${query}`).subscribe(
          (res:any)=>{
            this.selectedperiodicityId = Number(res.periodicity_id);
                        const formattedData = res.data?.map((item: any, i: number) => ({
                          sl: i + 1,
                          ...item,
                        }));
                        // console.log(formattedData);
                        this.tableConfig = {
                          columns: tableColumns.map(col => ({
                            ...col,
                          })),
                         data: formattedData ? formattedData : [],
                         actions: [],
                         accessConfig: [],
                         pagination: false,
                         searchable: false,
                         formContent:true,
                         sendWorkCulture:true,
                         tableSize: formattedData.length,
                         totalRecords: formattedData.length,
                         showDownload:true,
                         showCsv:true,
                         showPdf:false,
                        };
                    },
                              (error)=>{
                                this.api.showError(error?.error?.detail);
          }
        )
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
          case 'submitWorkCulture':
          this.submitWorkCultureDetails(event['action']);
          break;
        default:
          console.warn('Unhandled action type:', event.actionType);
      }
    }
    exportCsvOrPdf(fileType) {
      let query= this.getUpdateFilterQueryParams();
      query+=`&file-type=${fileType}&download=True`;
      const url = `${environment.live_url}/${environment.upload_assessment}/${query}`;
      downloadFileFromUrl({
        url,
        fileName: 'work_culture_and_ethics_details',
        fileType
      });
    }
      onSearch(term: string): void {
        this.term = term;
      }

      public submitWorkCultureDetails(data:any){
        data['year']=Number(this.dropdwonFilterData.period['year']),
        // console.log('data',data);
        this.api.postData(`${environment.live_url}/${environment.upload_assessment}/`, data).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.getWorkCultureAndEthicsList();
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      }

      public getUpdateFilterQueryParams(){
        let query ='';
        if (this.dropdwonFilterData) {
          const params = [];
          const isDropdownSelected =
            !!(
              this.dropdwonFilterData.employee_id &&
              this.dropdwonFilterData.periodicity &&
              this.dropdwonFilterData.period
            );

          params.push(`is_dropdown_selected=${isDropdownSelected ? 'True' : 'False'}`);
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
