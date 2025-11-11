import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { EditInvoiceComponent } from '../edit-invoice/edit-invoice.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss'],
})
export class ViewInvoiceComponent implements OnInit {
  BreadCrumbsTitle: any = 'Invoice Details';
  term: any = '';
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    invoice_date: false,
    invoice_number: false,
    client_name: false,
    job_type_name: false,
    job_status_name: false,
    job_price: false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100,150];
  currentIndex: any;
  allClientBasedJobsLists: any = [];
  accessPermissions = [];
  user_id: any;
  userRole: any;
  invoice_id: any;
  client_id:any;
  invoice: any;
  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private router: Router,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private apiService: ApiserviceService,
    private dialog: MatDialog
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    if (this.activatedRoute.snapshot.paramMap.get('id')) {
      this.invoice_id = this.activatedRoute.snapshot.paramMap.get('id');
      this.getInvoiceDetailsList();
    }
  }

  ngOnInit(): void {
    this.initalCall();
    this.getModuleAccess();
    this.invoice = history.state.invoice;
    console.log(this.invoice)
  }

  public initalCall() {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    // this.getAllActiveClients();
  }
  access_name: any;
  getModuleAccess() {
    this.accessControlService
      .getAccessForActiveUrl(this.user_id)
      .subscribe((access) => {
        if (access) {
          this.access_name = access[0];
          this.accessPermissions = access[0].operations;
          // console.log('Access Permissions:', access);
        } else {
          console.log('No matching access found.');
        }
      });
  }
  public openEditInvoicePopup(item: any) {
    const dialogRef =this.dialog.open(EditInvoiceComponent, {
      data: { invoice_id: this.invoice_id, client_id: this.client_id,client_name:this.allClientBasedJobsLists?.client_name },
      panelClass: 'custom-details-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((resp: any) => {
      if(resp.data==='refresh'){
         this.initalCall();
        this.getInvoiceDetailsList();
      }
    });
    // this.dialog.afterAllClosed.subscribe((resp: any) => {
    //   // console.log('resp',resp);
    //   this.initalCall();
    //   this.getInvoiceDetailsList();
    // });
  }

  async edit(item: any = this.invoice) {
    console.log(this.invoice)
    this.selectedItemId = item?.id;
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true,
      });

      modalRef.componentInstance.status.subscribe((resp) => {
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
  public getInvoiceDetailsList() {
    let query = this.getFilterBaseUrl();
    this.apiService
      .getData(`${environment.live_url}/${environment.view_invoice}/${query}`)
      .subscribe((res: any) => {
        console.log(res);
        this.allClientBasedJobsLists = res;
        this.client_id = res?.client_id;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      });
  }

  public deleteClient() {
    if (this.invoice_id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true,
      });
      modelRef.componentInstance.status.subscribe((resp) => {
        if (resp == 'ok') {
          this.deleteContent();
          modelRef.close();
        } else {
          modelRef.close();
        }
      });
    }
  }
  public deleteContent() {
    this.apiService
      .delete(
        `${environment.live_url}/${environment.client_invoice}/${this.invoice_id}/`
      )
      .subscribe(
        async (data: any) => {
          if (data) {
            this.invoice_id = [];
            this.apiService.showSuccess(data.message);
            this.router.navigate(['invoice/all-invoice']);
          }
        },
        (error) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.getInvoiceDetailsList();
    } else if (!this.term) {
      this.getInvoiceDetailsList();
    }
  }

  public getFilterBaseUrl(): string {
    if (this.userRole === 'Admin') {
      return `?invoice-id=${this.invoice_id}&page=${this.page}&page_size=${this.tableSize}`;
    } else {
      return `?invoice-id=${this.invoice_id}&page=${this.page}&page_size=${this.tableSize}`;
    }
  }

  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getInvoiceDetailsList();
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getInvoiceDetailsList();
  }
  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach((key) => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  public backToAllInvoice() {
    this.router.navigate(['/invoice/all-invoice']);
  }

  public downloadOption(type: any) {
    let query = `?invoice-id=${this.invoice_id}&file-type=${type}`;
    let apiUrl = `${environment.live_url}/${environment.invoice_details}/${query}`;
    fetch(apiUrl)
      .then((res) => res.blob())
      .then((blob) => {
        // console.log('blob',blob);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `invoice_details.${type}`;
        a.click();
      });
  }
}
