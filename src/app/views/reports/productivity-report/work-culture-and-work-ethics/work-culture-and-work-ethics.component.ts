import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableColumns } from './work-culture-and-work-ethics-config';
import { environment } from '../../../../../environments/environment';
import { downloadFileFromUrl } from '../../../../shared/file-download.util';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { log } from 'console';

@Component({
  selector: 'app-work-culture-and-work-ethics',
  templateUrl: './work-culture-and-work-ethics.component.html',
  styleUrls: ['./work-culture-and-work-ethics.component.scss']
})
export class WorkCultureAndWorkEthicsComponent implements OnInit,OnChanges {

 BreadCrumbsTitle: any = 'Work Culture and Work Ethics';
 @Input() dropdwonFilterData:any;
 allEmployeesList:any=[];
 selectedEmployeesList:any=[];
 selectedPeriodictyDetails:any;
 selectedPeriodDetails:any;
      term: string = '';
      tableConfig:any = {
        columns: [],
        data: [],
        actions: [],
        accessConfig: [],
        pagination: false,
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
            this.getSelectedPeriod(this.dropdwonFilterData.period);
            }
            setTimeout(() => {
              this.getWorkCultureAndEthicsList();
            }, 100);
          }
        }
      }

      ngOnInit(): void {
        this.common_service.setTitle(this.BreadCrumbsTitle);
        this.getAllEmployeeList();
      }

      public getAllEmployeeList(){
        let queryparams=`?is_active=True&employee=True`;
        if (this.user_role_name === 'Accountant') {
          queryparams += `&employee_id=${this.user_id}`;
        } else if (this.user_role_name === 'Manager') {
          queryparams += `&reporting_manager_id=${this.user_id}`;
        }
        this.allEmployeesList =[];
        this.selectedEmployeesList=[];
        this.api.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
         this.allEmployeesList = respData;
         this.selectedEmployeesList=this.allEmployeesList;
        },(error => {
          this.api.showError(error?.error?.detail)
        }));
      }

      public getSelectedPeriod(id: any) {
        this.selectedPeriodDetails='';
        this.api.getData(`${environment.live_url}/${environment.settings_period}/${id}/`).subscribe((respData: any) => {
        this.selectedPeriodDetails = respData;
        console.log(this.selectedPeriodDetails);
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        })
      }

      workCultureData:any =[]
      getWorkCultureAndEthicsList(){
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
          if (params.length) {
            query = '?' + params.join('&');
          }
        }
        this.api.getData(`${environment.live_url}/${environment.upload_assessment}/${query}`).subscribe(
          (res:any)=>{
            console.log('res',res)
                        const formattedData = this.constructTableForm(this.selectedPeriodDetails);
                        console.log(formattedData);
                        this.tableConfig = {
                          columns: tableColumns.map(col => ({
                            ...col,
                          })),
                         data: formattedData,
                         actions: [],
                         accessConfig: [],
                         pagination: false,
                         searchable: false,
                         formContent:true,
                         sendWorkCulture:true,
                         tableSize: formattedData.length,
                         totalRecords: formattedData.length
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
      const url = `${environment.live_url}/${environment.timesheet_reports}/?file-type=${fileType}&timsheet-type=detailed`;
      downloadFileFromUrl({
        url,
        fileName: 'timesheet_details',
        fileType
      });
    }
      onSearch(term: string): void {
        this.term = term;
      }

      public submitWorkCultureDetails(data:any){
        this.api.postData(`${environment.live_url}/${environment.upload_assessment}/`, data).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.getWorkCultureAndEthicsList();
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      }
      constructTableForm(selectedPeriodDetails){
        this.workCultureData=[];
        const hasMonthData = selectedPeriodDetails && selectedPeriodDetails.month_data != null;
        let index = 1;
        this.workCultureData = hasMonthData
          ? selectedPeriodDetails.month_data.flatMap(month =>
              this.selectedEmployeesList?.map(emp => ({
                sl: index++,
                employee_name: emp?.user__full_name,
                employee_id:emp?.user_id,
                month: month,
                points: null,
                work_ethics_file: null,
                periodicity_id:this.dropdwonFilterData.periodicity,
                period_id:this.dropdwonFilterData.period
              }))
            )
          : this.selectedEmployeesList?.map((emp, idx) => ({
              sl: (idx+1),
              employee_name: emp?.user__full_name,
              employee_id:emp?.user_id,
              month: selectedPeriodDetails?.period_name,
              points: null,
              work_ethics_file: null,
              periodicity_id:this.dropdwonFilterData.periodicity,
              period_id:this.dropdwonFilterData.period
            }));
            
            return this.workCultureData ? this.workCultureData : [];

      }
}
