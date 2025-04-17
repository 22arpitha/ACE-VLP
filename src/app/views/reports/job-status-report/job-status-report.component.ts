import { Component, OnInit } from '@angular/core';
import { tableConfig } from '../job-status-report/job-status-report-config'
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-job-status-report',
  templateUrl: './job-status-report.component.html',
  styleUrls: ['./job-status-report.component.scss']
})
export class JobStatusReportComponent implements OnInit {

 BreadCrumbsTitle: any = 'Job Status Report';
   term: string = '';
   tableSize: number = 10;
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
   tabStatus:any='';
   constructor(private common_service:CommonServiceService) { }
 
   ngOnInit(): void {
     this.common_service.setTitle(this.BreadCrumbsTitle)
     this.tableConfig = tableConfig;
   }
 
   handleAction(event: { actionType: string; action: any }) {
    switch (event.actionType) {
      case 'headerTabs':
        switch (event.action) {
          case 'current':
            this.tabStatus = true;
            break;
          case 'history':
            this.tabStatus = false;
            break;
        }
        this.onTableDataChange(event);
        console.log('View action triggered for row:', event.action);
        break;
    }
   }
   onTableDataChange(event:any){
     this.page = event;
     let query = `?page=${this.page}&page_size=${this.tableSize}status=${this.tabStatus}`
     if(this.term){
       query +=`&search=${this.term}`
     }
   }
   onTableSizeChange(event:any): void {
     if(event){
 
     this.tableSize = Number(event.value);
     let query = `?page=${1}&page_size=${this.tableSize}`
     if(this.term){
       query +=`&search=${this.term}`
     }
     }
   }
   onChangeSort(event:any){
     this.onTableDataChange(event)
   }

}
