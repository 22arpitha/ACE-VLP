import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { SortPipe } from '../../../sort/sort.pipe';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { ClientContactDetailsPopupComponent } from '../client-contact-details-popup/client-contact-details-popup.component';


@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  providers: [
    SortPipe
]
})
export class ClientListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Client';
    term:any='';
    isCurrent:boolean=true;
    isHistory:boolean=false;
    sortValue: string = '';
    directionValue: string = '';
    selectedItemId:any;
    arrowState: { [key: string]: boolean } = {
  client_number:false,
  client_name:false,
  user__email:false,
  designation__designation_name:false,
  is_active:false,
    };
    page = 1;
    count = 0;
    tableSize = 5;
    tableSizes = [5, 10, 25, 50, 100];
    currentIndex: any;
    allClientList:any=[];
    accessPermissions = []
    user_id: any;
    userRole: any;

    constructor(private common_service: CommonServiceService,private accessControlService:SubModuleService,
      private router:Router,private modalService: NgbModal,private dialog:MatDialog,
      private apiService: ApiserviceService) {
      this.common_service.setTitle(this.BreadCrumbsTitle)
     }
  
    ngOnInit(): void {
      this.user_id = sessionStorage.getItem('user_id');
      this.userRole = sessionStorage.getItem('user_role_name');
      this.getModuleAccess();

      this.getCurrentClientList()
    }
    access_name:any ;
    getModuleAccess(){
      this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
        if (access) {
          this.access_name=access[0]
          this.accessPermissions = access[0].operations;
          console.log('Access Permissions:', this.accessPermissions);
        } else {
          console.log('No matching access found.');
        }
      });
    }
  
    public openCreateClientPage(){
      this.router.navigate(['/client/create']);
  
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
            sessionStorage.setItem('access-name', this.access_name.name)
            this.router.navigate(['/client/update-client/',this.selectedItemId]);
  
          } else {
            modalRef.dismiss();
          }
        });
      } catch (error) {
        console.error('Error opening modal:', error);
      }
    }
  public getCurrentClientList(){
  this.isHistory=false;
  this.isCurrent = true;
   let query = this.getFilterBaseUrl()
        query += `&status=True`;
  this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
        (res: any) => {
          this.allClientList = res?.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
        },(error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
    }
  
    public getClientHistoryList(){
      this.isCurrent = false;
      this.isHistory=true;
      let query = this.getFilterBaseUrl()
      query += `&status=False`;
      this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
        (res: any) => {
          this.allClientList = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
        },(error: any) => {
          this.apiService.showError(error.detail);
    
        });
    }
    public getCurrentClients(){
      this.page = 1;
      this.tableSize = 5;
    this.getCurrentClientList();  
    }
    public getClientsHistory(){
      this.page = 1;
      this.tableSize = 5;
    this.getClientHistoryList();  
    }

    public onTableSizeChange(event: any): void {
      if (event) {
        this.page = 1;
        this.tableSize = Number(event.value);
        if(this.isCurrent){
          this.getCurrentClientList()
        }else{
          this.getClientHistoryList();
        }
      }
    }
    public onTableDataChange(event: any) {
      this.page = event;
        if(this.isCurrent){
          this.getCurrentClientList()
        }else{
          this.getClientHistoryList();
        }
  
    }
    public filterSearch(event: any) {
      this.term = event.target.value?.trim();
      if (this.term && this.term.length >= 2) {
        this.page = 1;
        if(this.isCurrent){
          this.getCurrentClientList()
        }else{
          this.getClientHistoryList();
        }
      }
      else if (!this.term) {
        if(this.isCurrent){
          this.getCurrentClientList()
        }else{
          this.getClientHistoryList();
        }
      }
    }
  
    public getFilterBaseUrl(): string {
      return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
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

    public viewContactDetails(item:any){
      this.dialog.open(ClientContactDetailsPopupComponent, {
      width: '700px',
      data: { contact_details: item?.contact_details }
    });
    }
  }
