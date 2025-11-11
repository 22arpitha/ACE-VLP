import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { GenericRedirectionConfirmationComponent } from 'src/app/generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss']
})
export class EditInvoiceComponent implements OnInit {
     term:any='';
     page = 1;
    count = 0;
    tableSize = 50;
    tableSizes = [50,75,100,150];
     sortValue: string = '';
     directionValue: string = '';
     selectedItemId:any;
     arrowState: { [key: string]: boolean } = {
      job_name:false,
   job_number:false,
budget_time:false,
job_price:false,
total_amount:false,
     };
     currentIndex: any;
     allClientBasedJobsLists:any=[];
     accessPermissions = []
     user_id: any;
     userRole: any;
     jobSelection: any[] = [];
     manualUnselectedJobs: any[] = [];
     client_id:any;
     client_name:any;
     invoice_id:any;
     constructor(private accessControlService:SubModuleService,
       private router:Router,private cdRef: ChangeDetectorRef,private apiService: ApiserviceService,private http: HttpClient, public dialogRef: MatDialogRef<EditInvoiceComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any){
                this.invoice_id=data?.invoice_id;
                this.client_id = data?.client_id;
                this.client_name = data?.client_name;
      }
   
     ngOnInit(): void {
       this.user_id = sessionStorage.getItem('user_id');
       this.userRole = sessionStorage.getItem('user_role_name');
       this.getModuleAccess();
      //  this.getClientBasedJobsList();
       this.getClientInvoiceees();
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
     getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';
    return `${base}${searchParam}`;
  }

  getClientInvoiceees(){
    let query = this.getFilterBaseUrl()
    query +=`&client=${this.client_id}&job-status=Completed&all-client-invoice=True&client-invoice-id=${this.invoice_id}`
    this.apiService.getData(`${environment.live_url}/${environment.all_jobs}/${query}`).subscribe(
      (res:any)=>{
        console.log(res)
        this.allClientBasedJobsLists = res?.results;
         const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.page = res?.['current_page'];
        this.initializeSelection(res?.results);
      },
      (error:any)=>{
        this.apiService.showError(error?.detail)
      }
    )
  }

  initializeSelection(results: any[]) {
  results.forEach(job => {
    if (job.is_approved && !this.jobSelection.some(sel => sel.id === job.id)) {
      this.jobSelection.push(job);
    }
  });
}


isJobSelected(item: any): boolean {
  return this.jobSelection.some(sel => sel.id === item.id);
}

// Toggle single job selection
selectJobs(item: any) {
  const index = this.jobSelection.findIndex(sel => sel.id === item.id);
  if (index > -1) {
    this.jobSelection.splice(index, 1); // remove
  } else {
    this.jobSelection.push(item); // add
  }
}

// Toggle all jobs on the current page
selectAllJobs(event: any) {
  if (event.checked) {
    this.allClientBasedJobsLists.forEach(job => {
      if (!this.jobSelection.some(sel => sel.id === job.id)) {
        this.jobSelection.push(job);
      }
    });
  } else {
    this.allClientBasedJobsLists.forEach(job => {
      const index = this.jobSelection.findIndex(sel => sel.id === job.id);
      if (index > -1) this.jobSelection.splice(index, 1);
    });
  }
}

// Master checkbox state
allJobsSelected(): boolean {
  return this.allClientBasedJobsLists.every(job => this.isJobSelected(job));
}

// Indeterminate state
someJobsSelected(): boolean {
  const selectedCount = this.allClientBasedJobsLists.filter(job =>
    this.isJobSelected(job)
  ).length;
  return selectedCount > 0 && selectedCount < this.allClientBasedJobsLists.length;
}

