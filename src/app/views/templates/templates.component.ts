import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormGroupDirective,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, filter, Observable, of, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from '../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../service/apiservice.service';
import { CommonServiceService } from '../../service/common-service.service';
import { SubModuleService } from '../../../app/service/sub-module.service';
import { GenericDeleteComponent } from '../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../environments/environment';
import { fullUrlToFile } from '../../shared/fileUtils.utils';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent
  implements CanComponentDeactivate, OnInit, OnDestroy
{
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Templates';
  isEditItem: boolean = false;
  templateForm: FormGroup;
  selectedTemplate: any;
  allTemplatesList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  private searchSubject = new Subject<string>();
  filterQuery: string;
  tableSizes = [50, 75, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    template_name: false,
  };
  arrow: boolean = false;
  term: any;
  file: any;
  selectedFile: File | null = null;
  formData: any;
  accessPermissions = [];
  user_id: any;
  userRole: any;
  initialFormValue: any;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    private common_service: CommonServiceService,
    private apiService: ApiserviceService,
    private formUtilityService: FormErrorScrollUtilityService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }
  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.templateForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.templateForm?.getRawValue();
      const isInvalid = this.templateForm.touched && this.templateForm.invalid;
      const isFormChanged: boolean =
        JSON.stringify(currentFormValue) !==
        JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
    this.searchSubject.pipe(
              debounceTime(500),
              distinctUntilChanged(),
              filter((term: string) => term === '' || term.length >= 2)
            ).subscribe((search: string) => {
              this.term = search
               this.getAllTemplates();
            });
  }
  ngOnDestroy(): void {
    this.formUtilityService.resetHasUnsavedValue();
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (access) => {
        if (access) {
          this.accessPermissions = access[0].operations;
          this.getAllTemplates();
        }
      },
      (error: any) => {
        this.apiService.showError(error?.error?.error?.detail);
      }
    );
  }

  public initializeForm() {
    this.templateForm = this.fb.group({
      template_name: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/
          ),
        ],
      ],
      template_file: ['', Validators.required, ], //this.fileFormatValidator
      password: [
        '',
        [
          Validators.pattern(
            /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/
          ),
          Validators.maxLength(20),
        ],
      ],
      when_to_use: [
        '',
        [
          Validators.pattern(
            /^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/
          ),
          Validators.maxLength(100),
        ],
      ],
    });
    this.initialFormValue = this.templateForm?.getRawValue();
  }

  public get f() {
    return this.templateForm?.controls;
  }

  
  public getAllTemplates() {
     this.filterQuery = this.getFilterBaseUrl();
     if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    }
    this.allTemplatesList = [];
    this.apiService
      .getData(`${environment.live_url}/${environment.templates}/${this.filterQuery}`)
      .subscribe(
        (respData: any) => {
          this.allTemplatesList = respData?.results;
          const noOfPages: number = respData?.total_pages;
          this.count = noOfPages * this.tableSize;
          this.page = respData?.current_page;
        },
        (error: any) => {
          this.apiService.showError(error?.error?.error?.detail);
        }
      );
  }
  public saveTemplateDetails() {
    console.log(this.templateForm.value)
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        this.apiService
          .updateData(
            `${environment.live_url}/${environment.templates}/${this.selectedTemplate}/`,
            this.formData
          )
          .subscribe(
            (respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                this.resetFormState();
                this.page = 1;
                this.getAllTemplates();
              }
            },
            (error: any) => {
              this.apiService.showError(error?.error?.detail);
            }
          );
      } else {
        this.formData = this.createFromData();
        this.apiService
          .postData(
            `${environment.live_url}/${environment.templates}/`,
            this.formData
          )
          .subscribe(
            (respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                this.resetFormState();
                this.page = 1
                this.getAllTemplates();
              }
            },
            (error: any) => {
              this.apiService.showError(error?.error?.detail);
            }
          );
      }
    }
  }
  public createFromData() {
    this.formData = new FormData();
    if (this.file) {
      this.formData.set('template_file', this.file || '');
      this.formData.set(
        'template_name',
        this.templateForm?.get('template_name')?.value || ''
      );
      this.formData.set(
        'password',
        this.templateForm?.get('password')?.value || ''
      );
      this.formData.set(
        'when_to_use',
        this.templateForm?.get('when_to_use')?.value || ''
      );
    }

    return this.formData;
  }

  public resetFormState() {
    this.templateForm.controls['template_file'].setValidators([
      Validators.required,
    ]);
    this.formGroupDirective.resetForm();
    this.formUtilityService.resetHasUnsavedValue();
    this.selectedFile = null;
    this.file = null;
    this.isEditItem = false;
    this.term = '';
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.initialFormValue = this.templateForm?.getRawValue();
  }

  public sort(direction: string, column: string) {
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getAllTemplates();
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getAllTemplates();
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.getAllTemplates();
    }
  }

  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${encodeURIComponent(this.term.trim())}` : '';
    return `${base}${searchParam}`;
  }
  public confirmDelete(content: any) {
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true,
      });
      modelRef.componentInstance.status.subscribe((resp) => {
        if (resp == 'ok') {
          this.deleteContent(content);
          modelRef.close();
        } else {
          modelRef.close();
        }
      });
    }
  }
  public deleteContent(item: any) {
    this.apiService
      .delete(`${environment.live_url}/${environment.templates}/${item?.id}/`)
      .subscribe(
        async (data: any) => {
          if (data) {
            this.allTemplatesList = [];
            this.apiService.showSuccess(data.message);
            this.page = 1;
            this.getAllTemplates();
          }
        },
        (error) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

  public async editContent(item: any) {
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true,
      });
      modalRef.componentInstance.status.subscribe((resp) => {
        if (resp === 'ok') {
          this.selectedTemplate = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedTemplateDetails(this.selectedTemplate);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
  public getSelectedTemplateDetails(id: any) {
    this.apiService
      .getData(`${environment.live_url}/${environment.templates}/${id}/`)
      .subscribe(
        (respData: any) => {
          this.templateForm.patchValue({
            template_name: respData?.template_name,
          });
          this.templateForm.patchValue({ password: respData?.password });
          this.templateForm.patchValue({ when_to_use: respData?.when_to_use });
          this.templateForm.get('template_file')?.setValidators(null);
          this.templateForm.get('template_file')?.setErrors(null);
          fullUrlToFile(
            respData?.template_file,
            this.getFileName(respData?.template_file)
          )
            .then((file) => {
              this.file = file;
              this.selectedFile = this.file;
            })
            .catch((error) => {
              console.error('Url Conversion Error:', error);
              this.apiService.showError(
                'Unable to convert URL to a policy file.'
              );
            });
        },
        (error: any) => {
          this.apiService.showError(error?.error?.detail);
        }
      );
  }

  public scrollToField() {
    if (this.formInputField) {
      this.formInputField?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
  public filterSearch(event) {
    const value = event?.target?.value || '';
    if (value && value.length >= 2) {
      this.page = 1
    }
    this.searchSubject.next(value);
    // const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    // if (input && input.length >= 2) {
    //   this.term = input;
    //   this.page = 1;
    //   const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
    //   this.getAllTemplates(query);
    // }
    // if (!input) {
    //   const query = `?page=${this.page}&page_size=${this.tableSize}`;
    //   this.getAllTemplates(query);
    // }
  }
 
  // drag drop function 
  isDragActive = false;

  // onDragOver(event: DragEvent) {
  //   event.preventDefault();
  //   this.isDragActive = true;
  // }

  // onDragLeave(event: DragEvent) {
  //   this.isDragActive = false;
  // }

  // onTemplateFileDropped(event) {
  //   // event.preventDefault();
  //   // this.isDragActive = false;
  //   const files = event.dataTransfer?.files;
  //   const input = event.target as HTMLInputElement;
  //   console.log(input,files)
  //   this.commonfileupload(input)
  //   // if (!files || files.length === 0) return;

  //   // const file = files[0];

  //   // // VALID FILE TYPES
  //   // const allowedTypes = [
  //   //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  //   //   'application/vnd.ms-excel', // .xls
  //   //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  //   //   'application/msword' // .doc
  //   // ];

  //   // if (!allowedTypes.includes(file.type)) {
  //   //   this.apiService.showError("Invalid file type. Only Excel or Word files are allowed.");
  //   //   return;
  //   // }

  //   // this.handleDroppedTemplateFile(file);
  // }

  // handleDroppedTemplateFile(file: File) {
  //   this.file = file;
  //   this.selectedFile = file;
  //   this.templateForm.value.template_file = `C:\\fakepath\\${file.name}`;
  //   console.log(`C:\\fakepath\\ + ${file.name}`)
  // }


  // public onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   console.log(input.value)
  //   if (input.files && input.files?.length > 0) {
  //     const selectedFile = input.files[0];
  //     if (
  //       selectedFile.type ===
  //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // Excel
  //       selectedFile.type === 'application/vnd.ms-excel' || // Excel (older format)
  //       selectedFile.type ===
  //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // Word
  //       selectedFile.type === 'application/msword' // Word (older format)
  //     ) {
  //       this.file = selectedFile;
  //       this.selectedFile = this.file;
  //       setTimeout(() => {
  //         input.value = '';
  //       }, 100);
  //     } else {
  //       this.apiService.showError(
  //         'Invalid file type. Only Excel files are allowed.'
  //       );
  //       this.selectedFile = null;
  //     }
  //   }
  // }

  private applyFile(file: File) {
  this.file = file;
  this.selectedFile = file;

  // Update ONLY Reactive Form, NOT the <input>
  this.templateForm.get('template_file')?.setValue(file.name);
  this.templateForm.get('template_file')?.markAsDirty();
  this.templateForm.get('template_file')?.updateValueAndValidity();

  // Reset file input
  this.fileInput.nativeElement.value = '';
}

// ===== Manual file selection =====
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  if (!this.isValidFileType(file)) {
    this.apiService.showError("Invalid file type.");
    return;
  }

  this.applyFile(file);
}

// ===== Drag & Drop handlers =====
onDragOver(event: DragEvent) {
  event.preventDefault();
  this.isDragActive = true;
}

onDragLeave(event: DragEvent) {
  this.isDragActive = false;
}

onFileDropped(event: DragEvent) {
  event.preventDefault();
  this.isDragActive = false;

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];

  if (!this.isValidFileType(file)) {
    this.apiService.showError("Invalid file type.");
    return;
  }

  this.applyFile(file);
}

// ===== File validation =====
private isValidFileType(file: File): boolean {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  return allowed.includes(file.type);
}











  commonfileupload(data){
    const selectedFile = data?.files[0];
      if (
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // Excel
        selectedFile.type === 'application/vnd.ms-excel' || // Excel (older format)
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // Word
        selectedFile.type === 'application/msword' // Word (older format)
      ) {
        this.file = selectedFile;
        this.selectedFile = this.file;
        setTimeout(() => {
          data.value = '';
        }, 100);
      } else {
        this.apiService.showError(
          'Invalid file type. Only Excel files are allowed.'
        );
        this.selectedFile = null;
      }
  }

  public triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  public fileFormatValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    const allowedFormats = ['.xlsx', '.xls', '.doc', '.docx'];
    const maxSize = 10 * 1024 * 1024;
    const file = control.value;
    if (file) {
      const fileExtension = /[.]/.exec(file)
        ? file.split('.').pop()?.toLowerCase()
        : '';
      const fileSize = file.size;
      if (allowedFormats.includes(fileExtension)) {
        return of({ accept: false });
      }

      if (fileSize > maxSize) {
        return of({ maxSize: true });
      }
    }

    return of(null);
  }

  public getFileName(url: any) {
    return url.split('/').pop();
  }

  public downloadFile(url: any) {
    const link = document.createElement('a');
    link.href = url.template_file;
    link.download = this.getFileName(url.template_file);
    link.target = '_blank'; // Opens the download in a new tab (optional)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.templateForm?.getRawValue();
    const isFormChanged: boolean =
      JSON.stringify(currentFormValue) !==
      JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(
      isFormChanged,
      this.templateForm
    );
  }
}
