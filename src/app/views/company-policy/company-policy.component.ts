import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../service/apiservice.service';
import { CommonServiceService } from '../../service/common-service.service';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {PdfViewComponent} from '../pdf-view/pdf-view.component'
import { SubModuleService } from '../../../app/service/sub-module.service';
import {fullUrlToFile} from '../../shared/fileUtils.utils';
import { CanComponentDeactivate } from 'src/app/auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';

@Component({
  selector: 'app-company-policy',
  templateUrl: './company-policy.component.html',
  styleUrls: ['./company-policy.component.scss']
})
export class CompanyPolicyComponent implements CanComponentDeactivate, OnInit,OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('formInputField') formInputField: ElementRef;

  BreadCrumbsTitle: any = 'Company Policy';
  isEditItem: boolean = false;
  companyPolicyForm: FormGroup;
  selectedTemplate: any;
  allCompanyPolicyList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    policy_name: false,
  };
  arrow: boolean = false;
  term: any;
  file: any;
  selectedFile: File | null = null;
  formData: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
    private common_service: CommonServiceService,
    private apiService: ApiserviceService,
    private formUtilityService:FormErrorScrollUtilityService,
    private dialog: MatDialog) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }


  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.getAllCompanyPolicy('?page=1&page_size=5');
    this.companyPolicyForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.companyPolicyForm?.getRawValue();
      const isInvalid = this.companyPolicyForm.touched && this.companyPolicyForm.invalid;
     const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
     let unSavedChanges = isFormChanged || isInvalid;
     this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
  }
  ngOnDestroy(): void {
this.formUtilityService.resetHasUnsavedValue();
  }
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  public initializeForm() {
    this.companyPolicyForm = this.fb.group({
      policy_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z&.,'\-]+( [a-zA-Z&.,'\-]+)*$/)]],
      policy_file: ['', Validators.required, this.fileFormatValidator],
      password: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(20)]],
      when_to_use: ['', [ Validators.pattern(/^[a-zA-Z0-9&.,'\-]+( [a-zA-Z0-9&.,'\-]+)*$/), Validators.maxLength(20)]],
    });
    this.initialFormValue=this.companyPolicyForm?.getRawValue();

  }

  public get f() {
    return this.companyPolicyForm.controls;
  }

  public getAllCompanyPolicy(pramas: any) {
    this.allCompanyPolicyList = [];
    this.apiService.getData(`${environment.live_url}/${environment.company_policy}/${pramas}`).subscribe((respData: any) => {
      this.allCompanyPolicyList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }
  public savePolicyDetails() {
    if (this.companyPolicyForm.invalid) {
      this.companyPolicyForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        this.apiService.updateData(`${environment.live_url}/${environment.company_policy}/${this.selectedTemplate}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllCompanyPolicy(`?page=1&page_size=${this.tableSize}`);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.formData = this.createFromData();
        this.apiService.postData(`${environment.live_url}/${environment.company_policy}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllCompanyPolicy(`?page=1&page_size=${this.tableSize}`);
          }

        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public createFromData() {
    this.formData = new FormData();
    if (this.file) {
      this.formData.set("policy_file", this.file || '');
      this.formData.set("policy_name", this.companyPolicyForm?.get('policy_name')?.value || '');
      this.formData.set("password", this.companyPolicyForm?.get('password')?.value || '');
      this.formData.set("when_to_use", this.companyPolicyForm?.get('when_to_use')?.value || '');
    }
    return this.formData;
  }

  public resetFormState() {
    this.companyPolicyForm.controls['policy_file']?.setValidators([Validators.required]);
    this.formGroupDirective.resetForm();
    this.formUtilityService.resetHasUnsavedValue();
    this.selectedFile = null;
    this.file = null;
    this.isEditItem = false;
    this.term='';
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    this.initialFormValue = this.companyPolicyForm?.getRawValue();
  }

  public sort(direction: string, column: string) {
    // Object.keys(this.arrowState).forEach(key => {
    //   this.arrowState[key] = false;
    // });
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  public getContinuousIndex(index: number): number {

    return (this.page - 1) * this.tableSize + index + 1;
  }
  public onTableDataChange(event: any) {
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
    if (this.term) {
      query += `&search=${this.term}`
    }
    this.getAllCompanyPolicy(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllCompanyPolicy(query);
    }
  }
  public confirmDelete(content: any) {
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.deleteContent(content);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(item: any) {
    this.apiService.delete(`${environment.live_url}/${environment.company_policy}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allCompanyPolicyList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllCompanyPolicy(query);
      }

    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  public async editContent(item: any) {
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
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
    this.apiService.getData(`${environment.live_url}/${environment.company_policy}/${id}/`).subscribe((respData: any) => {
      this.companyPolicyForm.patchValue({ 'policy_name': respData?.policy_name });
      // this.companyPolicyForm.patchValue({ 'policy_file': respData?.policy_file });
      this.companyPolicyForm.patchValue({ 'password': respData?.password });
      this.companyPolicyForm.patchValue({ 'when_to_use': respData?.when_to_use });
      this.companyPolicyForm.get('policy_file')?.setValidators(null);
      this.companyPolicyForm.get('policy_file')?.setErrors(null);

      console.error('Controls:', this.companyPolicyForm.controls);
      fullUrlToFile(respData?.policy_file, this.getFileName(respData?.policy_file))
        .then(file => {
          this.file = file;
          this.selectedFile = this.file;
        }
        )
        .catch(error => console.error('Error:', error));

    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getAllCompanyPolicy(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllCompanyPolicy(query);
    }
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      const allowedExtensions = ['doc', 'docx', 'pdf']; // Allowed extensions
      const fileExtension = file.name.split('.').pop().toLowerCase();

      // Validate file type
      if (!allowedExtensions.includes(fileExtension)) {
        this.companyPolicyForm.controls['policy_file']?.setErrors({ accept: true });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.companyPolicyForm.controls['policy_file']?.setErrors({ maxSize: true });
        return;
      }
      this.file = file;
      this.selectedFile = file; // Store the selected file
      console.log('selectedFile', this.selectedFile)
      this.companyPolicyForm.controls['policy_file']?.setValue(file);
    }
    // const input = event.target as HTMLInputElement;

    // if (input.files && input.files.length > 0) {
    //   const selectedFile = input.files[0];

    //   // Validate file type
    //   if (
    //     selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    //     selectedFile.type === "application/vnd.ms-excel"
    //   ) {
    //     this.file = selectedFile;
    //     this.selectedFile = this.file;

    //     // Reset input value after a slight delay to allow re-selection
    //     setTimeout(() => {
    //       input.value = "";
    //     }, 100); // Small delay to ensure the selection is registered
    //   } else {
    //     this.apiService.showError("Invalid file type. Only Excel files are allowed.");
    //     this.selectedFile = null;
    //   }
    // }
  }

  public triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  public fileFormatValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const allowedFormats = ['.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
    const file = control.value;

    if (file) {
      console.log('file', file);
      const fileExtension = (/[.]/.exec(file)) ? file.split('.').pop()?.toLowerCase() : '';
      console.log('fileExtension', fileExtension);
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

  public getFileName(url: any) {
    if (url) {
      return url.split('/').pop();
    }
  }

  public scrollToField(){
    if (this.formInputField) {
      this.formInputField?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  public downloadFile(url: any) {
    fetch(url.policy_file)
    .then(res => res.blob())
    .then(blob => {
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: this.getFileName(url.policy_file)
        });
        link.click();
        URL.revokeObjectURL(link.href);
    });
  }

  previewFile(data:any){
    console.log(data)
    const fileExtension = data?.policy_file?.split('.')?.pop()?.toLowerCase() || 'unknown';
    console.log(fileExtension)
    this.openFileViewer(data.policy_file,fileExtension)
  }

  openFileViewer(fileUrl: string, fileType: string) {
    this.dialog.open(PdfViewComponent, {
      panelClass: 'custom-details-dialog',
      data: { url: fileUrl, type: fileType }
    });
  }


  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.companyPolicyForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.companyPolicyForm);
  }
}

