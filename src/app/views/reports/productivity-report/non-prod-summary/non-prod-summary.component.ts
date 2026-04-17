import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from '../../../../service/apiservice.service';
import { JobTimeSheetDetailsPopupComponent } from '../../common/job-time-sheet-details-popup/job-time-sheet-details-popup.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-non-prod-summary',
  templateUrl: './non-prod-summary.component.html',
  styleUrls: ['./non-prod-summary.component.scss']
})
export class NonProdSummaryComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dropdwonFilterData: any;
  BreadCrumbsTitle: any = 'Non Productive Summary Report';
  term: string = '';
  tableSize: number = 50;
  page: any = 1;
  tableSizes = [50, 75, 100];
  tableConfig: any = {
    columns: [],
    data: [],
    searchTerm: '',
    actions: [],
    accessConfig: [],
    tableSize: this.tableSize,
    pagination: true,
    showDownload: true,
    total_hours: false,
  };

  user_id: string;
  user_role_name: string;
  sortValue: string = '';
  directionValue: string = '';

  constructor(
    private common_service: CommonServiceService,
    private api: ApiserviceService,
    private dialog: MatDialog,
  ) {
    this.user_id = sessionStorage.getItem('user_id') || '';
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
        if (this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period) {
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
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  onTableDataChange(event: any) {
    const page = event;
    this.page = page;
    this.getTableData({
      page: page,
      pageSize: this.tableSize,
      searchTerm: this.term
    });
  }

  onTableSizeChange(event: any): void {
    if (event) {
      const newSize = Number(event.value || event);
      this.tableSize = newSize;
      this.page = 1;
      this.getTableData({
        page: this.page,
        pageSize: this.tableSize,
        searchTerm: this.term
      });
    }
  }

  handleAction(event: { actionType: string; detail: any }) {
    switch (event.actionType) {
      case 'navigate':
        this.viewtimesheetDetails(event['row']);
        break;
      case 'tableDataChange':
        this.onTableDataChange(event.detail);
        break;
      case 'tableSizeChange':
        this.onTableSizeChange(event.detail);
        break;
      case 'search':
        this.onSearch(event.detail);
        break;
      case 'sorting':
        this.onSorting(event);
        break;
      case 'export_csv':
        this.exportCsvOrPdf(event.detail);
        break;
      case 'export_pdf':
        this.exportCsvOrPdf(event.detail);
        break;
      default:
        this.getTableData({
          page: 1,
          pageSize: this.tableSize,
          searchTerm: this.term
        });
    }
  }

  onSorting(data) {
    this.directionValue = data.detail.directionValue;
    this.sortValue = data.detail.sortValue;
    this.getTableData({
      page: this.page,
      pageSize: this.tableSize,
      searchTerm: this.term
    });
  }

  exportCsvOrPdf(fileType) {
    const search = this.term?.trim().length >= 2 ? `search=${encodeURIComponent(this.term.trim())}&` : '';
    let query = `?${search}download=true&file-type=${fileType}`;
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    if (this.dropdwonFilterData) {
      query += this.dropdwonFilterData.employee_id ? `&timesheet-employee=${this.dropdwonFilterData.employee_id}` : this.user_role_name === 'Admin' ? '' : `&timesheet-employee=${this.user_id}`;
      query += this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}` : '';
      query += this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}` : '';
      query += this.dropdwonFilterData.employee_id && this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period ? '&is_dropdown_selected=True' : '&is_dropdown_selected=False';
    } else {
      query += this.user_role_name === 'Admin' ? '' : `&timesheet-employee=${this.user_id}`;
    }
    const url = `${environment.live_url}/${environment.non_productive_summary_report}/${query}`;
    window.open(url, '_blank');
  }

  getTableData(params?: { page?: number; pageSize?: number; searchTerm?: string }) {
    const page = params?.page ?? this.page;
    const pageSize = params?.pageSize ?? this.tableSize;
    const searchTerm = params?.searchTerm ?? this.term;

    let query = buildPaginationQuery({ page, pageSize, searchTerm });
    let finalQuery = query;
    if (this.dropdwonFilterData) {
      finalQuery += this.dropdwonFilterData.employee_id ? `&timesheet-employee=${this.dropdwonFilterData.employee_id}` : this.user_role_name === 'Admin' ? '' : `&timesheet-employee=${this.user_id}`;
      finalQuery += this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}` : '';
      finalQuery += this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}` : '';
      finalQuery += this.dropdwonFilterData.employee_id && this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period ? '&is_dropdown_selected=True' : '&is_dropdown_selected=False';
    } else {
      finalQuery += this.user_role_name === 'Admin' ? '' : `&timesheet-employee=${this.user_id}`;
    }
    if (this.directionValue && this.sortValue) {
      finalQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.api.getData(`${environment.live_url}/${environment.non_productive_summary_report}/${finalQuery}`).subscribe((res: any) => {
      // Collect all unique job names across all employees
      const jobNamesSet = new Set<string>();
      (res.results || []).forEach((item: any) => {
        (item.jobs || []).forEach((job: any) => {
          jobNamesSet.add(job.job_name);
        });
      });
      const jobNames = Array.from(jobNamesSet);

      // Build dynamic columns: Sl No, Employee, [job names...], Total Time
      const dynamicColumns: any[] = [
        { label: 'Sl No', key: 'sl' },
        { label: 'Employee', key: 'employee_name', sortKey: 'employee_name', sortable: true, leftAlign: true },
      ];
      jobNames.forEach((jobName, index) => {
        dynamicColumns.push({ label: jobName, key: `job_${index}` });
      });
      // dynamicColumns.push({ label: 'Total Time', key: 'total_time', sortKey: 'total_minutes', sortable: true });

      // Flatten each employee's jobs into a flat row
      const formattedData = (res.results || []).map((item: any, i: number) => {
        const row: any = {
          sl: (page - 1) * pageSize + i + 1,
          employee_id: item.employee_id,
          employee_name: item.employee_name,
          total_time: item.total_time,
        };
        // Map each job's time to the corresponding column key
        const jobTimeMap: { [key: string]: string } = {};
        (item.jobs || []).forEach((job: any) => {
          jobTimeMap[job.job_name] = job.time;
        });
        jobNames.forEach((jobName, index) => {
          row[`job_${index}`] = jobTimeMap[jobName] || '00:00';
        });
        return row;
      });

      const tableFooterContent = { 'total_actual_time': res?.total_actual_time };
      this.tableConfig = {
        columns: dynamicColumns,
        data: formattedData ? formattedData : [],
        searchTerm: this.term,
        actions: [],
        accessConfig: [],
        tableSize: pageSize,
        pagination: true,
        searchable: true,
        currentPage: page,
        totalRecords: res.total_no_of_record,
        hideDownload: true,
        showDownload: true,
        total_hours: false,
        tableFooterContent: tableFooterContent,
        showCsv: true,
        showPdf: false,
        searchPlaceholder: 'Search by employee name',
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

  public viewtimesheetDetails(item: any) {
    this.dialog.open(JobTimeSheetDetailsPopupComponent, {
      panelClass: 'custom-details-dialog',
      data: {
        'job_id': item?.job_id, 'job_name': item?.job_name, 'employee_id': item.employee_id,
        'table_api': `${environment.vlp_timesheets}`, 'download_api': `${environment.vlp_timesheets}`,
        'download': true, showCsv: true, 'dropdwonFilterData': this.dropdwonFilterData,
        'report_type': 'non-productive-hours', 'client_id': item.client_id
      },
    });
  }

  ngOnDestroy(): void {
    this.tableConfig = null;
  }
}
