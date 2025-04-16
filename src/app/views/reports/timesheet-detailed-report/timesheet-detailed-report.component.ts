import { Component, OnInit } from '@angular/core';
import { tableConfig } from './timesheet-detailed-config';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-timesheet-detailed-report',
  templateUrl: './timesheet-detailed-report.component.html',
  styleUrls: ['./timesheet-detailed-report.component.scss']
})
export class TimesheetDetailedReportComponent implements OnInit {
  BreadCrumbsTitle: any = 'Timesheet Detailed Report';
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
  constructor(private common_service:CommonServiceService) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.tableConfig = tableConfig;
  }

  handleAction(event: { actionType: string; row: any }) {}
  onTableDataChange(event:any){
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
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
