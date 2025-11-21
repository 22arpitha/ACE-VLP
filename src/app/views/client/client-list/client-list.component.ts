import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { SortPipe } from '../../../shared/sort/sort.pipe';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { ClientContactDetailsPopupComponent } from '../client-contact-details-popup/client-contact-details-popup.component';
import { DatePipe } from '@angular/common';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';


export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  providers: [
    SortPipe
  ]
})
export class ClientListComponent implements OnInit {
  @ViewChild('countryFilter') countryFilter!: GenericTableFilterComponent;
  @ViewChild('sourceFitrer') sourceFilter!: GenericTableFilterComponent;
  private searchSubject = new Subject<string>();
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
    country_name: false,
    source_name: false,
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
  filters: { country: string[], source: string[] } = {
    country: [],
    source: [],
  }
  allCountriesNames: IdNamePair[] = [];
  allSourceNames: IdNamePair[] = [];
  filteredList = [];
  filterQuery: string;
  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private router: Router,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private apiService: ApiserviceService,
    private dropdownService: DropDownPaginationService,
    private http: HttpClient,
    private datePipe: DatePipe) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');

    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.getCurrentClientList();
  }

  ngOnInit() {
    this.getModuleAccess();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((term: string) => term === '' || term.length >= 2)
    ).subscribe((search: string) => {
      this.term = search
      this.filterData();
    });
    // this.getAllCountryList();
    // this.getAllSourceList();
  }

  public getAllCountryList() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_country}/`).subscribe(
      (res: any) => {
        if (res && res.length >= 1) {
          this.allCountriesNames = res?.map(((con: any) => ({ id: con.id, name: con.country_name })));
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public getAllSourceList() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_source}/`).subscribe(
      (res: any) => {
        if (res && res.length >= 1) {
          this.allSourceNames = res?.map(((sou: any) => ({ id: sou.id, name: sou.source_name })));
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  public openCreateClientPage() {
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/client/create']);

  }
  async edit(item: any) {
    this.selectedItemId = item?.id;
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.common_service.setClientActiveTabindex(0);
    this.router.navigate(['/client/update-client/', this.selectedItemId]);
    // try {
    //   const modalRef = await this.modalService.open(GenericEditComponent, {
    //     size: 'sm',
    //     backdrop: 'static',
    //     centered: true
    //   });

    //   modalRef.componentInstance.status.subscribe(resp => {
    //     if (resp === 'ok') {
    //       modalRef.dismiss();
    //       sessionStorage.setItem('access-name', this.access_name?.name)
    //       this.common_service.setClientActiveTabindex(0);
    //       this.router.navigate(['/client/update-client/',this.selectedItemId]);

    //     } else {
    //       modalRef.dismiss();
    //     }
    //   });
    // } catch (error) {
    //   console.error('Error opening modal:', error);
    // }
  }
  public getCurrentClientList() {
    this.allClientList = [];
    this.filteredList = [];
    this.isHistory = false;
    this.isCurrent = true;
    let query = `${this.getFilterBaseUrl()}&status=True`;
    this.apiService.getData(`${environment.live_url}/${environment.all_clients}/${query}`).subscribe(
      (res: any) => {
        this.allClientList = res?.results;
        this.filteredList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public getClientHistoryList() {
    this.allClientList = [];
    this.filteredList = [];
    this.isCurrent = false;
    this.isHistory = true;
    let query = `${this.getFilterBaseUrl()}&status=False`;
    this.apiService.getData(`${environment.live_url}/${environment.all_clients}/${query}`).subscribe(
      (res: any) => {
        this.allClientList = res?.results;
        this.filteredList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);

      });
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
      const value = event?.target?.value || '';
    if (value && value.length >= 2) {
      this.page = 1
    }
    this.searchSubject.next(value);
    // this.term = event.target.value?.trim();
    // if (this.term && this.term.length >= 2) {
    //   this.page = 1;
    //   this.filterData();
    // }
    // else if (!this.term) {
    //   this.filterData();
    // }
  }

  public getFilterBaseUrl(): string {
    // if (this.userRole === 'Admin') {
    //   return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
    // } else {
    //   return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&employee-id=${this.user_id}`;
    // }
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    const employeeParam = this.userRole !== 'Admin' ? `&employee-id=${this.user_id}` : '';

    return `${base}${searchParam}${employeeParam}`;
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.filterData()
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
        a.download = `Client Details.${type}`;
        a.click();
      });
  }

  filterData() {

    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.country.length) {
      this.filterQuery += `&country-ids=[${this.filters.country.join(',')}]`;
    }

    if (this.filters.source.length) {
      this.filterQuery += `&source-ids=[${this.filters.source.join(',')}]`;
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    if (this.isCurrent) {
      this.filterQuery += `&status=True`;
    }
    else {
      this.filterQuery += `&status=False`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.all_clients}/${this.filterQuery}`).subscribe((res: any) => {
      this.allClientList = res?.results;
      this.filteredList = res?.results;
      this.count = res?.['total_no_of_record'];
      this.page = res?.['current_page'];
    });
  }

  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.page = 1,
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


  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }

}
