import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements CanComponentDeactivate, OnInit {
 @ViewChild('formInputField') formInputField: ElementRef;
 BreadCrumbsTitle: any = 'Create Invoice';
     term:any='';
     sortValue: string = '';
     directionValue: string = '';
     selectedItemId:any;
     arrowState: { [key: string]: boolean } = {
   job_name:false,
   job_number:false,
job_status_name:false,
budget_time:false,
job_price:false,
total_amount:false,
     };
     page = 1;
     count = 0;
     tableSize = 5;
     tableSizes = [5, 10, 25, 50, 100];
     currentIndex: any;
     allClientBasedJobsLists:any=[];
     accessPermissions = []
     user_id: any;
     userRole: any;
     searchClientText:any;
     jobSelection: any[] = [];
     allClientslist:any=[];
     selectedClientId:any=null;
     selectedClientName:any='';
     constructor(private common_service: CommonServiceService,private accessControlService:SubModuleService,
       private router:Router,
       private apiService: ApiserviceService,private formErrorScrollService:FormErrorScrollUtilityService) {
       this.common_service.setTitle(this.BreadCrumbsTitle)
      }
   
     ngOnInit(): void {
       this.user_id = sessionStorage.getItem('user_id');
       this.userRole = sessionStorage.getItem('user_role_name');
       this.getModuleAccess();
       this.getAllActiveClients();
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

     public getAllActiveClients() {
      this.allClientslist = [];
      let query:any
      if(this.userRole ==='Admin'){
        query = '?status=True'
      } else{
        query = `?status=True&employee-id=${this.user_id}`
      }
      this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
        (res: any) => {
          this.allClientslist = res;
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
    }
    public backBtnFunc(){
      this.router.navigate(['/invoice/all-invoice']);
    }

    public clearSearch() {
      this.searchClientText = '';
    }
    public filteredClientList() {
      if (!this.searchClientText) {
        return this.allClientslist;
      }
      return this.allClientslist.filter((client: any) =>
        client?.client_name?.toLowerCase()?.includes(this.searchClientText?.toLowerCase())
      );
    }

    public onClientChange(event: any) {
      this.jobSelection=[];
      this.selectedClientId = event?.value;
      if(this.selectedClientId){
      this.getClientBasedJobsList();
      const clientName = this.allClientslist.find((c:any)=> c?.id === this.selectedClientId);
      this.selectedClientName = clientName.client_name ? clientName.client_name :'';
      }
    }

    public clearSelection(){
      this.jobSelection=[];
      this.selectedClientId=null;
      this.selectedClientName='';
      this.page = 1;
      this.getClientBasedJobsList();
    }

    public getClientBasedJobsList(){
      let query = this.getFilterBaseUrl();
      this.allClientBasedJobsLists=[];
      forkJoin([
              this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}`),  // First API call for Client related completed jobs list
              this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/?client=${this.selectedClientId}`)  // Second API call for Client Generated invoiced jobs details
            ]).pipe(
          map(([clientAllJobsDetailsResponse, clientInvoiceListDetailsResponse]: any[]) => {
            return {
              clientAllJobsList: clientAllJobsDetailsResponse || [],
              clientInvoiceList: clientInvoiceListDetailsResponse || [],
            };
          })).subscribe((responseData:any)=>{
  const jobsList = responseData.clientAllJobsList?.results || [];
  const invoices = responseData.clientInvoiceList || [];
  if (jobsList.length >= 1 && invoices.length >= 1) {
    const flatInvoiceJobs = invoices.flatMap((item: any) => item?.client_invoice || []);
    const invoiceJobIds = new Set(flatInvoiceJobs.map((inv: any) => inv?.job_id));
    this.allClientBasedJobsLists = jobsList.filter((job: any) => !invoiceJobIds.has(job?.id));
    this.count = (responseData.total_no_of_record || 0) - flatInvoiceJobs.length;
  } else {
    this.allClientBasedJobsLists = jobsList;
    this.count = responseData.total_no_of_record || 0;
  }
  this.page = responseData.current_page || 1;
 });
    }

    public createInvoice(){
      let apiPayload:any={};
      apiPayload['client_id']= this.selectedClientId;
      apiPayload['client_name']= this.selectedClientName;
const jobsMappedData =  this.jobSelection?.map(({id,
  job_number,job_name,job_type_name,job_status_name,budget_time,job_price,total_amount})=>({
    job_id:id,
    job_number,
    job_name,
    job_type_name,
    job_status_name,
    budget_time,
    job_price,
    total_amount}));
    apiPayload['job_details'] =jobsMappedData;
    this.apiService.postData(`${environment.live_url}/${environment.client_invoice}/`, apiPayload).subscribe((respData: any) => {
      if (respData) {
        this.apiService.showSuccess(respData['message']);
        this.jobSelection=[];
        this.selectedClientId = null;
        this.selectedClientName='';
        sessionStorage.removeItem("access-name");
        this.router.navigate(['/invoice/all-invoice']);
      }
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
    }

    toggleJobSelection(item: any) {
      const index = this.jobSelection?.indexOf(item);
      if (index === -1) {
        this.jobSelection?.push(item);
      } else {
        this.jobSelection?.splice(index, 1);
      }
    }

    isAllJobsSelected() {
      return this.jobSelection?.length > 0 ? this.jobSelection?.length === this.allClientBasedJobsLists?.length : false;
    }

    isSomeJobsSelected() {
      return this.jobSelection?.length > 0 && !this.isAllJobsSelected();
    }

    toggleAllJobs(event: any) {
      if (event.checked) {
        this.jobSelection = [...this.allClientBasedJobsLists];
      } else {
        this.jobSelection = [];
      }
    }


     public onTableSizeChange(event: any): void {
       if (event) {
         this.page = 1;
         this.tableSize = Number(event.value);
           this.getClientBasedJobsList()
       }
     }
     public onTableDataChange(event: any) {
       this.page = event;
           this.getClientBasedJobsList()
     }
     public filterSearch(event: any) {
       this.term = event.target.value?.trim();
       if (this.term && this.term.length >= 2) {
         this.page = 1;
           this.getClientBasedJobsList()
       }
       else if (!this.term) {
          this.page = 1;
          this.getClientBasedJobsList();
       }
     }

     public getFilterBaseUrl(): string {
      if(this.selectedClientId && this.selectedClientId!=null){
        return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&job-status=Completed&client=${this.selectedClientId}`;
      }else{
        return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&job-status=Completed&client=0`;

      }
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
canDeactivate(): Observable<boolean> {
  const isdirty = this.selectedClientId || this.jobSelection.length>=1 ? true : false;
return this.formErrorScrollService.isTableRecordChecked(isdirty);
}
}
