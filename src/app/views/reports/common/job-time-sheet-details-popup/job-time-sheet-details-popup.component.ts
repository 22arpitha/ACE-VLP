import { Component, Inject, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { getTableColumns } from './job-time-sheet-details-popup-config';
import { environment } from '../../../../../environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { buildPaginationQuery } from 'src/app/shared/pagination.util';
import { getUniqueValues } from 'src/app/shared/unique-values.utils';

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
    private api: ApiserviceService,
    public dialogRef: MatDialogRef<JobTimeSheetDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.user_role_name = sessionStorage.getItem('user_role_name') || '';
    this.jobId = data.job_id;
    this.jobName = data.job_name;
    this.employee_id = data.employee_id;
  }

  ngOnInit(): void {
    this.tableData = getTableColumns(this.user_role_name);
    if (this.jobId) {
      this.getTableData();
    }
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


  async getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string, startDate?: string; endDate?: string }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    let query = buildPaginationQuery({ page, pageSize });
    query += `&job-ids=[${this.jobId}]`;
    query += this.employee_id ? `&timesheet-employee=${this.employee_id}` : ``;
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.api.getData(`${environment.live_url}/${environment.timesheet}/${query}`).subscribe((res: any) => {
      const formattedData = res.results.map((item: any, i: number) => ({
        sl: (page - 1) * pageSize + i + 1,
        ...item
      }));
      this.tableConfig = {
        columns: this.tableData?.map(col => ({
          ...col,
          filterOptions: col.filterable ? getUniqueValues(formattedData, col.key) : []
        })),

        data: formattedData ? formattedData : [],
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: false,
        currentPage: page,
        totalRecords: res.total_no_of_record,
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
