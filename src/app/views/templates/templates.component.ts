import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../generic-edit/generic-edit.component';
import { ApiserviceService } from '../../service/apiservice.service';
import { CommonServiceService } from '../../service/common-service.service';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { SubModuleService } from '../../../app/service/sub-module.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  BreadCrumbsTitle: any = 'Templates';
  isEditItem: boolean = false;
  templateForm: FormGroup;
  selectedTemplate: any;
  allTemplatesList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
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
formData:any;
accessPermissions = []
user_id: any;
userRole: any;

    constructor(private fb:FormBuilder,private modalService:NgbModal,private accessControlService:SubModuleService,
        private common_service: CommonServiceService,private apiService:ApiserviceService) { 
      this.common_service.setTitle(this.BreadCrumbsTitle)
    }
  
    
  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.getAllTemplates('?page=1&page_size=5');
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
    this.templateForm = this.fb.group({
      template_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/)]],
      template_file: ['',Validators.required,this.fileFormatValidator],
      password: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/),Validators.maxLength(20)]],
      when_to_use: ['', [Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/),Validators.maxLength(20)]],
    
    });
  }

  public get f() {
    return this.templateForm?.controls;
  }

  public getAllTemplates(pramas: any) {
    this.allTemplatesList = [];
    this.apiService.getData(`${environment.live_url}/${environment.templates}/${pramas}`).subscribe((respData: any) => {
      this.allTemplatesList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.error?.message);

    })
  }
  public saveTemplateDetails() {
    console.log(this.templateForm.controls)
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        this.apiService.updateData(`${environment.live_url}/${environment.templates}/${this.selectedTemplate}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllTemplates('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.message);
        });
      } else {
        this.formData = this.createFromData();
        this.apiService.postData(`${environment.live_url}/${environment.templates}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllTemplates('?page=1&page_size=5');
          }

        }, (error: any) => {
          this.apiService.showError(error?.error?.message);
        });
      }
    }
  }

public createFromData(){
  this.formData = new FormData();
  if (this.file) {
    this.formData.set("template_file", this.file || '');
    this.formData.set("template_name", this.templateForm?.get('template_name')?.value || '');
    this.formData.set("password", this.templateForm?.get('password')?.value || '');
    this.formData.set("when_to_use", this.templateForm?.get('when_to_use')?.value || '');
  }
  return this.formData;
}

  public resetFormState() {
    this.templateForm.controls['template_file'].setValidators([Validators.required]);
    this.formGroupDirective.resetForm();
    this.selectedFile =null;
    this.file =null;
    this.isEditItem = false;
    this.term='';
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
    fileInput.value = "";
   }
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
    this.getAllTemplates(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllTemplates(query);
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
    this.apiService.delete(`${environment.live_url}/${environment.templates}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allTemplatesList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllTemplates(query);
      }

    }, (error => {
      this.apiService.showError(error?.error?.message)
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
    this.apiService.getData(`${environment.live_url}/${environment.templates}/${id}/`).subscribe((respData: any) => {
      this.templateForm.patchValue({ 'template_name': respData?.template_name });
      // this.templateForm.patchValue({ 'template_file': respData?.template_file });
      this.templateForm.patchValue({ 'password': respData?.password });
      this.templateForm.patchValue({ 'when_to_use': respData?.when_to_use });
      this.templateForm.get('template_file')?.setValidators(null); 
      this.templateForm.get('template_file')?.setErrors(null);

      console.error('Controls:', this.templateForm.controls);
      urlToFile(respData?.template_file, this.getFileName(respData?.template_file))
    .then(file => {
      this.file = file;
      this.selectedFile = this.file;
    }
    )
    .catch(error => console.error('Error:', error));

    }, (error: any) => {
      this.apiService.showError(error?.error?.message);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getAllTemplates(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllTemplates(query);
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
  
      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // Excel
        selectedFile.type === "application/vnd.ms-excel" || // Excel (older format)
        selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // Word
        selectedFile.type === "application/msword" // Word (older format)
      )  {
        this.file = selectedFile;
        this.selectedFile = this.file;
  
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only Excel files are allowed.");
        this.selectedFile = null;
      }
    }
  }

  public triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  public fileFormatValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const allowedFormats = ['.xlsx','.xls','.doc','.docx'];
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
    const file = control.value;

    if (file) {
      console.log('file',file);
      const fileExtension = (/[.]/.exec(file)) ? file.split('.').pop()?.toLowerCase() : '';
      console.log('fileExtension',fileExtension);
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

  public getFileName(url:any){
    return url.split('/').pop(); 
  }
  
  public downloadFile(url:any){
    const link = document.createElement('a');
    link.href = url.template_file;
    link.download = this.getFileName(url.template_file);
    link.target = '_blank'; // Opens the download in a new tab (optional)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

 
  }
  async function urlToFile(url: string, fileName: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || 'application/octet-stream';

    return new File([blob], fileName, { type: mimeType });
}

