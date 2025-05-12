import { Component, Inject, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { getTableColumns } from './job-time-sheet-details-popup-config';
import { environment } from 'src/environments/environment';
import { getUniqueValues } from 'src/app/shared/unique-values.utils';
import { query } from '@angular/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-job-time-sheet-details-popup',
  templateUrl: './job-time-sheet-details-popup.component.html',
  styleUrls: ['./job-time-sheet-details-popup.component.scss']
})
export class JobTimeSheetDetailsPopupComponent implements OnInit {
  user_role_name:any;
  jobId:any;
  jobName:any;
  tableData: ({ label: string; key: string; sortable: boolean;} | { label: string; key: string; sortable: boolean; })[];
  tableConfig:any = {
    columns: [],
    data: [],
    showDownload:false,
  };
  employee_id:any;
 constructor(
     private common_service:CommonServiceService,
     private api:ApiserviceService,
     public dialogRef: MatDialogRef<JobTimeSheetDetailsPopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
   ) {
     this.user_role_name = sessionStorage.getItem('user_role_name') || '';
     this.jobId=data.job_id;
     this.jobName=data.job_name;
     this.employee_id=data.employee_id;
     if(this.jobId){

      this.getTableData();
     }
   }
 
   ngOnInit(): void {
     this.tableData = getTableColumns(this.user_role_name);
   }

   getTableData() {
    let query=`?job-ids=[${this.jobId}]`;
    query  += this.employee_id ? `&timesheet-employee=${this.employee_id}` : ``;
     this.api.getData(`${environment.live_url}/${environment.timesheet}/${query}`).subscribe((res: any) => {
       const formattedData = res;
       this.tableConfig = {
         columns:  this.tableData?.map(col => ({
           ...col
         })),
         data: formattedData ? formattedData : [],
         showDownload:false,
       };
     });
   }
}
