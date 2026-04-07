import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { SubModuleService } from '../../../../app/service/sub-module.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
BreadCrumbsTitle: any = 'Department';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
  isEditItem: boolean = false;
  departmentForm: FormGroup;
  selectedDepartmentStatus: any;
  allDepartments: any = [];
  divisionList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  filterQuery: string;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    department_name: false,
    division__division_name:false,
  };
  arrow: boolean = false;
  term: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;

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
    this.departmentForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.departmentForm?.getRawValue();
      const isInvalid = this.departmentForm?.touched && this.departmentForm?.invalid;
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
        this.getAllDepartmentList();
        this.getAllDivisionList();
      }
    },(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }
  public initializeForm() {
    this.departmentForm = this.fb.group({
      department_name: ['', [Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.required, Validators.maxLength(50)]],
      division: [null, Validators.required],
    });
    this.initialFormValue = this.departmentForm?.getRawValue();
  }
  public get f() {
    return this.departmentForm.controls;
  }
  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }
  public getAllDepartmentList() {
    this.filterQuery = this.getFilterBaseUrl();
    if(this.term){
      this.filterQuery += `&search=${this.term}`
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.allDepartments = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_department}/${this.filterQuery}`).subscribe((respData: any) => {
      this.allDepartments = respData.results;
      const noOfPages: number = respData.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }

  getDivisionName(division: any): string {
    return division?.map((d:any) => d.division_name).join(', ');
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getAllDepartmentList();
  }
  public saveJobTypeDetails() {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_department}/${this.selectedDepartmentStatus}/`, this.departmentForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData?.message);
            this.page = 1;
            this.resetFormState();
            this.getAllDepartmentList();
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_department}/`, this.departmentForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData?.message);
            this.resetFormState();
            this.page = 1;
            this.getAllDepartmentList();
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
    this.initialFormValue = this.departmentForm?.getRawValue();
  }

  public sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getAllDepartmentList();
  }

  public getContinuousIndex(index: number): number {

    return (this.page - 1) * this.tableSize + index + 1;
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.getAllDepartmentList();
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_department}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allDepartments = []
        this.apiService.showSuccess(data?.message)
        this.page = 1;
        this.getAllDepartmentList()
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
          this.selectedDepartmentStatus = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedDepartment(this.selectedDepartmentStatus);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  public scrollToField() {
  const rect = this.formInputField?.nativeElement?.getBoundingClientRect();
  if (rect && rect.top < 0) {
    this.formInputField.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
 
  public getSelectedDepartment(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_department}/${id}/`).subscribe((respData: any) => {
      this.departmentForm.patchValue({ 'department_name': respData?.department_name });
      this.departmentForm.patchValue({division: respData?.division_details?.map((d: any) => d.id)});
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      this.getAllDepartmentList();
    } if (!input) {
      this.page = 1;
      this.getAllDepartmentList();
    }
  }
  public getAllDivisionList() {
    this.divisionList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_division}/`).subscribe((respData: any) => {
      this.divisionList = respData;
    }, (error: any) => {
      this.apiService.showError(error.detail);
    })
  }

  public getRoleName(id: any) {
    const itemStatusGroup = this.divisionList.find((s: any) => s?.id === id);

    return itemStatusGroup?.designation_name;
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.departmentForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.departmentForm);
  }

}

