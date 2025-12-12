import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { getTableColumns } from './job-time-sheet-details-popup-config';
import { environment } from '../../../../../environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { buildPaginationQuery } from 'src/app/shared/pagination.util';
import { getUniqueValues } from 'src/app/shared/unique-values.utils';
import { DatePipe } from '@angular/common';
import { downloadFileFromUrl } from 'src/app/shared/file-download.util';

@Component({
  selector: 'app-job-time-sheet-details-popup',
  templateUrl: './job-time-sheet-details-popup.component.html',
  styleUrls: ['./job-time-sheet-details-popup.component.scss']
})
export class JobTimeSheetDetailsPopupComponent implements OnInit {
  user_role_name: any;
  jobId: any;
  jobName: any;
  tableSize: number = 50;
  page: any = 1;
  tableData: ({ label: string; key: string; sortable: boolean; filterable?: boolean; filterType?: boolean; } | { label: string; key: string; sortable: boolean; filterable: boolean; filterType: string; })[];
  // tableData: ({ label: string; key: string; sortable: boolean;} | { label: string; key: string; sortable: boolean; })[];
  tableConfig: any = {
    columns: [],
    data: [],
    showDownload: false,
    tableSize: 50,
    pagination: true,
    actions: [],
    accessConfig: [],
  };
  employee_id: any;
  sortValue: string = '';
  directionValue: string = '';
  constructor(
    private common_service: CommonServiceService,
    private cdr: ChangeDetectorRef,
    private api: ApiserviceService,
    private datePipe:DatePipe,
    public dialogRef: MatDialogRef<JobTimeSheetDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data)
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
    // this.jobId = data.job_id;
    // this.jobName = data.job_name;
    // this.employee_id = data.employee_id;
  }

  ngOnInit(): void {
    this.jobId = this.data.job_id;
    this.jobName = this.data.job_name;
    this.employee_id = this.data.employee_id;
    // this.cdr.detectChanges();
    this.tableData = getTableColumns(this.user_role_name);
    setTimeout(() => {
    if (this.jobId) {
      this.getTableData();
    }
  }, 0);
  }


  onTableDataChange(event: any) {
    const page = event;
    this.page = page;

    this.getTableData({
      page: page,
      pageSize: this.tableSize,
    });
  }
  // Called when user changes page size from the dynamic table
  onTableSizeChange(event: any): void {
    if (event) {
      const newSize = Number(event.value || event);
      this.tableSize = newSize;
      this.page = 1; // reset to first page
      this.getTableData({
        page: this.page,
        pageSize: this.tableSize,
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
      case 'export_csv':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'sorting':
        this.onSorting(event);
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
        });
    }
  }


  onSorting(data) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
    });
  }

  exportCsvOrPdf(fileType) {
    console.log(this.data)
    let query : string = ''
    let query_end_point:string;
    if(this.data.report_type==='non-productive-hours'){
      query_end_point = `${environment.non_productivity}`
       query += `client-name='Vedalekha professionals'&job-ids=${this.data?.job_id}&timesheet-employee=${this.employee_id}`
       query += this.data.dropdwonFilterData.periodicity ? `&periodicity=${this.data.dropdwonFilterData.periodicity}`:'';
       query += this.data.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.data.dropdwonFilterData.period))}`:'';
    }
      // let query = buildPaginationQuery({
      //   page: this.page,
      //   pageSize: this.tableSize,
      // });
      // query += this.client_id ? `&client=${this.client_id}` : '';
      // query += (this.userRole ==='Admin' || (this.userRole !='Admin' && this.client_id)) ? '':`&employee-id=${this.user_id}`;
      //    if (this.selectedClientIds?.length) {
      //      query += `&client-ids=[${this.selectedClientIds.join(',')}]`;
      //    }
      //    if (this.selectedJobIds?.length) {
      //      query += `&job-ids=[${this.selectedJobIds.join(',')}]`;
      //    }
      //    // if (this.selectedStatusIds?.length) {
      //    //   query += `&job-status-ids=[${this.selectedStatusIds.join(',')}]`;
      //    // }
      //    if (this.selectedEmployeeIds?.length) {
      //     query += `&employee-ids=[${this.selectedEmployeeIds.join(',')}]`;
      //   }
      //    if(this.time?.start_date && this.time?.end_date){
      //     query += `&timesheet-start-date=${this.time?.start_date}&timesheet-end-date=${this.time?.end_date}`;
      //   }
 
         // const startDate = this.fromDate?.start_date ?? this.time.start_date;
         // const formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd');
         // query += `&from-date=${formattedStartDate}`;
 // &job-status=[${this.statusList}]
      const url = `${environment.live_url}/${query_end_point}/?${query}&file-type=${fileType}`;
      downloadFileFromUrl({
        url,
        fileName: `VLP - ${this.data.report_type}`,
        fileType
      });
    }

  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string, startDate?: string; endDate?: string }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    let query = buildPaginationQuery({ page, pageSize });
    if(this.data.report_type==='timesheet-summary-report'){
      query += `&only-processing=${true}`
    } 
    if(this.data.report_type==='job-time-report'){
       query += `&timesheet-report-type=job-time-report`
    }
    if(this.data?.report_type==='job-time-report'){
       query += `&timesheet-report-type=job-time-report`
    }
    if(this.data.report_type==='non-productive-hours'){
      query += `&client=${this.data.client_id}`;
      query += this.data.dropdwonFilterData.periodicity ? `&periodicity=${this.data.dropdwonFilterData.periodicity}`:'';
       query += this.data.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.data.dropdwonFilterData.period))}`:'';
    }
    query += `&job-ids=[${this.jobId}]`;
    query += this.employee_id ? `&timesheet-employee=${this.employee_id}` : ``;
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.api.getData(`${environment.live_url}/${environment.vlp_timesheets}/${query}`).subscribe((res: any) => {
      const formattedData = res.results.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item,
       date: this.datePipe.transform(item.date, 'dd/MM/yyyy'),
      }));
      const noOfPages: number = res?.total_pages
      this.tableConfig = {
        columns: this.tableData?.map(col => ({
          ...col,
          filterOptions: col.filterable ? getUniqueValues(formattedData, col.key) : []
        })),

        data: formattedData ? formattedData : [],
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        currentPage: page,
        totalRecords : noOfPages * this.tableSize,
        // totalRecords: res.total_no_of_record,
        showDownload:this.data.download
      };
    });
  }


  //    const formattedData = res;
  //    this.tableConfig = {
  //      columns:  this.tableData?.map(col => ({
  //        ...col
  //      })),
  //      data: formattedData ? formattedData : [],
  //      showDownload:false,

  //    };
  //  });
  //  }
}
