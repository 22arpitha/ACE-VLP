import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormGroupDirective, AbstractControl, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor, Toolbar } from 'ngx-editor';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { urlToFile } from '../../../shared/fileUtils.utils';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { GenericRedirectionConfirmationComponent } from 'src/app/generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateClientComponent implements CanComponentDeactivate, OnInit, OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  editor!: Editor;
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    // or, set options for link:
    //[{ link: { showOpenInNewTab: false } }, 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear',],
  ];
  colorPresets = ['red', '#FF0000', 'rgb(255, 0, 0)'];
  file: any;
  selectedFileLink: any = null;
  selectedFile: File | null = null;
  BreadCrumbsTitle: any = 'Client';
  clientFormGroup: FormGroup;
  allCountry: any = [];
  allSource: any = [];
  allUserRoleList: any = [];
  allEmployeeList: any = [];
  selectedEmployeeList: any = [];
  selectedClient: any = [];
  isEditItem: boolean = false;
  client_id: any;
  isAdmin: boolean = false;
  pageSize = 5;
  currentPage = 1;
  selectedEmployee: any;
  formData: any;
  searchEmployeeTextList: string[] = [];
  filteredEmployeeLists: any[][] = [];
  searchCountryText: any;
  searchSourceText: any;
  accessPermissions = []
  userRole: any;
  user_id: any;
  initialFormValue: any;
  isEnabledEdit: boolean = false;
  shouldDisableFileds: boolean = false;
  employeeDetails = [];
  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private accessControlService: SubModuleService,
    private common_service: CommonServiceService, private router: Router, private datepipe: DatePipe, private modalService: NgbModal, private cdr: ChangeDetectorRef,
    private apiService: ApiserviceService, private formErrorScrollService: FormErrorScrollUtilityService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    // this.getModuleAccess()
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
      this.client_id = this.activeRoute.snapshot.paramMap?.get('id')
      this.isEditItem = true;
      this.getCountryList();
      this.getSourceList();
      this.getAllEmployeeList();
      this.getClientDetails(this.client_id);
    } else {
      this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
      this.getClientUniqueNumber();
      this.getCountryList();
      this.getSourceList();
      this.getAllEmployeeList();
    }
    this.getModuleAccess()
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.intialForm();
    this.clientFormGroup?.valueChanges?.subscribe(() => {
      const currentFormValue = this.clientFormGroup?.getRawValue();
      const isInvalid = this.clientFormGroup.touched && this.clientFormGroup.invalid;
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }

  ngOnDestroy(): void {
    // Destroy the editor to prevent memory leaks
    this.editor.destroy();
    this.formErrorScrollService.resetHasUnsavedValue();
  }

  
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        // console.log(res);
        let temp = res.find((item: any) => item.name === sessionStorage.getItem('access-name'));
        // console.log('temps',temp)
        this.accessPermissions = temp.operations;
        // console.log(this.accessPermissions)
        if (this.userRole != 'Admin') {
          if (this.client_id) {
            if(this.accessPermissions[0]?.['update']){
              this.isEnabledEdit = false;
            } else{
              this.isEnabledEdit = true;
            }
          } else {
            this.isEnabledEdit = false;
            this.shouldDisableFileds = this.accessPermissions[0]?.['create'];
          }
        } 
        else if (this.userRole === 'Admin') {
          if (this.client_id) {
            this.isEnabledEdit = false;
            this.shouldDisableFileds = false;
          } else{
            this.isEnabledEdit = true;
            this.shouldDisableFileds = true;
          }
        }

        // if (this.userRole != 'Admin') {
        //   if (this.client_id) {
        //     this.shouldDisableFileds = this.accessPermissions[0]?.['update'];
        //     this.isEnabledEdit = false;

        //     console.log(this.shouldDisableFileds,this.isEnabledEdit)
        //   } else {
        //     this.shouldDisableFileds = this.accessPermissions[0]?.['create'];
        //     this.isEnabledEdit = true;
        //   }
        // } else {
        //   console.log('admin')
        //   if (this.isEditItem) {
        //     this.isEnabledEdit = false;
        //     this.shouldDisableFileds = true;
        //   } else {
        //     this.isEnabledEdit = true;
        //     this.shouldDisableFileds = false;
        //   }
        //   console.log(this.shouldDisableFileds,this.isEnabledEdit)
        // }
        // console.log('this.shouldDisableFileds', this.shouldDisableFileds)

      }
    )
  }

  public intialForm() {
    this.clientFormGroup = this.fb.group({
      client_number: ['', Validators.required],
      client_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      country: ['', Validators.required],
      source: ['', Validators.required],
      address: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(200)]],
      service_start_date: ['', Validators.required],
      service_end_date: [null],
      client_file: [null],
      contact_details: this.fb.array([this.createContactGroup()], this.duplicateNameValidator),
      employee_details: this.fb.array([]),
      allow_sending_status_report_to_client: [false],
      practice_notes: [''],
    });
  }
  // To Get Unique Employee Number
  public getClientUniqueNumber() {
    this.apiService.getData(`${environment.live_url}/${environment.clients}/?get-client-number=true`).subscribe((respData: any) => {
      this.clientFormGroup.patchValue({ 'client_number': respData?.client_unique_number });
      this.initialFormValue = this.clientFormGroup?.getRawValue();
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  // Get All Country List
  public getCountryList() {
    this.allCountry = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_country}/`).subscribe((respData: any) => {
      this.allCountry = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // Get Role Based Designation
  public getSourceList() {
    this.apiService.getData(`${environment.live_url}/${environment.settings_source}/`).subscribe((respData: any) => {
      this.allSource = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // Get Reporting Manager
  public getAllEmployeeList() {
    this.allEmployeeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  filterEmployeeList(index: number): void {
    const search = this.searchEmployeeTextList[index]?.trim().toLowerCase() || '';
    const employees = [...this.allEmployeeList];

    this.filteredEmployeeLists[index] = search
      ? employees.filter(emp =>
        emp?.user__full_name?.toLowerCase().includes(search)
      )
      : employees;
  }

  onSelectOpened(opened: boolean, index: number): void {
    if (opened && !this.filteredEmployeeLists[index]?.length) {
      this.filteredEmployeeLists[index] = [...this.allEmployeeList];
    }
    // below code is for employee pagination
    this.onDropdownOpened(opened,index);
  }

  public clearSearch(key: any, i?: any) {
    if (key === 'emp') {
      if (i >= 0 && i < this.searchEmployeeTextList.length) {
        this.searchEmployeeTextList[i] = '';
        this.filteredEmployeeLists[i] = [...this.allEmployeeList];
      }
    } else if (key === 'con') {
      this.searchCountryText = '';
    } else {
      this.searchSourceText = '';
    }
  }
  // Search Country
  filteredCountryList() {
    if (!this.searchCountryText) {
      return this.allCountry;
    }
    return this.allCountry.filter((con: any) =>
      con?.country_name?.toLowerCase()?.includes(this.searchCountryText?.toLowerCase())
    );
  }

  filteredSourceList() {
    if (!this.searchSourceText) {
      return this.allSource;
    }
    return this.allSource.filter((source: any) =>
      source?.source_name?.toLowerCase()?.includes(this.searchSourceText?.toLowerCase())
    );
  }
  // Get Employee Detials
  public getClientDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${id}/`).subscribe((respData: any) => {
      this.clientFormGroup.patchValue({
        client_number: respData?.client_number,
        client_name: respData?.client_name,
        email: respData?.email,
        country: respData?.country_id,
        address: respData?.address,
        service_start_date: respData?.service_start_date ? new Date(respData?.service_start_date)?.toISOString() : null,
        service_end_date: respData?.service_end_date ? new Date(respData?.service_end_date)?.toISOString() : null,
        source: respData?.source_id,
        allow_sending_status_report_to_client: respData?.allow_sending_status_report_to_client,
        practice_notes: respData?.practice_notes,
      });
      this.clientFormGroup?.get('client_file')?.setErrors(null);
      if (respData?.client_file) {
        urlToFile(respData?.client_file, this.getFileName(respData?.client_file))
          .then(file => {
            this.file = file;
            this.selectedFile = this.file;
            this.selectedFileLink = `${environment.media_url + respData?.client_file}`;
          }
          )
          .catch(error => console.error('Error:', error));
      } else {
        this.clientFormGroup?.patchValue({ 'client_file': null });
      }
      if (respData?.employee_details && Array.isArray(respData?.employee_details) && respData.employee_details?.length >= 1) {
        this.employeeDetails = respData?.employee_details;
        const empDetailsArray = this.clientFormGroup.get('employee_details') as FormArray;
        empDetailsArray.clear();
        respData?.employee_details?.forEach(({ employee, start_date, end_date,user__full_name }, index, array) => {
          const isLastItem = index === array?.length - 1;
          this.filteredEmployeeLists[index] = this.allEmployeeList;
          const empForm = this.fb.group({
            employee_id: [{ value: employee, disabled: !isLastItem }],
            start_date: [{ value: start_date, disabled: !isLastItem }],
            end_date: [{ value: end_date, disabled: !isLastItem }]
          });
          empDetailsArray.push(empForm);
          
          
          // emp dropdown code, selected stays on top)
          this.initEmployeeDropdownState(index);
          this.selectedItemsMap[`emp_${index}`] = [{
            user_id: employee,
            user__full_name: user__full_name 
          }];
        this.dropdownState[`emp_${index}`].list = this.selectedItemsMap[`emp_${index}`];

          const totalItems = this.employeeFormArray.length;
          const totalPages = Math.ceil(totalItems / this.pageSize);
          this.currentPage = totalPages; // go to last page
          this.setCurrentPageRows();

        });
      } else {
        this.clientFormGroup?.patchValue({ 'employee_details': [] });
      }
      if (respData?.contact_details && Array.isArray(respData?.contact_details) && respData.contact_details?.length >= 1) {
        const contactDetailsArray = this.clientFormGroup.get('contact_details') as FormArray;
        contactDetailsArray.clear();
        respData?.contact_details?.forEach(({ name, email, phone_number }, index, array) => {
          const isLastItem = index === array?.length - 1;
          const contactForm = this.fb.group({
            name: [{ value: name, disabled: !isLastItem }],
            email: [{ value: email, disabled: !isLastItem }],
            phone_number: [{ value: phone_number, disabled: !isLastItem }]
          });
          contactDetailsArray.push(contactForm);
        });
      }
      this.initialFormValue = this.clientFormGroup?.getRawValue();
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  public get f() {
    return this.clientFormGroup.controls;
  }

  get contactDetails(): FormArray {
    return this.clientFormGroup?.get('contact_details') as FormArray;
  }

  get employeeFormArray() {
    return this.clientFormGroup?.get('employee_details') as FormArray;
  }

  createEmployeeControl(): FormGroup {
    return this.fb.group({
      employee_id: [null, Validators.required],
      start_date: [null, Validators.required],
      end_date: [null],
    });
  }

  private createContactGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      phone_number: ['', Validators.required],
    });
  }

  resetDate() {
    this.clientFormGroup?.get('service_end_date')?.setValue(null);
  }
  public addContact() {
    // console.log(this.contactDetails?.controls);
    let lastItemIndex = this.contactDetails?.length - 1;
    // Disable the previous contact group before adding a new one
    if (this.contactDetails?.at(lastItemIndex)?.valid && this.contactDetails?.length < 5) {
      const contact = this.contactDetails?.at(lastItemIndex);
      ['name', 'email', 'phone_number']?.forEach(field => contact?.get(field)?.disable());
      // Add the new contact group after disabling the previous one
      this.contactDetails.push(this.createContactGroup());
      this.contactDetails.markAllAsTouched();

    }
  }



  public deleteContact(index: number) {
    if (this.contactDetails?.length > 1) {
      this.contactDetails?.removeAt(index);
      const lastItemIndex = this.contactDetails?.length - 1;
      const lastItem = this.contactDetails?.at(lastItemIndex);
      if (lastItem) {
        ['name', 'email', 'phone_number']?.forEach(field => lastItem?.get(field)?.enable());
      }
    }
  }

  public editContact(index: number) {
    const contact = this.contactDetails?.at(index);
    contact?.get('name')?.enable();
    contact?.get('email')?.enable();
    contact?.get('phone_number')?.enable();
  }

  saveChanges(index: number) {
    const contact = this.contactDetails?.at(index);
    contact.markAllAsTouched();
    contact.updateValueAndValidity();
    if (index <= 4 && contact?.valid) {
      contact?.get('name')?.disable();
      contact?.get('email')?.disable();
      contact?.get('phone_number')?.disable();
    }

  }

  validateKeyPress(event: KeyboardEvent) {
    // Get the key code of the pressed key
    const keyCode = event.which || event.keyCode;

    // Allow only digits (0-9), backspace, and arrow keys
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
      event.preventDefault(); // Prevent the default action (i.e., entering the character)
    }
  }

  public triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  public fileFormatValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const allowedFormats = ['.xlsx', '.xls', 'doc', 'docx', 'pdf'];;
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
    const file = control.value;

    if (file) {
      // console.log('file',file);
      const fileExtension = (/[.]/.exec(file)) ? file.split('.').pop()?.toLowerCase() : '';
      // console.log('fileExtension',fileExtension);
      const fileSize = file.size;

      if (allowedFormats.includes(fileExtension)) {
        return of({ accept: false }); // Invalid file format
      }

      if (fileSize > maxSize) {
        return of({ maxSize: true }); // File size exceeds the limit
      }
    }

    return of(null);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files?.length > 0) {
      const selectedFile = input.files[0];

      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type === "application/msword" ||
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/pdf"
      ) {
        this.file = selectedFile;
        this.selectedFile = this.file;
        this.selectedFileLink = null;
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
        this.selectedFile = null;
      }
    }
  }

  public enbleFields() {
    this.isEnabledEdit = true;
    if (this.userRole === 'Admin') {
      this.isEnabledEdit = true;
      this.shouldDisableFileds = true;
    }
    else {
      this.isEnabledEdit = true;
      if(this.client_id){
         this.shouldDisableFileds = this.accessPermissions[0]?.['update'];
      }
    }
  }

  public backBtnFunc(): void {
    if (this.isEditItem && this.hasUnsavedChanges()) {
      this.showConfirmationPopup().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.cleanupAndNavigate();
        }
      });
    } else {
      this.cleanupAndNavigate();
    }
  }

  public hasUnsavedChanges(): boolean {
    const currentFormValue = this.clientFormGroup.getRawValue();
    const isFormChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return isFormChanged || this.clientFormGroup.dirty;
  }

  private cleanupAndNavigate(): void {
    sessionStorage.removeItem('access-name');
    this.router.navigate(['/client/all-client']);
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

  public deleteClient() {
    if (this.client_id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.deleteContent(this.client_id);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(id: any) {
    this.apiService.delete(`${environment.live_url}/${environment.clients}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.selectedClient = [];
        this.apiService.showSuccess(data.message);
        this.resetFormState();
        this.router.navigate(['/client/all-client']);
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  public saveClientDetails() {
    if (this.clientFormGroup.invalid) {
      this.clientFormGroup.markAllAsTouched();
      this.formErrorScrollService.setUnsavedChanges(true);
      this.formErrorScrollService.scrollToFirstError(this.clientFormGroup);
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        this.apiService.updateData(`${environment.live_url}/${environment.clients}/${this.client_id}/`, this.formData).subscribe((respData: any) => {
          if (respData['result'] && respData['result']['error']) {
            this.handleErrors(respData);
          } else {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.router.navigate(['/client/all-client']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.formData = this.createFromData();
        this.apiService.postData(`${environment.live_url}/${environment.clients}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.router.navigate(['/client/all-client']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  handleErrors(respData: any): void {
    if (respData?.result?.detail?.length) {
      respData.result.detail.forEach((element: any) => {
        this.apiService.showError(element['error']);
      });
    }
    this.resetFormState();
    this.router.navigate(['/client/all-client']);
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    this.isEditItem = false;
    this.initialFormValue = this.clientFormGroup?.getRawValue();
  }

  public createFromData() {
    this.formData = new FormData();
    if (this.file) {
      this.formData.set("client_file", this.file || null);
    } else {
      this.formData.set("client_file", null);
    }
    let updatedStartDateValue = this.datepipe.transform(this.clientFormGroup?.get('service_start_date')?.value, 'YYYY-MM-dd');
    let updatedEndDateValue = this.datepipe.transform(this.clientFormGroup?.get('service_end_date')?.value, 'YYYY-MM-dd');
    this.formData.set("client_number", this.clientFormGroup?.get('client_number')?.value);
    this.formData.set("client_name", this.clientFormGroup?.get('client_name')?.value);
    this.formData.set("email", this.clientFormGroup?.get('email')?.value);
    this.formData.set("country", this.clientFormGroup?.get('country')?.value);
    this.formData.set("address", this.clientFormGroup?.get('address')?.value);
    this.formData.set("service_start_date", updatedStartDateValue);
    this.formData.set("service_end_date", updatedEndDateValue || null);
    this.formData.set("source", this.clientFormGroup?.get('source')?.value);
    this.formData.set("practice_notes", this.clientFormGroup?.get('practice_notes')?.value || '');
    this.formData.set("allow_sending_status_report_to_client", this.clientFormGroup?.get('allow_sending_status_report_to_client')?.value || false);
    const result = this.clientFormGroup?.get('contact_details')?.getRawValue().map((item: any) => {
      return {
        ...item,
        phone_number: item?.phone_number?.toString()
      };
    });
    this.formData.set("contact_details", JSON.stringify(result) || []);
    const empresult = this.clientFormGroup?.get('employee_details')?.getRawValue().map((item: any) => {
      return {
        employee_id: item?.employee_id?.toString(),
        start_date: this.datepipe.transform(item?.start_date, 'YYYY-MM-dd'),
        end_date: this.datepipe.transform(item?.end_date, 'YYYY-MM-dd'),
      };
    });
    this.formData.set("employee_details", JSON.stringify(empresult) || []);
    return this.formData;
  }

  addEmployee() {
    if (this.employeeFormArray.length >= 1) {
      let lastItemIndex = this.employeeFormArray.length - 1;
      //  console.log("emp",this.employeeFormArray.controls)
      if (this.employeeFormArray?.at(lastItemIndex)?.valid) {
        const empControls = this.employeeFormArray.at(lastItemIndex);
        ['employee_id', 'start_date', 'end_date'].forEach(field => empControls?.get(field)?.disable());
        this.employeeFormArray.markAllAsTouched();
        this.employeeFormArray.push(this.createEmployeeControl());
        const newIndex = this.employeeFormArray.length - 1;
        // below is new code 
        this.initEmployeeDropdownState(newIndex);
        this.filteredEmployeeLists[newIndex] = [...this.allEmployeeList];
      }
    }
    else {
      this.filteredEmployeeLists[0] = [...this.allEmployeeList];
      this.employeeFormArray.push(this.createEmployeeControl());
      // below is new code 
       this.initEmployeeDropdownState(0);
    }
    const totalItems = this.employeeFormArray.length;
    const totalPages = Math.ceil(totalItems / this.pageSize);
    this.currentPage = totalPages; // go to last page
    this.setCurrentPageRows();

  }


  // removeEmployee(index: number) {
  //   if (this.employeeFormArray?.length > 1) {
  //     this.employeeFormArray?.removeAt(index);
  //     if (this.searchEmployeeTextList && this.searchEmployeeTextList.length > index) {
  //       this.searchEmployeeTextList.splice(index, 1);
  //     }
  //     if (this.filteredEmployeeLists && this.filteredEmployeeLists.length > index) {
  //       this.filteredEmployeeLists.splice(index, 1);
  //     }
  //     const lastItemIndex = this.employeeFormArray?.length - 1;
  //     const lastItem = this.employeeFormArray?.at(lastItemIndex);
  //     if (lastItem) {
  //       ['employee_id', 'start_date', 'end_date']?.forEach(field => lastItem?.get(field)?.enable());
  //     }
  //   }
  //   const totalItems = this.employeeFormArray.length;
  //   const totalPages = Math.ceil(totalItems / this.pageSize);
  //   if (this.currentPage > totalPages) {
  //     this.currentPage = Math.max(1, totalPages);
  //     this.setCurrentPageRows();
  //   }
  // }


  removeEmployee(index: number) {
  if (this.employeeFormArray?.length > 1) {
    this.employeeFormArray.removeAt(index);

    const newDropdownState: any = {};
    const newSelectedItemsMap: any = {};
    this.employeeFormArray.controls.forEach((_, i) => {
      newDropdownState[`emp_${i}`] = this.dropdownState[`emp_${i >= index ? i + 1 : i}`] || this.initEmployeeDropdownState(i);
      newSelectedItemsMap[`emp_${i}`] = this.selectedItemsMap[`emp_${i >= index ? i + 1 : i}`] || [];
    });
    this.dropdownState = newDropdownState;
    this.selectedItemsMap = newSelectedItemsMap;

    const lastItemIndex = this.employeeFormArray?.length - 1;
    const lastItem = this.employeeFormArray?.at(lastItemIndex);
    if (lastItem) {
      ['employee_id', 'start_date', 'end_date'].forEach(field => lastItem?.get(field)?.enable());
    }
  }

  const totalItems = this.employeeFormArray.length;
  const totalPages = Math.ceil(totalItems / this.pageSize);
  if (this.currentPage > totalPages) {
    this.currentPage = Math.max(1, totalPages);
  }
  this.setCurrentPageRows();
}


  public onEmployeeChange(event: any, i: any) {
    const formArray = this.employeeFormArray.controls;
    const isEmployeeDuplicate = formArray.some((control: any, index: number) => {
      return index !== i && control.get('employee_id')?.value === event.value; // Skip the current row (index !== i)
    });
    if (isEmployeeDuplicate) {
      this.employeeFormArray.at(i).get('employee_id')?.reset();
      this.employeeFormArray.at(i).get('start_date')?.reset();
      this.employeeFormArray.at(i).get('end_date')?.reset();
    } else {
      this.employeeFormArray.at(i).patchValue({ 'employee_id': event.value });
    }

    this.searchEmployeeTextList[i] = '';
    this.updateSelectedItems(`emp_${i}`,event.value)
  }

  public editEmpployee(index: number) {
    const empItem = this.employeeFormArray.at(index);
    empItem?.get('employee_id')?.enable();
    empItem?.get('start_date')?.enable();
    empItem?.get('end_date')?.enable();
  }

  public saveEmpployeeChanges(index: number) {
    const empItem = this.employeeFormArray.at(index);
    if (index <= this.allEmployeeList?.length && empItem.valid) {
      empItem?.get('employee_id')?.disable();
      empItem?.get('start_date')?.disable();
      empItem?.get('end_date')?.disable();
    }
  }

  getEmployeeName(userId: number): string {
    const employee = this.allEmployeeList?.find((emp: any) => emp?.user_id === userId);
    return employee ? employee?.user__full_name : '';
  }

  get currentPageRows() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.employeeFormArray.controls.slice(startIndex, endIndex);
  }

  public setCurrentPageRows() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.employeeFormArray.controls.slice(startIndex, endIndex);
  }

  onPageChanged(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.setCurrentPageRows();
  }

  public getContinuousIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }


  public getFileName(url: any) {
    return url?.split('/')?.pop();
  }

  public openFileInNewTab() {
    if (this.selectedFileLink) {
      window.open(this.selectedFileLink, '_blank');
    }

  }
  private duplicateNameValidator(control: AbstractControl) {
    const formArray = control as FormArray;
    const emailset = new Set<string>();
    const phoneset = new Set<number>();

    for (let i = 0; i < formArray?.controls?.length; i++) {
      const emailControl = formArray?.at(i)?.get('email');
      const phoneNumberControl = formArray?.at(i)?.get('phone_number');

      if (!emailControl || !phoneNumberControl) continue;

      const email = emailControl.value?.trim()?.toLowerCase();
      const value = phoneNumberControl?.value;

      const emailErrors = emailControl.errors || {};
      const phoneErrors = phoneNumberControl.errors || {};

      // Check for duplicate name
      if (email && emailset.has(email)) {
        emailControl?.setErrors({ ...emailErrors, duplicateEmail: true });
      } else {
        emailset.add(email);
        if (emailErrors['duplicateEmail']) {
          delete emailErrors['duplicateEmail'];
          emailControl?.setErrors(Object.keys(emailErrors)?.length ? emailErrors : null);
        }
      }

      // Check for duplicate value
      if (value && phoneset.has(value)) {
        phoneNumberControl?.setErrors({ ...phoneErrors, duplicatePhoneNo: true });
      } else {
        phoneset.add(value);
        if (phoneErrors['duplicatePhoneNo']) {
          delete phoneErrors['duplicatePhoneNo'];
          phoneNumberControl?.setErrors(Object.keys(phoneErrors)?.length ? phoneErrors : null);
        }
      }
    }

    return null;
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.clientFormGroup?.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged, this.clientFormGroup);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const currentFormValue = this.clientFormGroup.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    if (isFormChanged || this.clientFormGroup.dirty) {
      $event.preventDefault();
    }
  }

  shouldShowAddButton(data: any): boolean {
    console.log(data)
    const currentEmployee = data.value.employee_id;
    const matchedDetail = this.employeeDetails.find(emp => emp.employee === currentEmployee);
    const showDelete = matchedDetail?.show_delete ?? false;
    return !showDelete;
  }

  dateClass = (date: Date) => {
    return date.getDay() === 0 ? 'sunday-highlight' : '';
  };



  // =============== new code =====================

pageSizeDropdown = 10;

dropdownState: { [key: string]: any } = {};
selectedItemsMap: { [key: string]: any[] } = {};
scrollListeners: { [key: string]: (event: Event) => void } = {};

dropdownEndpoints = {
  emp: environment.employee
};

initEmployeeDropdownState(index: number) {
  const key = `emp_${index}`;
  if (!this.dropdownState[key]) {
    this.dropdownState[key] = {
      page: 1,
      list: [],
      search: '',
      totalPages: 1,
      loading: false,
      initialized: false
    };
    this.selectedItemsMap[key] = [];
  }
}


fetchData(key: string, append = false) {
  const state = this.dropdownState[key];
  state.loading = true;

  let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
  if (state.search) {
    query += `&search=${encodeURIComponent(state.search)}`;
  }
  if (key.startsWith('emp_')) {
    query += `&is_active=True&employee=True`;
  }

  this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints.emp}/?${query}`)
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
      // console.log(this.dropdownState)
      state.loading = false;
      this.cdr.detectChanges();
    }, () => {
      state.loading = false;
    });
}

onSearch(key: string, text: string) {
  const state = this.dropdownState[key];
  state.search = text.trim();
  state.page = 1;
  state.list = [];
  this.fetchData(key, false);
}

clearSearchDropD(key: string) {
  const state = this.dropdownState[key];
  state.search = '';
  state.page = 1;
  state.list = [];
  this.fetchData(key, false);
}


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
  const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;

  if (atBottom && !state.loading && state.page < state.totalPages) {
    state.page++;
    this.fetchData(key, true);
  }
}


onDropdownOpened(isOpen: boolean, index: number) {
  // console.log(isOpen)
  const key = `emp_${index}`;
  if (isOpen) {
    if (!this.dropdownState[key]?.initialized || this.dropdownState[key].list.length === 0) {
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

updateSelectedItems(key: string, selectedId: any) {
  const state = this.dropdownState[key];
  let selectedItems = this.selectedItemsMap[key] || [];

  selectedItems = selectedItems.filter(item => item.user_id === selectedId);

  if (!selectedItems.some(item => item.user_id === selectedId)) {
    const found = state.list.find(item => item.user_id === selectedId);
    if (found) {
      selectedItems.push(found);
    }
  }

  this.selectedItemsMap[key] = selectedItems;
}

getOptionsWithSelectedOnTop(key: string) {
  const state = this.dropdownState[key];
  const selectedItems = this.selectedItemsMap[key] || [];
  const unselectedItems = state.list.filter(item =>
    !selectedItems.some(sel => sel.user_id === item.user_id)
  );
  return [...selectedItems, ...unselectedItems];
}




  
}
