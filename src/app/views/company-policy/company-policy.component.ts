import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CanComponentDeactivate } from '../../auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from '../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../service/apiservice.service';
import { CommonServiceService } from '../../service/common-service.service';
import { SubModuleService } from '../../../app/service/sub-module.service';
import { GenericDeleteComponent } from '../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../generic-components/generic-edit/generic-edit.component';
import {PdfViewComponent} from '../pdf-view/pdf-view.component'
import { environment } from '../../../environments/environment';
import {fullUrlToFile} from '../../shared/fileUtils.utils';

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
   tableSize = 50;
  tableSizes = [50,75,100];
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
        this.getAllCompanyPolicy('?page=1&page_size=50');
      }
    },(error:any)=>{
      this.apiService.showError(error?.error?.detail);
    });
  }

  public initializeForm() {
    this.companyPolicyForm = this.fb.group({
      policy_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/)]],
      policy_file: ['', Validators.required, this.fileFormatValidator],
      password: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(20)]],
      when_to_use: ['', [ Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(100)]],
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
      console.log(this.companyPolicyForm.value)
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
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
     let query = `?page=${this.page}&page_size=${this.tableSize}&sort-by=${this.sortValue}&sort-type=${this.directionValue}`;
    if (this.term) {
      query += `&search=${this.term}`
    }
    this.getAllCompanyPolicy(query);
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
        .catch(error => {
            console.error('Url Conversion Error:',error);
           this.apiService.showError('Unable to convert URL to a policy file.')});
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || '';
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
    const file = event.target.files[0];
    if (file) {
      const allowedExtensions = ['doc', 'docx', 'pdf'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        this.companyPolicyForm.controls['policy_file']?.setErrors({ accept: true });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.companyPolicyForm.controls['policy_file']?.setErrors({ maxSize: true });
        return;
      }
      this.file = file;
      this.selectedFile = file;
      this.companyPolicyForm.controls['policy_file']?.setValue(file);
    }
  }

  public triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  public fileFormatValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const allowedFormats = ['.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024;
    const file = control.value;

    if (file) {
      const fileExtension = (/[.]/.exec(file)) ? file.split('.').pop()?.toLowerCase() : '';
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
    const fileExtension = data?.policy_file?.split('.')?.pop()?.toLowerCase() || 'unknown';
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

  // drag drop feature

  isDragOver = false; // for UI feedback

onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragOver = true;
}

onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragOver = false;
}

onFileDropped(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragOver = false;

  const file = event.dataTransfer?.files[0];
  if (file) {
    const allowedExtensions = ['doc', 'docx', 'pdf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      this.companyPolicyForm.controls['policy_file']?.setErrors({ accept: true });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.companyPolicyForm.controls['policy_file']?.setErrors({ maxSize: true });
      return;
    }

    this.file = file;
    this.selectedFile = file;
    const fakePath = `C:\\fakepath\\${file.name}`;
    this.companyPolicyForm.controls['policy_file']?.setValue(fakePath);
    // this.companyPolicyForm.controls['policy_file']?.setValue(file);
  }
}

}

