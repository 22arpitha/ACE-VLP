import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-status-group',
  templateUrl: './status-group.component.html',
  styleUrls: ['./status-group.component.scss']
})

export class StatusGroupComponent implements CanComponentDeactivate, OnInit,OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Status Group';
  isEditItem: boolean = false;
  statusGroupForm: FormGroup;
  selectedStatusGroup: any;
  allStatusGroupList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    group_name: false,
  };
  arrow: boolean = false;
  term: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
  private common_service: CommonServiceService, private apiService: ApiserviceService,
  private formUtilityService:FormErrorScrollUtilityService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.statusGroupForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.statusGroupForm?.getRawValue();
      const isInvalid = this.statusGroupForm?.touched && this.statusGroupForm?.invalid;
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
        this.getAllStatusGroup('?page=1&page_size=50');
      }
    },(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }

  public initializeForm() {
    this.statusGroupForm = this.fb.group({
      group_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), , Validators.maxLength(50)]],
    });
    this.initialFormValue=this.statusGroupForm?.getRawValue();
  }

  public get f() {
    
    return this.statusGroupForm?.controls;
  }

  public getAllStatusGroup(pramas: any) {
    this.allStatusGroupList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/${pramas}`).subscribe((respData: any) => {
      this.allStatusGroupList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public saveStatusGroupDetails() {
    if (this.statusGroupForm.invalid) {
      this.statusGroupForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_status_group}/${this.selectedStatusGroup}/`, this.statusGroupForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllStatusGroup(`?page=1&page_size=${this.tableSize}`);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_status_group}/`, this.statusGroupForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllStatusGroup(`?page=1&page_size=${this.tableSize}`);
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
    this.initialFormValue = this.statusGroupForm?.getRawValue();
  }

  sort(direction: string, column: string) {
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
    this.getAllStatusGroup(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllStatusGroup(query);
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_status_group}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allStatusGroupList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }
        this.getAllStatusGroup(query);
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
          this.selectedStatusGroup = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedStatusGroupDetails(this.selectedStatusGroup);
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
  public getSelectedStatusGroupDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/${id}/`).subscribe((respData: any) => {
      this.statusGroupForm.patchValue({ 'group_name': respData?.group_name });
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
      this.getAllStatusGroup(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllStatusGroup(query);
    }
  }

  canDeactivate(): Observable<boolean> {
  const currentFormValue = this.statusGroupForm?.getRawValue();
  const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
  
  return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.statusGroupForm);
}
}
