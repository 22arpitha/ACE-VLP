import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { SubModuleService } from '../../../service/sub-module.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.scss']
})
export class DivisionComponent implements OnInit {

  BreadCrumbsTitle: any = 'Divisions';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef | undefined;
  isEditItem: boolean = false;
  divisionForm!: FormGroup ;
  filterQuery: string = '';
  selectedDivision: any;
  allServiceList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    division_name: false,
  };
  arrow: boolean = false;
  term: any;
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  
  constructor(private fb: FormBuilder, private modalService: NgbModal,private accessControlService:SubModuleService,
    private common_service: CommonServiceService,
    private apiService: ApiserviceService,
    private formUtilityService:FormErrorScrollUtilityService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.initializeForm();
    this.divisionForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.divisionForm?.getRawValue();
      const isInvalid = this.divisionForm?.touched && this.divisionForm?.invalid;
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
      this.getAllDivisions();
      }
    },(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }
  public initializeForm() {
    this.divisionForm = this.fb.group({
      division_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
    });
    this.initialFormValue=this.divisionForm?.getRawValue();
  }

  public get f() {
    
    return this.divisionForm?.controls;
  }
  
  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }

  public getAllDivisions() {
    this.filterQuery = this.getFilterBaseUrl();
    if(this.term){
      this.filterQuery += `&search=${this.term}`
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.allServiceList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_division}/${this.filterQuery}`).subscribe((respData: any) => {
      this.allServiceList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public saveDivisionDetails() {
    if (this.divisionForm.invalid) {
      this.divisionForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_division}/${this.selectedDivision}/`, this.divisionForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.page = 1
            this.getAllDivisions();
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_division}/`, this.divisionForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
           this.page = 1
            this.getAllDivisions();
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
    this.initialFormValue = this.divisionForm?.getRawValue();
  }

  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getAllDivisions();
  }

  public getContinuousIndex(index: number): number {

    return (this.page - 1) * this.tableSize + index + 1;
  }

  public onTableDataChange(event: any) {
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
    
    this.getAllDivisions();
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.page =1
      this.getAllDivisions();
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_division}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allServiceList = []
        this.apiService.showSuccess(data.message);
        this.page =1
        this.getAllDivisions();
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
      modalRef.componentInstance.status.subscribe((resp: any) => {
        if (resp === 'ok') {
          this.selectedDivision = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.getSelectedDivision(this.selectedDivision);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  public getSelectedDivision(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_division}/${id}/`).subscribe((respData: any) => {
      this.divisionForm.patchValue({ 'division_name': respData?.division_name });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  public filterSearch(event: any) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.getAllDivisions();
    }
    else if (!this.term) {
      this.getAllDivisions();
    }
  }

canDeactivate(): Observable<boolean> {
    const currentFormValue = this.divisionForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.divisionForm);
  }
}
