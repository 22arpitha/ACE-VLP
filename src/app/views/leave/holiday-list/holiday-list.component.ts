import { Component, OnInit } from '@angular/core';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { EditInvoiceComponent } from '../../invoice/edit-invoice/edit-invoice.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CreateUpdateHolidayComponent } from '../create-update-holiday/create-update-holiday.component';

@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss']
})
export class HolidayListComponent implements OnInit {
BreadCrumbsTitle: any = 'Holiday Lists';
 term:any='';
     sortValue: string = '';
     directionValue: string = '';
     selectedItemId:any;
     arrowState: { [key: string]: boolean } = {
       name:false,
       date:false,
       classification:false,
     };
     startDate:any;
     endDate:any;
     page = 1;
     count = 0;
     tableSize = 50;
     tableSizes = [50,75,100];
     currentIndex: any;
     allHolidayList:any=[];
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
       private datePipe:DatePipe,
       private apiService: ApiserviceService,private http: HttpClient) {
       this.common_service.setTitle(this.BreadCrumbsTitle)
       
     }
 
     ngOnInit(): void {
       this.initalCall();
       this.getAllHolidayList();
     }
 
     public initalCall(){
       this.user_id = sessionStorage.getItem('user_id');
       this.userRole = sessionStorage.getItem('user_role_name');
       this.getModuleAccess();
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
 
 
 
 
     public openCreateHolidayPage(){
       sessionStorage.setItem('access-name', this.access_name?.name)
      //  this.router.navigate(['/invoice/create-invoice']);
      this.dialog.open(CreateUpdateHolidayComponent, {
        data: { edit:false,item_id:21 },
       panelClass: 'custom-details-dialog',
       disableClose: true
     });
     this.dialog.afterAllClosed.subscribe((resp:any)=>{
       // console.log('resp',resp);
       this.initalCall();
     });
 
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
 
       public getAllHolidayList(){
         let query = this.getFilterBaseUrl();
         this.apiService.getData(`${environment.live_url}/${environment.holiday_calendar}/${query}`).subscribe(
       (res: any) => {
        console.log(res,'holiday list')
         this.allHolidayList = res?.results;
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
      //  const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';
      // return `${base}${searchParam}`;
       return `${base}`;
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
       this.dialog.open(CreateUpdateHolidayComponent, {
       data: { edit:true,item_id:item.id },
       panelClass: 'custom-details-dialog',
       disableClose: true
     });
     this.dialog.afterAllClosed.subscribe((resp:any)=>{
      //  console.log('resp',resp);
       this.initalCall();
       this.getAllHolidayList();
     });
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
      //  if (this.filters.client_name.length) {
      //    this.filterQuery += `&client-ids=[${this.filters.client_name.join(',')}]`;
      //  }
      //  if(this.startDate && this.endDate){
      //    this.filterQuery += `&start-date=${this.startDate}&end-date=${this.endDate}`;
      //  }
       this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/${this.filterQuery}`).subscribe((res: any) => {
         this.allHolidayList = res?.results;
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
 }
 
