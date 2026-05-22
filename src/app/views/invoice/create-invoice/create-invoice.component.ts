// 

import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, forkJoin, map, Observable, Subject } from 'rxjs';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteService } from '../../../service/mat-autocomplete.service';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
      deps: [Overlay]
    }
  ]
})
export class CreateInvoiceComponent
  implements CanComponentDeactivate, OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('formInputField') formInputField!: ElementRef;
  @ViewChild('clientAutoRef') clientAutoRef!: MatAutocomplete;

  // ── Autocomplete infrastructure ──
  clientDisplayControl = new FormControl('');
  displayClientFn!: (item: any) => string;
  clientErrorMatcher!: ErrorStateMatcher;
  private destroy$ = new Subject<void>();
  // ──────────────────────────────────

  BreadCrumbsTitle: any = 'Create Invoice';
  term: any = '';
  private searchSubject = new Subject<string>();
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId: any;
  arrowState: { [key: string]: boolean } = {
    job_name: false,
    job_number: false,
    job_status_name: false,
    budget_time: false,
    job_price: false,
    total_amount: false,
  };

  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75, 100, 150];
  currentIndex: any;

  allClientBasedJobsLists: any = [];
  accessPermissions = [];
  user_id: any;
  userRole: any;

  jobSelection: any[] = [];
  selectedClientId: any = null;
  selectedClientName: any = '';

  constructor(
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService,
    private router: Router,
    private apiService: ApiserviceService,
    private formErrorScrollService: FormErrorScrollUtilityService,
    private autoSvc: MatAutocompleteService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.displayClientFn = this.autoSvc.createDisplayFn('client_name');
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.setupAutocomplete();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter((term: string) => term === '' || term.length >= 2)
    ).subscribe((search: string) => {
      this.term = search
      this.getClientBasedJobsList();
    });
  }

  ngAfterViewInit(): void {
    this.autoSvc.setupScrollListener(
      this.clientAutoRef,
      this.dropdownState.client,
      () => this.fetchData('client', true),
      this.destroy$
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.formErrorScrollService.resetHasUnsavedValue();
  }

  access_name: any;
  getModuleAccess() {
    this.accessControlService
      .getAccessForActiveUrl(this.user_id)
      .subscribe((access) => {
        if (access) {
          this.access_name = access[0];
          this.accessPermissions = access[0].operations;
        }
      });
  }

  public backBtnFunc() {
    this.router.navigate(['/invoice/all-invoice']);
  }

  public onClientChange(clientId: any) {
    this.jobSelection = [];
    this.selectedClientId = clientId;
    if (this.selectedClientId) {
      this.getClientBasedJobsList();
      const clientObj = this.dropdownState.client.list.find(
        (c: any) => c?.id === this.selectedClientId
      );
      this.selectedClientName = clientObj?.client_name || '';
      const isdirty =
        this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
      this.formErrorScrollService.setUnsavedChanges(isdirty);
    }
    this.updateSelectedItems('client', [clientId]);
  }

  public clearSelection(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.jobSelection = [];
    this.selectedClientId = null;
    this.selectedClientName = '';
    this.clientDisplayControl.setValue('');
    this.selectedItemsMap['client'] = [];
    this.page = 1;
    this.clearSearchDropD('client');
    this.formErrorScrollService.resetHasUnsavedValue();
    this.getClientBasedJobsList();
  }

  public getClientBasedJobsList() {
    let query = this.getFilterBaseUrl();
    query += this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    if (this.directionValue && this.sortValue) {
      query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }

    this.allClientBasedJobsLists = [];
    this.apiService.getData(`${environment.live_url}/${environment.all_job1}/${query}`).subscribe(
      (res:any)=>{
        this.allClientBasedJobsLists = res?.results;
        this.count = res?.total_no_of_record;
      },
      (error:any)=>{
        console.log(error)
      }
    )
    // forkJoin([
    //   this.apiService.getData(
    //     `${environment.live_url}/${environment.jobs}/${query}`
    //   ),
    //   this.apiService.getData(
    //     `${environment.live_url}/${environment.client_invoice}/?client=${this.selectedClientId}`
    //   ),
    // ])
    //   .pipe(
    //     map(([clientAllJobsDetailsResponse, clientInvoiceListDetailsResponse]: any[]) => {
    //       return {
    //         clientAllJobsList: clientAllJobsDetailsResponse || [],
    //         clientInvoiceList: clientInvoiceListDetailsResponse || [],
    //       };
    //     })
    //   )
    //   .subscribe((responseData: any) => {
    //     const jobsList = responseData.clientAllJobsList?.results || [];
    //     const invoices = responseData.clientInvoiceList || [];
    //     if (jobsList.length >= 1 && invoices.length >= 1) {
    //       const flatInvoiceJobs = invoices.flatMap(
    //         (item: any) => item?.client_invoice || []
    //       );
    //       const invoiceJobIds = new Set(
    //         flatInvoiceJobs.map((inv: any) => inv?.job_id)
    //       );
    //       this.allClientBasedJobsLists = jobsList.filter(
    //         (job: any) => !invoiceJobIds.has(job?.id)
    //       );
    //       this.count =
    //         (responseData.clientAllJobsList?.total_no_of_record || 0) -
    //         flatInvoiceJobs.length;
    //       this.page = responseData.clientAllJobsList?.current_page;
    //     } else {
    //       this.allClientBasedJobsLists = jobsList;
    //       this.count =
    //         responseData.clientAllJobsList?.total_no_of_record || 0;
    //     }
    //   });
  }

  public createInvoice() {
    let apiPayload: any = {};
    apiPayload['client_id'] = this.selectedClientId;
    apiPayload['client_name'] = this.selectedClientName;
    const jobsMappedData = this.jobSelection?.map(
      ({
        id,
        job_number,
        job_name,
        job_type_name,
        job_status_name,
        budget_time,
        job_price,
        total_amount,
      }) => ({
        job_id: id,
        job_number,
        job_name,
        job_type_name,
        job_status_name,
        budget_time,
        job_price,
        total_amount,
      })
    );
    apiPayload['job_details'] = jobsMappedData;
    console.log(apiPayload)
    this.apiService
      .postData(
        `${environment.live_url}/${environment.client_invoice}/`,
        apiPayload
      )
      .subscribe(
        (respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.jobSelection = [];
            this.selectedClientId = null;
            this.selectedClientName = '';
            sessionStorage.removeItem('access-name');
            this.router.navigate([
              '/invoice/view-invoice',
              respData?.result?.id,
            ]);
          }
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

  // toggleJobSelection(item: any) {
  //   const index = this.jobSelection?.indexOf(item);
  //   if (index === -1) {
  //     this.jobSelection?.push(item);
  //   } else {
  //     this.jobSelection?.splice(index, 1);
  //   }
  //   const isdirty =
  //     this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
  //   this.formErrorScrollService.setUnsavedChanges(isdirty);
  // }
  getEmployeeName(employees: any): string {
    if (!employees || employees.length === 0) {
    return '-';
    }
    const employee = employees.find((emp: any) => emp?.is_primary === true);
    return employee ? employee?.employee_name : '';
  }
  getManagerName(employees: any): string {
    const manager = employees.find((man: any) => man?.is_primary === true);
    return manager ? manager?.manager_name : '';
  }
  toggleJobSelection(item: any) {
  const index = this.jobSelection.findIndex((job) => job.id === item.id);
  if (index === -1) {
    this.jobSelection.push(item);
  } else {
    this.jobSelection.splice(index, 1);
  }
  const isdirty = this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
  this.formErrorScrollService.setUnsavedChanges(isdirty);
}
isJobSelected(item: any): boolean {
  return this.jobSelection.some(sel => sel.id === item.id);
}


  // isAllJobsSelected() {
  //   return this.jobSelection?.length > 0
  //     ? this.jobSelection?.length === this.allClientBasedJobsLists?.length
  //     : false;
  // }

  // isSomeJobsSelected() {
  //   return this.jobSelection?.length > 0 && !this.isAllJobsSelected();
  // }

  isAllJobsSelected() {
  return (
    this.allClientBasedJobsLists.length > 0 &&
    this.allClientBasedJobsLists.every((job: any) =>
      this.jobSelection.some((sel) => sel.id === job.id)
    )
  );
}

isSomeJobsSelected() {
  return (
    this.jobSelection.length > 0 &&
    !this.isAllJobsSelected()
  );
}

  // toggleAllJobs(event: any) {
  //   if (event.checked) {
  //     this.jobSelection = [...this.allClientBasedJobsLists];
  //   } else {
  //     this.jobSelection = [];
  //   }
  //   const isdirty =
  //     this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
  //   this.formErrorScrollService.setUnsavedChanges(isdirty);
  // }

  toggleAllJobs(event: any) {
  if (event.checked) {
    // Add only jobs that aren’t already in selection
    const newSelections = this.allClientBasedJobsLists.filter(
      (job: any) => !this.jobSelection.some((sel) => sel.id === job.id)
    );
    this.jobSelection = [...this.jobSelection, ...newSelections];
  } else {
    // Remove only current page jobs
    this.jobSelection = this.jobSelection.filter(
      (sel: any) =>
        !this.allClientBasedJobsLists.some((job: any) => job.id === sel.id)
    );
  }
  const isdirty = this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
  this.formErrorScrollService.setUnsavedChanges(isdirty);
}


  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.getClientBasedJobsList();
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getClientBasedJobsList();
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
    //   this.getClientBasedJobsList();
    // } else if (!this.term) {
    //   this.page = 1;
    //   this.getClientBasedJobsList();
    // }
  }

  public getFilterBaseUrl(): string {
    if (this.selectedClientId && this.selectedClientId != null) {
      return `?page=${this.page}&page_size=${this.tableSize}&job-status=Completed&approved-invoice=True&client=${this.selectedClientId}`;
    } else {
      return `?page=${this.page}&page_size=${this.tableSize}&job-status=Completed&approved-invoice=True&client=0`;
    }
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach((key) => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getClientBasedJobsList();
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }

  canDeactivate(): Observable<boolean> {
    const isdirty =
      this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
    return this.formErrorScrollService.isTableRecordChecked(isdirty);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const isdirty =
      this.selectedClientId || this.jobSelection.length >= 1 ? true : false;
    if (isdirty) {
      $event.preventDefault();
    }
  }

  // ========================
  // DROPDOWN PAGINATION LOGIC
  // ========================
  pageSizeDropdown = 50;

  dropdownState: any = {
    client: {
      page: 1,
      list: [],
      search: '',
      totalPages: 1,
      loading: false,
      initialized: false,
    },
  };

  dropdownEndpoints: any = {
    client: environment.all_clients,
  };

  // Selected items for pagination dropdowns
  selectedItemsMap: { [key: string]: any[] } = {
    client: [],
  };

  onSearch(key: string, text: string) {
    const state = this.dropdownState[key];
    state.search = text.trim();
    state.page = 1;
    state.list = [];
    this.fetchData(key, false);
  }

  clearSearchDropD(key: string) {
    this.dropdownState[key].search = '';
    this.dropdownState[key].page = 1;
    this.dropdownState[key].list = [];
    this.fetchData(key, false);
  }

  fetchData(key: string, append = false) {
    const state = this.dropdownState[key];
    state.loading = true;
    let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
    if (state.search) {
      query += `&search=${encodeURIComponent(state.search)}`;
    }
    if (key === 'client') {
      query +=
        this.userRole === 'Admin'
          ? '&status=True'
          : `&status=True&employee-id=${this.user_id}`;
    }
    this.apiService
      .getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
      .subscribe(
        (res: any) => {
          state.totalPages = Math.ceil(
            res.total_no_of_record / this.pageSizeDropdown
          );
          const selectedItems = this.selectedItemsMap[key] || [];
          const selectedIds = selectedItems.map((item) => item.id);
          const filteredResults = res.results.filter(
            (item: any) => !selectedIds.includes(item.id)
          );
          if (append) {
            state.list = [...state.list, ...filteredResults];
          } else {
            state.list = [...selectedItems, ...filteredResults];
          }

          state.loading = false;
        },
        () => {
          state.loading = false;
        }
      );
  }

  updateSelectedItems(key: string, selectedIds: any[]) {
    if (!Array.isArray(selectedIds)) {
      selectedIds = selectedIds != null ? [selectedIds] : [];
    }
    const state = this.dropdownState[key];
    let selectedItems = this.selectedItemsMap[key] || [];
    selectedItems = selectedItems.filter((item) =>
      selectedIds.includes(item.id)
    );

    selectedIds.forEach((id) => {
      if (!selectedItems.some((item) => item.id === id)) {
        const found = state.list.find((item: any) => item.id === id);
        if (found) {
          selectedItems.push(found);
        }
      }
    });
    this.selectedItemsMap[key] = selectedItems;
  }

  // ── Autocomplete methods ──

  private setupAutocomplete(): void {
    this.clientErrorMatcher = this.autoSvc.createErrorMatcher(
      () => null
    );

    this.autoSvc.setupPaginatedSearch(this.clientDisplayControl, (value: string) => {
      if (!value) {
        this.selectedItemsMap['client'] = [];
      } else {
        this.selectedItemsMap['client'] = [];
      }
      this.onSearch('client', value);
    }, this.destroy$);
  }

  onClientOptionSelected(event: any): void {
    const item = event.option.value;
    this.clientDisplayControl.setValue(item, { emitEvent: false });
    this.updateSelectedItems('client', [item.id]);
    this.onClientChange(item.id);
  }

  onClientFocus(): void {
    this.autoSvc.onFocus(
      this.dropdownState.client,
      this.selectedItemsMap['client'] || [],
      () => this.fetchData('client', false)
    );
  }

  onClientBlur(): void {
    setTimeout(() => {
      const displayVal = this.clientDisplayControl.value;
      if (!displayVal || (typeof displayVal === 'string' && !displayVal.trim())) {
        this.clientDisplayControl.setValue('');
        if (this.selectedClientId) {
          // User cleared - reset selection
          this.clearSelection();
        }
      } else if (this.selectedClientId) {
        const selectedItem = this.dropdownState.client.list.find(
          (c: any) => c.id === this.selectedClientId
        );
        if (selectedItem) {
          this.clientDisplayControl.setValue(selectedItem, { emitEvent: false });
        }
      }
    }, 150);
  }
}
