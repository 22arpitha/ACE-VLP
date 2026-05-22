import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from '../../../service/ticket.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { GenericRedirectionConfirmationComponent } from '../../../generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatAutocompleteService } from '../../../service/mat-autocomplete.service';


@Component({
  selector: 'app-new-ticket',
  templateUrl: './new-ticket.component.html',
  styleUrls: ['./new-ticket.component.scss'],
  standalone:false,
  providers: [
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
      deps: [Overlay]
    }
  ]
})
export class NewTicketComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('employeeAutoRef') employeeAutoRef!: MatAutocomplete;
  ticketForm!: FormGroup;
  submitting = false;
  uploadingFile = false;
  selectedFile?: File;
  selectedFileName?: string;
  private destroy$ = new Subject<void>();

  // ── Autocomplete infrastructure ──
  employeeDisplayControl = new FormControl('');
  displayEmployeeFn!: (item: any) => string;
  employeeErrorMatcher!: ErrorStateMatcher;
  // ──────────────────────────────────

  // Current user info (should come from auth service)
  currentUserId = '';
  currentUserName = '';
  BreadCrumbsTitle: any = 'Create Tickets';
  initialFormValue: any;
  userRole: any;
  designation: any = '';
  today = new Date();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ticketService: TicketService,
    private apiService: ApiserviceService,
    private commonService: CommonServiceService,
    private modalService: NgbModal,
    private formErrorScrollService: FormErrorScrollUtilityService,
    private autoSvc: MatAutocompleteService
  ) {
    this.commonService.setTitle(this.BreadCrumbsTitle)
    this.currentUserId = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.displayEmployeeFn = this.autoSvc.createDisplayFn('user__full_name');
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupAutocomplete();
    if (this.isEmployee) {
      this.getUrserData(this.currentUserId);
    }
  }

  ngAfterViewInit(): void {
    this.autoSvc.setupScrollListener(
      this.employeeAutoRef,
      this.dropdownState.employee,
      () => this.fetchData('employee', true),
      this.destroy$
    );
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
        this.designation = res.designation__designation_name || '';
        const data:any = {
          user_id: res.user_id,
          user__full_name: res.user__first_name + ' ' + res.user__last_name
        };
        const shouldPrefillAndDisable =
          this.userRole !== 'Admin' &&
          this.designation?.toLowerCase() !== 'technical team';

        if (shouldPrefillAndDisable) {
          this.ticketForm.get('employee_id')?.disable();

          this.selectedItemsMap['employee'] = [data];
          this.dropdownState.employee.list = [data];
          this.ticketForm.get('employee_id')?.setValue(res.user_id);
          this.employeeDisplayControl.setValue(data, { emitEvent: false });
          this.employeeDisplayControl.disable();
        } else {
          this.ticketForm.get('employee_id')?.enable();
          this.employeeDisplayControl.enable();
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

  // Drag & Drop
  isDragOver = false;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.handleDroppedFile(file);
  }

  handleDroppedFile(file: File) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.apiService.showError('File size must be less than 10MB');
      return;
    }
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.ticketForm.patchValue({ attachment: file });
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
    this.employeeDisplayControl.setValue('', { emitEvent: false });
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

  public onEmployeeChange(employeeId: any) {
    this.updateSelectedItems('employee', employeeId);
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

  selectedItemsMap: { [key: string]: any[] } = {
    employee: [],
  };

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


  // ── Autocomplete methods ──

  private setupAutocomplete(): void {
    this.employeeErrorMatcher = this.autoSvc.createErrorMatcher(
      () => this.ticketForm?.get('employee_id') as FormControl
    );

    this.autoSvc.setupPaginatedSearch(this.employeeDisplayControl, (value: string) => {
      if (!value) {
        this.ticketForm.get('employee_id')?.setValue('');
        this.ticketForm.get('employee_id')?.markAsDirty();
        this.selectedItemsMap['employee'] = [];
      } else {
        this.selectedItemsMap['employee'] = [];
        this.ticketForm.get('employee_id')?.setValue('');
      }
      this.onSearch('employee', value);
    }, this.destroy$);
  }

  onEmployeeOptionSelected(event: any): void {
    const item = event.option.value;
    this.ticketForm.get('employee_id')?.setValue(item.user_id);
    this.ticketForm.get('employee_id')?.markAsDirty();
    this.employeeDisplayControl.setValue(item, { emitEvent: false });
    this.updateSelectedItems('employee', [item.user_id]);
    this.onEmployeeChange([item.user_id]);
  }

  onEmployeeFocus(): void {
    this.autoSvc.onFocus(
      this.dropdownState.employee,
      this.selectedItemsMap['employee'] || [],
      () => this.fetchData('employee', false)
    );
  }

  onEmployeeBlur(): void {
    setTimeout(() => {
      const ctrl = this.ticketForm.get('employee_id');
      const displayVal = this.employeeDisplayControl.value;
      if (!displayVal || (typeof displayVal === 'string' && !displayVal.trim())) {
        ctrl?.setValue('');
        this.employeeDisplayControl.setValue('');
      }
      ctrl?.markAsTouched();
    }, 150);
  }

}