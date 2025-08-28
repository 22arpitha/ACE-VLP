import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-job-type',
  templateUrl: './job-type.component.html',
  styleUrls: ['./job-type.component.scss']
})
export class JobTypeComponent implements CanComponentDeactivate, OnInit,OnDestroy {
 @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
 @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Job Type';
  isEditItem: boolean = false;
  jobTypeForm: FormGroup;
  selectedJobtype: any;
  allJobTypesList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    job_type_name: false,
    job_price:false,
    stand_around_time:false,
  };
  arrow: boolean = false;
  term: any;
  filterQuery: string;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private accessControlService:SubModuleService,
    private common_service: CommonServiceService, private apiService: ApiserviceService,
    private formUtilityService:FormErrorScrollUtilityService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.jobTypeForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.jobTypeForm?.getRawValue();
      const isInvalid = this.jobTypeForm?.touched && this.jobTypeForm?.invalid;
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
        this.getAllJobTypes();
      }
    },(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }

  public initializeForm() {
    this.jobTypeForm = this.fb.group({
      job_type_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      job_price: [null, [Validators.required,Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/), Validators.maxLength(10), Validators.min(0), Validators.minLength(1)]],
      stand_around_time: ['', [Validators.required, Validators.pattern(/^\d{1,3}$/), Validators.maxLength(3), Validators.min(0)]],
    });
    this.initialFormValue = this.jobTypeForm?.getRawValue();
  }

  public get f() {
    
    return this.jobTypeForm.controls;
  }

  public validateKeyPress(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
      event.preventDefault(); // Prevent the default action (i.e., entering the character)
    }
  }

   getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }

  public getAllJobTypes() {
    this.filterQuery = this.getFilterBaseUrl();
    if(this.term){
      this.filterQuery += `&search=${this.term}`
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.allJobTypesList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/${this.filterQuery}`).subscribe((respData: any) => {
      this.allJobTypesList = respData.results;
      const noOfPages: number = respData.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData.current_page;
    },(error: any) => {
    this.apiService.showError(error?.error?.detail);
    })
  }

  public onTableDataChange(event: any) {
    this.page = event;
    this.getAllJobTypes();
  }
  public saveJobTypeDetails() {
    if (this.jobTypeForm.invalid) {
      this.jobTypeForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_job_type}/${this.selectedJobtype}/`, this.jobTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.page =1;
            this.getAllJobTypes();
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_job_type}/`, this.jobTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.page =1;
            this.getAllJobTypes();
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.formUtilityService.resetHasUnsavedValue();
    this.isEditItem = false;
    this.term='';
    this.initialFormValue = this.jobTypeForm?.getRawValue();
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getAllJobTypes();
  }

  public getContinuousIndex(index: number): number {

    return (this.page - 1) * this.tableSize + index + 1;
  }

  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.getAllJobTypes();
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_job_type}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allJobTypesList = []
        this.apiService.showSuccess(data.message);
        this.getAllJobTypes();
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }

  async editContent(item: any) {
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });
      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          this.selectedJobtype = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedJobType(this.selectedJobtype);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  public scrollToField(){
    if (this.formInputField) {
      this.formInputField?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  public getSelectedJobType(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/${id}/`).subscribe((respData: any) => {
      this.jobTypeForm.patchValue({ 'job_type_name': respData?.job_type_name });
      this.jobTypeForm.patchValue({ 'job_price': respData?.job_price });
      this.jobTypeForm.patchValue({ 'stand_around_time': respData?.stand_around_time });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.getAllJobTypes();
    }
    else if (!this.term) {
      this.page = 1;
      this.getAllJobTypes();
    }
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.jobTypeForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.jobTypeForm);
  }
}

