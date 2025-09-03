import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { MatSelect } from '@angular/material/select';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements CanComponentDeactivate, OnInit,OnDestroy {
 @ViewChild('formInputField') formInputField: ElementRef;
 @ViewChild('clientSelect') clientSelect!: MatSelect;
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
     tableSize = 50;
     tableSizes = [50, 100, 150];
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
      //  this.getAllActiveClients();
     }
     
     ngOnDestroy(): void {
      this.formErrorScrollService.resetHasUnsavedValue();
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
      // const clientName = this.allClientslist.find((c:any)=> c?.id === this.selectedClientId);  // commented because now we are using pagination dropdowns
      const clientName = this.dropdownState.client.list.find((c:any)=> c?.id === this.selectedClientId)
      this.selectedClientName = clientName.client_name ? clientName.client_name :'';
      const isdirty = this.selectedClientId || this.jobSelection.length>=1 ? true : false;
        this.formErrorScrollService.setUnsavedChanges(isdirty);
      }
      this.updateSelectedItems('client', event?.value);
    }

    public clearSelection(event?: MouseEvent) {
      if (event) {
        event.stopPropagation();
      }
      this.jobSelection=[];
      this.selectedClientId=null;
      this.selectedClientName='';
      this.page = 1;
      this.clearSearchDropD('client')
      this.formErrorScrollService.resetHasUnsavedValue();
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
    this.count = (responseData.clientAllJobsList?.total_no_of_record || 0) - flatInvoiceJobs.length;
    // this.count = responseData.clientAllJobsList?.total_no_of_record;
    // console.log(this.count,flatInvoiceJobs.length)
    this.page = responseData.clientAllJobsList?.current_page ;
  } else {
    this.allClientBasedJobsLists = jobsList;
    this.count = responseData.clientAllJobsList?.total_no_of_record || 0;
  };
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
        this.router.navigate(['/invoice/view-invoice',respData?.result?.id]);
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
      const isdirty = this.selectedClientId || this.jobSelection.length>=1 ? true : false;
      this.formErrorScrollService.setUnsavedChanges(isdirty);
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
      const isdirty = this.selectedClientId || this.jobSelection.length>=1 ? true : false;
      this.formErrorScrollService.setUnsavedChanges(isdirty);
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

@HostListener('window:beforeunload', ['$event'])
unloadNotification($event: BeforeUnloadEvent): void {
  const isdirty = this.selectedClientId || this.jobSelection.length>=1 ? true : false;
   if (isdirty) {
    $event.preventDefault();
  }
}

pageSizeDropdown = 10;

dropdownState = {
    client: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  },
};

dropdownEndpoints = {
  client: environment.clients,
};

private scrollListeners: { [key: string]: (event: Event) => void } = {};

// Selected items for pagination dropdowns
selectedItemsMap: { [key: string]: any[] } = {
  client: [],
};


removeScrollListener(key: string) {
  const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
  if (panel && this.scrollListeners[key]) {
    panel.removeEventListener('scroll', this.scrollListeners[key]);
    delete this.scrollListeners[key];
  }
}

// Scroll handler for infinite scroll
onScroll(key: string, event: Event) {
  const target = event.target as HTMLElement;
  const state = this.dropdownState[key];

  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  const atBottom = scrollHeight - scrollTop <= clientHeight + 5;
  if (atBottom && !state.loading && state.page < state.totalPages) {
    state.page++;
    this.fetchData(key, true);
  }
}

// Search input for pagination 
onSearch(key: string, text: string) {
  const state = this.dropdownState[key];
  state.search = text.trim();
  state.page = 1;
  state.list = [];
  this.fetchData(key, false);
}

// Clear search input
clearSearchDropD(key: string) {
  this.dropdownState[key].search = '';
  this.dropdownState[key].page = 1;
  this.dropdownState[key].list = [];
  this.fetchData(key, false);
}

// Fetch data from API with pagination and search
fetchData(key: string, append = false) {
  const state = this.dropdownState[key];
  state.loading = true;
  let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
  if (state.search) {
    query += `&search=${encodeURIComponent(state.search)}`;
  }
  if (key === 'client') {
    query += this.userRole==='Admin'? '&status=True' : `?status=True&employee-id=${this.user_id}`;
  }
  this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
    .subscribe((res: any) => {
      state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
      const selectedItems = this.selectedItemsMap[key] || [];
      const selectedIds = selectedItems.map(item => item.id);
      const filteredResults = res.results.filter(
        (item: any) => !selectedIds.includes(item.id)
      );
      if (append) {
        state.list = [...state.list, ...filteredResults];
      } else {
        state.list = [...selectedItems, ...filteredResults];
      }

      state.loading = false;
    }, () => {
      state.loading = false;
    });
}

// Update selectedItemsMap with full objects to keep selected at top & no duplicates
updateSelectedItems(key: string, selectedIds: any[]) {
  if (!Array.isArray(selectedIds)) {
    selectedIds = selectedIds != null ? [selectedIds] : [];
  }
  const state = this.dropdownState[key];
  let selectedItems = this.selectedItemsMap[key] || [];
   // removing the unselected datas
  selectedItems = selectedItems.filter(item => selectedIds.includes(item.id));

  // Add new selected items from currently loaded list if missing
  selectedIds.forEach(id => {
    if (!selectedItems.some(item => item.id === id)) {
      const found = state.list.find(item => item.id === id);
      if (found) {
        selectedItems.push(found);
      } else {
        // if we want then fetch item from API if not found 
      }
    }
  });
  this.selectedItemsMap[key] = selectedItems;
}

// Return options with selected items on top, no duplicates
getOptionsWithSelectedOnTop(key: string) {
  const state = this.dropdownState[key];
  const selectedItems = this.selectedItemsMap[key] || [];
  const unselectedItems = state.list.filter(item =>
    !selectedItems.some(sel => sel.id === item.id)
  );

  return [...selectedItems, ...unselectedItems];
}

onDropdownOpened(isOpen, key: string) {
  if (isOpen) {
    // ⬇⬇ ADD THIS BLOCK ⬇⬇
    if (!this.dropdownState[key].initialized || this.dropdownState[key].list.length === 0) {
      this.dropdownState[key].page = 1;
      this.fetchData(key, false);  
      this.dropdownState[key].initialized = true;
    }
    setTimeout(() => {
      this.removeScrollListener(key); 
      const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
      if (panel) {
        this.scrollListeners[key] = (event: Event) => this.onScroll(key, event);
        panel.addEventListener('scroll', this.scrollListeners[key]);
      }
    }, 0);
  } else {
    this.removeScrollListener(key);
  }
}

commonOnchangeFun(event, key){
  this.updateSelectedItems(key, event.value);
}

}
