import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from 'src/app/generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wfh-type',
  templateUrl: './wfh-type.component.html',
  styleUrls: ['./wfh-type.component.scss'],
  standalone:false
})
export class WfhTypeComponent implements OnInit {

 @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField!: ElementRef;

  BreadCrumbsTitle: any = 'Work From Home Type';
  isEditItem: boolean = false;
  leaveTypeForm!: FormGroup;
  selectedleavetype: any;
  allleavetypeList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    leave_type_name: false,
  };
  arrow: boolean = false;
  term: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
    private common_service: CommonServiceService, private apiService: ApiserviceService,
    private formUtilityService:FormErrorScrollUtilityService, private router: Router) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.getAllLeaveTypes('?page=1&page_size=5');
    this.leaveTypeForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.leaveTypeForm?.getRawValue();
      const isInvalid = this.leaveTypeForm?.touched && this.leaveTypeForm?.invalid;
     const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
     let unSavedChanges = isFormChanged || isInvalid;
     this.formUtilityService.setUnsavedChanges(unSavedChanges);
    });
  }
  ngOnDestroy(): void {
this.formUtilityService.resetHasUnsavedValue();
  }
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access:any) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  public initializeForm() {
    this.leaveTypeForm = this.fb.group({
      category_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), , Validators.maxLength(20)]],
    });
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
  }
  public get f() {
    return this.leaveTypeForm?.controls;
  }

  public getAllLeaveTypes(pramas: any) {
    this.allleavetypeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.wfh_type_conf}/${pramas}`).subscribe((respData: any) => {
      this.allleavetypeList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }
  public saveleaveTypeDetails() {
    if (this.leaveTypeForm.invalid) {
      this.leaveTypeForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.wfh_type_conf}/${this.selectedleavetype}/`, this.leaveTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllLeaveTypes(`?page=1&page_size=${this.tableSize}`);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.wfh_type_conf}/`, this.leaveTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllLeaveTypes(`?page=1&page_size=${this.tableSize}`);
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
    this.initialFormValue = this.leaveTypeForm?.getRawValue();
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
    this.getAllLeaveTypes(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllLeaveTypes(query);
    }
  }
  public confirmDelete(content: any) {
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe((resp:any) => {
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
    this.apiService.delete(`${environment.live_url}/${environment.wfh_type_conf}/?conf_id=${item?.id}`).subscribe(async (data: any) => {
      if (data) {
        this.allleavetypeList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllLeaveTypes(query);
      }

    }, ((error:any) => {
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

      modalRef.componentInstance.status.subscribe((resp:any) => {
        if (resp === 'ok') {
          this.selectedleavetype = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedleaveType(this.selectedleavetype);
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
  public getSelectedleaveType(id: any) {
    this.router.navigate([`/settings/edit-wfh-configuration/${id}`])
    this.apiService.getData(`${environment.live_url}/${environment.wfh_type_conf}/${id}/`).subscribe((respData: any) => {
      this.leaveTypeForm.patchValue({ 'category_name': respData?.category_name });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  public filterSearch(event:any) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getAllLeaveTypes(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllLeaveTypes(query);
    }
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.leaveTypeForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.leaveTypeForm);
  }



   formatCategoryName(name: string): string {
  if (!name) return '';

  return name
    .replace(/_/g, ' ')              // underscores → spaces
    .toLowerCase()                   // all lowercase
    .replace(/\b\w/g, c => c.toUpperCase()); // capitalize each word
}
}
