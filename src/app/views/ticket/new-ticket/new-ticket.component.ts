import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from 'src/app/service/ticket.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { GenericRedirectionConfirmationComponent } from 'src/app/generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-new-ticket',
  templateUrl: './new-ticket.component.html',
  styleUrls: ['./new-ticket.component.scss'],
  standalone:false
})
export class NewTicketComponent implements OnInit, OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  ticketForm!: FormGroup;
  submitting = false;
  uploadingFile = false;
  selectedFile?: File;
  selectedFileName?: string;
  private destroy$ = new Subject<void>();

  // Current user info (should come from auth service)
  currentUserId = '';
  currentUserName = '';
  BreadCrumbsTitle: any = 'Create Tickets';
  initialFormValue: any;
  userRole: any;
  departmentName: any = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ticketService: TicketService,
    private apiService: ApiserviceService,
    private commonService: CommonServiceService,
    private modalService: NgbModal,
    private formErrorScrollService: FormErrorScrollUtilityService
  ) {
    this.commonService.setTitle(this.BreadCrumbsTitle)
    this.currentUserId = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.isEmployee) {
      this.getUrserData(this.currentUserId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmployee(): boolean {
    return this.userRole !== 'Admin';
  }

  initializeForm(): void {
    this.ticketForm = this.fb.group({
      employee_id: [{ value: null, disabled: false }, Validators.required],
      issue_input: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      details: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      attachment: [null]
    });
  }

  getUrserData(id:any) {
    this.apiService.getData(`${environment.live_url}/${environment.user}/${id}/`).subscribe((res: any) => {
      if (res) {
        this.departmentName = res.department__department_name || '';
        const data = {
          user_id: res.user_id,
          user__full_name: res.user__first_name + ' ' + res.user__last_name
        };
        const shouldPrefillAndDisable =
          this.userRole !== 'Admin' &&
          this.departmentName?.toLowerCase() !== 'it department';

        if (shouldPrefillAndDisable) {
          this.ticketForm.get('employee_id')?.disable();

          this.selectedItemsMap['employee'] = [data];
          this.dropdownState.employee.list = [data];
          this.ticketForm.get('employee_id')?.setValue(res.user_id);
        } else {
          this.ticketForm.get('employee_id')?.enable();
        }

        // if (this.isEmployeeDisabled) {
        //   this.selectedItemsMap['employee'] = [data];
        //   this.dropdownState.employee.list = [data];
        //   this.ticketForm.get('employee_id')?.setValue(res.user_id);
        // }
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        input.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed types: images, PDF, Word documents, and text files');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.ticketForm.patchValue({ attachment: file });
    }
  }

  removeFile(): void {
    this.selectedFile = undefined;
    this.selectedFileName = undefined;
    this.ticketForm.patchValue({ attachment: null });

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.ticketForm.invalid || this.submitting) {
      this.markFormGroupTouched(this.ticketForm);
      return;
    }
    this.submitting = true;
    const formValues = this.ticketForm.getRawValue();
    const ticketData = new FormData();
    ticketData.append('employee_id', formValues['employee_id']);
    ticketData.append('issue_input', formValues['issue_input']);
    ticketData.append('details', formValues['details']);
    if (this.selectedFile) {
      ticketData.append('attachment', this.selectedFile, this.selectedFile.name);
    } else {
      ticketData.append('attachment', '');
    }
    // Create ticket
    // const ticketData = {
    //   employee_id: this.currentUserId,
    //   issue: this.ticketForm.get('issue')?.value,
    //   details: this.ticketForm.get('details')?.value,
    //   attachment: this.selectedFile
    // };

    this.apiService.postData(`${environment.live_url}/${environment.it_ticket}/`, ticketData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticket: any) => {
          this.submitting = false;
          this.apiService.showSuccess(ticket?.message);
          this.resetForm();
          // alert('Ticket raised successfully!');
          // this.router.navigate(['/tickets', ticket.id]);
        },
        error: (error: any) => {
          console.error('Error creating ticket:', error);
          this.submitting = false;
        }
      });

  }

  resetForm() {
    this.formGroupDirective?.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    this.selectedFile = undefined;
    this.selectedFileName = undefined;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (this.isEmployee) {
      this.getUrserData(this.currentUserId);
    }
    this.initialFormValue = this.ticketForm?.getRawValue();
  }
  public hasUnsavedChanges(): boolean {
    const currentFormValue = this.ticketForm.getRawValue();
    const isFormChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return isFormChanged || this.ticketForm.dirty;
  }
  cancel(): void {
    if (this.hasUnsavedChanges()) {
      this.showConfirmationPopup().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.router.navigate(['/it-support/tickets/ticket-list']);
        }
      });
    } else {
      this.router.navigate(['/it-support/tickets/ticket-list']);
    }
  }

  private showConfirmationPopup(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const modalRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
        size: 'sm' as any,
        backdrop: true,
        centered: true,
      });

      modalRef.componentInstance.status.subscribe((resp: any) => {
        observer.next(resp === 'ok');
        observer.complete();
        modalRef.close();
      });
    });
  }

  // Helper method to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form controls
  get issue_input() { return this.ticketForm.get('issue_input'); }
  get details() { return this.ticketForm.get('details'); }

  // Helper method to check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  // Get character count
  getCharacterCount(fieldName: string): number {
    const value = this.ticketForm.get(fieldName)?.value || '';
    return value.length;
  }

  // Get max length for a field
  getMaxLength(fieldName: string): number {
    const validators = this.ticketForm.get(fieldName)?.validator;
    if (validators) {
      const validationResult = validators({} as any);
      if (validationResult && validationResult['maxlength']) {
        return validationResult['maxlength'].requiredLength;
      }
    }
    return fieldName === 'issue_input' ? 200 : 2000;
  }


  // dropdown 

  public onEmployeeChange(event: any) {
    this.updateSelectedItems('employee', event.value);
  }

  pageSizeDropdown = 50;

  dropdownState: any = {
    employee: {
      page: 1,
      list: [],
      search: '',
      totalPages: 1,
      loading: false,
      initialized: false
    }
  };

  dropdownEndpoints: any = {
    employee: environment.user,
  };

  private scrollListeners: { [key: string]: (event: Event) => void } = {};


  selectedItemsMap: { [key: string]: any[] } = {
    employee: [],
  };


  removeScrollListener(key: string) {
    const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
    if (panel && this.scrollListeners[key]) {
      panel.removeEventListener('scroll', this.scrollListeners[key]);
      delete this.scrollListeners[key];
    }
  }

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
    if (key === 'employee') {
      query += `&is_active=True&employee=True`;
      if (this.userRole === 'Manager') {
        query += `&reporting_manager_id=${this.currentUserId}`;
      }
    }


    this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
      .subscribe((res: any) => {
        state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
        const selectedItems = this.selectedItemsMap[key] || [];
        const selectedIds = selectedItems.map(item => item.user_id);
        const filteredResults = res.results.filter(
          (item: any) => !selectedIds.includes(item.user_id)
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
    selectedItems = selectedItems.filter(item => selectedIds.includes(item.user_id));
    selectedIds.forEach(id => {
      if (!selectedItems.some(item => item.user_id === id)) {
        const found = state.list.find((item: any) => item.user_id === id);
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
    const unselectedItems = state.list.filter((item: any) =>
      !selectedItems.some((sel: any) => sel.user_id === item.user_id)
    );
    return [...selectedItems, ...unselectedItems];
  }


  // Called when the dropdown opens or closes
  onDropdownOpened(isOpen: boolean, key: string) {
    if (isOpen) {
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




}