import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { EditInvoiceComponent } from '../edit-invoice/edit-invoice.component';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { WeeklySelectionStrategy } from '../../../shared/weekly-selection-strategy';
import { DropDownPaginationService } from '../../../service/drop-down-pagination.service';
import { GenericTableFilterComponent } from '../../../shared/generic-table-filter/generic-table-filter.component';


@Component({
  selector: 'app-all-invoice',
  templateUrl: './all-invoice.component.html',
  styleUrls: ['./all-invoice.component.scss']
})
export class AllInvoiceComponent implements OnInit {
@ViewChild('clientFilter') clientFilter!: GenericTableFilterComponent;
BreadCrumbsTitle: any = 'Invoices';
    term:any='';
    sortValue: string = '';
    directionValue: string = '';
    selectedItemId:any;
    arrowState: { [key: string]: boolean } = {
      invoice_date:false,
      invoice_number:false,
      client_name:false,
    };
    startDate:any;
    endDate:any;
    page = 1;
    count = 0;
    tableSize = 50;
    tableSizes = [50,75,100];
    currentIndex: any;
    allInvoiceList:any=[];
    accessPermissions = [];
    user_id: any;
    userRole: any;
    invoiceDate: string | null;
    dateFilterValue: string | null = null;
    filterQuery: string;
    filters: {client_name: string[]} = {
      client_name: []
    };
    allClientNames: any[] = [];
    datepicker: null;
    constructor(private common_service: CommonServiceService,private accessControlService:SubModuleService,
      private router:Router,private modalService: NgbModal,private dialog:MatDialog,
      private datePipe:DatePipe,private dropdownService: DropDownPaginationService,
      private apiService: ApiserviceService,private http: HttpClient) {
      this.common_service.setTitle(this.BreadCrumbsTitle)
      this.getAllInvoiceList();
    }

    ngOnInit(): void {
      this.initalCall();
    }

    public initalCall(){
      this.user_id = sessionStorage.getItem('user_id');
      this.userRole = sessionStorage.getItem('user_role_name');
      this.getModuleAccess();
      // this.getAllActiveClients();
    }

    access_name:any ;
    getModuleAccess(){
      this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
        if (access) {
          this.access_name=access[0]
          this.accessPermissions = access[0].operations;
          // console.log('Access Permissions:', access);
        } else {
          console.log('No matching access found.');
        }
      });
    }




    public openCreateInvoicePage(){
      sessionStorage.setItem('access-name', this.access_name?.name)
      this.router.navigate(['/invoice/create-invoice']);

    }
    async edit(item: any) {
      this.selectedItemId = item?.id;
      try {
        const modalRef = await this.modalService.open(GenericEditComponent, {
          size: 'sm',
          backdrop: 'static',
          centered: true
        });

        modalRef.componentInstance.status.subscribe(resp => {
          if (resp === 'ok') {
            modalRef.dismiss();
            sessionStorage.setItem('access-name', this.access_name?.name);
            this.openEditInvoicePopup(item);
          } else {
            modalRef.dismiss();
          }
        });
      } catch (error) {
        console.error('Error opening modal:', error);
      }
    }

  public getAllActiveClients() {
    let query:any
    if(this.userRole ==='Admin'){
      query = '?status=True'
    } else{
      query = `?status=True&employee-id=${this.user_id}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
      (res: any) => {
        if(res && res.length>=1){
        this.allClientNames = res.map((client:any) => ({ id: client.id, name: client.client_name }));
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }
      public getAllInvoiceList(){
        let query = this.getFilterBaseUrl();
        this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/${query}`).subscribe(
      (res: any) => {
        this.allInvoiceList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
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
          this.filterData()
      }
      else if (!this.term) {
        this.filterData()
      }
    }

    getFilterBaseUrl(): string {
      const base = `?page=${this.page}&page_size=${this.tableSize}`;
      const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';

      return `${base}${searchParam}`;
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

    public openEditInvoicePopup(item:any){
      this.dialog.open(EditInvoiceComponent, {
      data: { invoice_id: item?.id,client_id:item?.client_id },
      panelClass: 'custom-details-dialog',
      disableClose: true
    });
    this.dialog.afterAllClosed.subscribe((resp:any)=>{
      // console.log('resp',resp);
      this.initalCall();
    });
    }

    public viewInvoiceDetails(item:any){
      this.router.navigate(['/invoice/view-invoice',item?.id]);
    }
    setDateFilterColumn(event){
      const selectedDate = event.value;
    if (selectedDate) {
      this.invoiceDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    this.filterData()
    }
    onDateSelected(event: any): void {
      const selectedDate = event.value;
      if (selectedDate) {
       this.invoiceDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
      }
      this.filterData()
    }


    filterData() {
      this.filterQuery = this.getFilterBaseUrl()
      if (this.filters.client_name.length) {
        this.filterQuery += `&client-ids=[${this.filters.client_name.join(',')}]`;
      }
      // if (this.invoiceDate) {
      //   this.filterQuery += `&dates=[${this.invoiceDate}]`;
      // }
      if(this.startDate && this.endDate){
        this.filterQuery += `&start-date=${this.startDate}&end-date=${this.endDate}`;
      }
      this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/${this.filterQuery}`).subscribe((res: any) => {
        this.allInvoiceList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];
      });
    }
    clearDateFilter(){
      this.invoiceDate = null;
      this.dateFilterValue = null;
      this.startDate = null;
      this.endDate = null;
      this.filterData()
    }
    onStartDateChange(event: any) {
      const selectedDate = event.value;
      if (selectedDate) {
        this.startDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
      }
    }
    onEndDateChange(event: any) {
      const selectedDate = event.value;
      if (selectedDate) {
        this.endDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
      }
      this.filterData()
    }
    dateClass = (date: Date) => {
      return date.getDay() === 0 ? 'sunday-highlight' : '';
    };


    fetchClients = (page: number, search: string) => {
    // this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`
    const extraParams = {
      status: 'True',
      ...(this.userRole !== 'Admin' && { 'employee-id': this.user_id })
    }
    console.log(search, extraParams, 'client funcion')
    return this.dropdownService.fetchDropdownData$(
      environment.clients,
      page,
      search,
      (item) => ({ id: item.id, name: item.client_name }),
      extraParams
    );
  };

  openFilter(filter: any): void {
    if (filter) {
      filter.onMenuOpened();
    }
  }
  
}
