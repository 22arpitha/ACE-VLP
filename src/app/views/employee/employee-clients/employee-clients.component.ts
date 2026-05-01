import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { ClientContactDetailsPopupComponent } from '../../client/client-contact-details-popup/client-contact-details-popup.component';
import { IdNamePair } from '../all-employee/all-employee.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { FilterQueryService } from '../../../service/filter-query.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';

export interface FilterState {
  selectAllValue: boolean | null;
  selectedOptions: IdNamePair[];
  excludedIds: IdNamePair[];
  selectedCount: number;
}

@Component({
  selector: 'app-employee-clients',
  templateUrl: './employee-clients.component.html',
  styleUrls: ['./employee-clients.component.scss']
})
export class EmployeeClientsComponent implements OnInit {
  @ViewChild('countryFilter') countryFilter!: GenericTableFilterComponent;
  @ViewChild('sourceFilter') sourceFilter!: GenericTableFilterComponent;

  BreadCrumbsTitle: any = 'Client';
  term: any = '';
  isCurrent: boolean = true;
  isHistory: boolean = false;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    client_number: false,
    client_name: false,
    user__email: false,
    designation__designation_name: false,
    is_active: false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  allClientList: any = [];
  accessPermissions = []
  user_id: any;
  userRole: any;
  filters: { [key: string]: FilterState } = {
    country: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
    source: { selectAllValue: null, selectedOptions: [], excludedIds: [], selectedCount: 0 },
  }
  allCountriesNames: IdNamePair[] = [];
  allSourceNames: IdNamePair[] = [];
  filteredList = [];
  filterQuery: string;
  constructor(
    private common_service: CommonServiceService,
    private dialog: MatDialog, private dropdownService: DropDownPaginationService,
    private apiService: ApiserviceService, private activeRoute: ActivatedRoute,
    private filterQueryService: FilterQueryService) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.common_service.setTitle('Client Details');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.user_id = this.activeRoute.snapshot.paramMap.get('id');
    }
  }
  
  ngOnInit() {
    this.filterData();
  }


  public getCurrentClientList() {
    this.isHistory = false;
    this.isCurrent = true;
     this.filterData();
    // let query = `${this.getFilterBaseUrl()}&status=True`;
    // this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
    //   (res: any) => {
    //     this.allClientList = res?.results;
    //     this.filteredList = res?.results;
    //     const noOfPages: number = res?.['total_pages']
    //     this.count = noOfPages * this.tableSize;
    //     this.count = res?.['total_no_of_record']
    //     this.page = res?.['current_page'];
    //   }, (error: any) => {
    //     this.apiService.showError(error?.error?.detail);
    //   });
  }

  public getClientHistoryList() {
    this.isCurrent = false;
    this.isHistory = true;
     this.filterData();
    // let query = `${this.getFilterBaseUrl()}&status=False`;
    // this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
    //   (res: any) => {
    //     this.allClientList = res?.results;
    //     this.filteredList = res?.results;
    //     const noOfPages: number = res?.['total_pages']
    //     this.count = noOfPages * this.tableSize;
    //     this.count = res?.['total_no_of_record']
    //     this.page = res?.['current_page'];
    //   }, (error: any) => {
    //     this.apiService.showError(error?.error?.detail);
    //   });
  }
  public getCurrentClients() {
    this.page = 1;
    this.tableSize = 50;
    this.getCurrentClientList();
  }

  public getClientsHistory() {
    this.page = 1;
    this.tableSize = 50;
    this.getClientHistoryList();
  }

  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.filterData()
    }
  }

  public onTableDataChange(event: any) {
    this.page = event;
    this.filterData()
  }
  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.filterData();
    }
    else if (!this.term) {
      this.filterData();
    }
  }

  public getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&employee-id=${this.user_id}`;
  }
  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  public viewContactDetails(item: any) {
    this.dialog.open(ClientContactDetailsPopupComponent, {
      panelClass: 'custom-details-dialog',
      data: { contact_details: item?.contact_details }
    });
  }
  public downloadOption(type: any) {
    let status: any
    if (this.isCurrent) {
      status = 'True';
    }
    else {
      status = 'False';
    }
    let query = '';
    if (this.filterQuery) {
      query = this.filterQuery + `&file-type=${type}&status=${status}`
    } else {
      query = `?page=${this.page}&page_size=${this.tableSize}&file-type=${type}&status=${status}`
      query += this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';
    }
    let apiUrl = `${environment.live_url}/${environment.clients_details}/${query}`;
    fetch(apiUrl)
      .then(res => res.blob())
      .then(blob => {
        // console.log('blob',blob);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `client_details.${type}`;
        a.click();
      });
  }
  filterData() {
    this.filterQuery = this.getFilterBaseUrl()

    // Apply filter logic for country and source
    this.filterQuery += this.buildFilterQuery('country');
    this.filterQuery += this.buildFilterQuery('source');

    if (this.isCurrent) {
      this.filterQuery += `&status=True`;
    }
    else {
      this.filterQuery += `&status=False`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${this.filterQuery}`).subscribe((res: any) => {
      this.allClientList = res?.results;
      this.filteredList = res?.results;
      this.count = res?.['total_no_of_record'];
      this.page = res?.['current_page'];
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.filterData();
  }

  fetchCountry = (page: number, search: string) => {
    return this.dropdownService.fetchDropdownData$(
      environment.settings_country,
      page,
      search,
      (item) => ({ id: item.id, name: item.country_name }),
    );
  };

  fetchSource = (page: number, search: string) => {
    return this.dropdownService.fetchDropdownData$(
      environment.settings_source,
      page,
      search,
      (item) => ({ id: item.id, name: item.source_name }),
    );
  };


  private getFilterParamName(filterType: string): string {
    const mapping: { [key: string]: string } = {
      'country': 'country',
      'source': 'source'
    };
    return mapping[filterType] || filterType;
  }

  private buildFilterQuery(filterType: string): string {
    return this.filterQueryService.buildFilterSegment(this.filters[filterType], this.getFilterParamName(filterType));
  }

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
}