    public getClientBasedJobsList(){
      let query = this.getFilterBaseUrl()
      this.allClientBasedJobsLists=[];
      this.jobSelection=[];
      // let query  = `?page=${this.page}&page_size=${this.tableSize}`;
      //  query += this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';
      forkJoin([
        this.apiService.getData(`${environment.live_url}/${environment.jobs}/${query}&job-status=Completed&client=${this.client_id}`),  // First API call for Client related completed jobs list
        this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/?invoice-id=${this.invoice_id}`),  // Second API call for Client Generated invoiced jobs details
        this.apiService.getData(`${environment.live_url}/${environment.client_invoice}/?client=${this.client_id}`)  // Second API call for Client Generated invoiced jobs details
      ]).pipe(
    map((
      [clientAlljobDetailsResponse, selectedinvoiceDetailsResponse, clientInvoiceListResponse]: any[])=> {
        const combinedResponse: any = {
          clientAllJobs: clientAlljobDetailsResponse || [],
          selectedinvoiceDetails: selectedinvoiceDetailsResponse || [],
          clientInvoiceList: clientInvoiceListResponse || []
        };
        return combinedResponse;
    })).subscribe((responseData:any)=>{
      console.log(responseData)
      this.allClientBasedJobsLists = responseData.clientAllJobs.results;

  const selectedInvoiceDetails = responseData.selectedinvoiceDetails[0];
  this.client_name = selectedInvoiceDetails?.client_name;

  const selectedInvoiceJobSet = new Set(
    selectedInvoiceDetails?.client_invoice?.map((invoiceJob: any) => invoiceJob?.job_id)
  );

  const flatClientInvoiceJobsData: any[] = responseData.clientInvoiceList
    ?.flatMap((item: any) => item?.client_invoice) || [];

  const otherInvoiceJoblist = flatClientInvoiceJobsData
    ?.filter((jobItem: any) => !selectedInvoiceJobSet?.has(jobItem?.job_id));

  const clientInvoiceJobsSet = new Set(
    otherInvoiceJoblist?.map((invoiceJobItem: any) => invoiceJobItem?.job_id)
  );

  this.allClientBasedJobsLists = responseData.clientAllJobs?.results?.filter((jobItem: any) => !clientInvoiceJobsSet.has(jobItem?.id));
  const noOfPages: number = responseData.clientAllJobs?.['total_pages']
  this.count = noOfPages * this.tableSize;
  this.count = responseData.clientAllJobs?.['total_no_of_record'];
  this.page = responseData.clientAllJobs?.['current_page'];
  this.allClientBasedJobsLists?.forEach((jobItem: any) => {
    selectedInvoiceDetails?.client_invoice?.forEach((invoiceJobItem: any) => {
      if (jobItem?.id === invoiceJobItem?.job_id) {
        this.jobSelection?.push(jobItem);
        this.cdRef?.detectChanges();
      }
    });
  });
    });
    }


    public updateInvoice(){
      let apiPayload:any={};
      apiPayload['client_id']= this.client_id;
      apiPayload['client_name']= this.client_name;
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
    console.log(apiPayload)
    this.apiService.updateData(`${environment.live_url}/${environment.client_invoice}/${this.invoice_id}/`, apiPayload).subscribe((respData: any) => {
      if (respData) {
        this.apiService.showSuccess(respData['message']);
        this.jobSelection=[];
        this.client_id = null;
        this.client_name='';
        sessionStorage.removeItem("access-name");
        // this.dialogRef.close();
         this.dialogRef.close({data:'refresh'});
        this.router.navigate(['/invoice/view-invoice',respData?.result?.id]);
      }
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
    }
    toggleJobSelection(item: any) {
      const index = this.jobSelection.indexOf(item);
      if (index === -1) {
        // Add to selection
        this.jobSelection.push(item);

        // If it was manually unselected earlier, remove from unselected
        const unselectedIndex = this.manualUnselectedJobs.indexOf(item.id);
        if (unselectedIndex > -1) this.manualUnselectedJobs.splice(unselectedIndex, 1);
      } else {
        // Remove from selection
        this.jobSelection.splice(index, 1);

        // If it was from API initially, mark it as manually unselected
        if (item.fromApi) {
          this.manualUnselectedJobs.push(item.id);
        }
      }
    }


    // toggleJobSelection(item: any) {
    //   const index = this.jobSelection?.indexOf(item);
    //   if (index === -1) {
    //     this.jobSelection?.push(item);
    //   } else {
    //     this.jobSelection?.splice(index, 1);
    //   }
    // }
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
     public filterSearch(event: any) {
       this.term = event.target.value?.trim();
       if (this.term && this.term.length >= 2) {
          //  this.getClientBasedJobsList()
          this.getClientInvoiceees();
       }
       else if (!this.term) {
          //  this.getClientBasedJobsList()
          this.getClientInvoiceees();
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

     public closeEditDetails(){
      this.dialogRef.close();
     }

     onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      // this.getClientBasedJobsList();
      this.getClientInvoiceees();
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    // this.getClientBasedJobsList();
    this.getClientInvoiceees();
  }
}
