import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
export class JobStatusComponent implements CanComponentDeactivate, OnInit,OnDestroy {
  BreadCrumbsTitle: any = 'Job Status';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
  isEditItem: boolean = false;
  jobStatusForm: FormGroup;
  selectedJobStatus: any;
  allJobStatusList: any = [];
  allStatusGroupList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    status_name: false,
    status_group_name:false,
    percentage_of_completion:false,

  };
  arrow: boolean = false;
  term: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  searchStatusGroupText:any;
  initialFormValue:any;
  filterQuery: string;
  filters: {status_group_name: string[]} = {
    status_group_name: []
  };
  filteredList: any;
  allJobStatusName: { id: any; name: string; }[];
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
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
    this.getAllJobStatus('?page=1&page_size=5');
    this.getStatusGroupList();
    this.jobStatusForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.jobStatusForm?.getRawValue();
      const isInvalid = this.jobStatusForm?.touched && this.jobStatusForm?.invalid;
     const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
     let unSavedChanges = isFormChanged || isInvalid;
     this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
    this.getFilterList();
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
    this.jobStatusForm = this.fb.group({
      status_name: ['', [Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.required, Validators.maxLength(20)]],
      percentage_of_completion: [null, [Validators.required,Validators.pattern(/^(100|[1-9]?\d)$/), Validators.maxLength(3), Validators.max(100), Validators.min(0), Validators.minLength(1)]],
      status_group: [null, Validators.required],
    });
    this.initialFormValue = this.jobStatusForm?.getRawValue();
  }
  public get f() {
    return this.jobStatusForm.controls;
  }

  filteredStatusGroupList() {
    if (!this.searchStatusGroupText) {
      return this.allStatusGroupList;
    }
    return this.allStatusGroupList.filter((status:any) =>
      status?.group_name?.toLowerCase()?.includes(this.searchStatusGroupText?.toLowerCase())
    );
  }

  clearSearch(){
    this.searchStatusGroupText ='';
  }

  public validateKeyPress(event: KeyboardEvent) {
    // Get the key code of the pressed key
    const keyCode = event.which || event.keyCode;

    // Allow only digits (0-9), backspace, and arrow keys
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
      event.preventDefault(); // Prevent the default action (i.e., entering the character)
    }
  }

  public getAllJobStatus(pramas: any) {
    this.allJobStatusList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/${pramas}`).subscribe((respData: any) => {
      this.allJobStatusList = respData.results;
      const noOfPages: number = respData.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData.current_page;
    }, (error: any) => {
      this.apiService.showError(error.detail);

    })
  }

  public onTableDataChange(event: any) {
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
    if (this.term) {
      query += `&search=${this.term}`
    }
    // this.getAllJobStatus(query);
    this.filterData()
  }
  public saveJobTypeDetails() {
    if (this.jobStatusForm.invalid) {
      this.jobStatusForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_job_status}/${this.selectedJobStatus}/`, this.jobStatusForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllJobStatus('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_job_status}/`, this.jobStatusForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllJobStatus('?page=1&page_size=5');
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
    this.term ='';
    this.initialFormValue = this.jobStatusForm?.getRawValue();
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
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      // this.getAllJobStatus(query);
      this.filterData()
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

  public deleteContent(item) {

    this.apiService.delete(`${environment.live_url}/${environment.settings_job_status}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allJobStatusList = []
        this.apiService.showWarning('Job Status deleted successfully!')
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        // this.getAllJobStatus(query)
        this.filterData()
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
          this.selectedJobStatus = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedJobstatus(this.selectedJobStatus);
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
  public getSelectedJobstatus(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/${id}/`).subscribe((respData: any) => {
      this.jobStatusForm.patchValue({ 'status_name': respData?.status_name });
      this.jobStatusForm.patchValue({ 'percentage_of_completion': respData?.percentage_of_completion });
      this.jobStatusForm.patchValue({ 'status_group': respData?.status_group });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      const query = `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}`;
      this.filterData()
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.filterData()
    }
  }
  public getStatusGroupList() {
    this.allStatusGroupList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/`).subscribe((respData: any) => {
      this.allStatusGroupList = respData;
    }, (error: any) => {
      this.apiService.showError(error.detail);

    });
  }

  public getStatusGroupName(id: any) {
    const itemStatusGroup = this.allStatusGroupList.find((s: any) => s?.id === id);

    return itemStatusGroup?.group_name
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.jobStatusForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.jobStatusForm);
  }
  getFilterBaseUrl(): string {
    const base = `?page=${this.page}&page_size=${this.tableSize}`;
    const searchParam = this.term?.trim().length >= 2 ? `&search=${this.term.trim()}` : '';

    return `${base}${searchParam}`;
  }
  filterData() {
    this.filterQuery = this.getFilterBaseUrl()
    if (this.filters.status_group_name.length) {
      this.filterQuery += `&status-group-ids=[${this.filters.status_group_name.join(',')}]`;
    }

    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/${this.filterQuery}`).subscribe((res: any) => {
      this.allJobStatusList = res?.results;
      this.filteredList = res?.results;
      const noOfPages: number = res?.['total_pages']
      this.count = noOfPages * this.tableSize;
      this.count = res?.['total_no_of_record']
      this.page = res?.['current_page'];
    });
  }
  getFilterList(){
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (res: any) => {
        this.filteredList = res;
        this.allJobStatusName = this.getUniqueValues(job => ({ id: job.id, name: job.status_group_name }));
    })
    }
  getUniqueValues(
    extractor: (item: any) => { id: any; name: string }
  ): { id: any; name: string }[] {
    const seen = new Map();
    this.filteredList?.forEach(job => {
      const value = extractor(job);
      if (value && value.id && !seen.has(value.id)) {
        seen.set(value.id, value.name);
      }
    });

    return Array.from(seen, ([id, name]) => ({ id, name }));
  }
}

