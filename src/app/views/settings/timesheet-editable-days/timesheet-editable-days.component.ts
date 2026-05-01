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
  selector: 'app-timesheet-editable-days',
  templateUrl: './timesheet-editable-days.component.html',
  styleUrls: ['./timesheet-editable-days.component.scss']
})
export class TimesheetEditableDaysComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Timesheet Editable Days';
  isEditItem: boolean = false;
  timesheetEditableDaysForm!: FormGroup;
  selectedTimesheetEditableDay: any;
  allTimesheetEditableDaysList: any = [];
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  filterQuery: string;
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    number_of_days: false,
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
    this.timesheetEditableDaysForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.timesheetEditableDaysForm?.getRawValue();
      const isInvalid = this.timesheetEditableDaysForm?.touched && this.timesheetEditableDaysForm?.invalid;
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
        this.getAllTimesheetEditableDays();
      }
    },(error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }

  public initializeForm() {
    this.timesheetEditableDaysForm = this.fb.group({
      number_of_days: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]],
    });
    this.initialFormValue=this.timesheetEditableDaysForm?.getRawValue();
  }

  public get f() {
    
    return this.timesheetEditableDaysForm?.controls;
  }

  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }
  public getAllTimesheetEditableDays() {
     this.filterQuery = this.getFilterBaseUrl();
    if(this.term){
      this.filterQuery += `&search=${this.term}`
    }
    if(this.directionValue && this.sortValue){
      this.filterQuery += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    }
    this.allTimesheetEditableDaysList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_config_timesheetValue}/${this.filterQuery}`).subscribe((respData: any) => {
      this.allTimesheetEditableDaysList = respData?.results || [];
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public saveTimesheetEditableDaysDetails() {
    if (this.timesheetEditableDaysForm.invalid) {
      this.timesheetEditableDaysForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_config_timesheetValue}/${this.selectedTimesheetEditableDay}/`, this.timesheetEditableDaysForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.page = 1;
            this.getAllTimesheetEditableDays();
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_config_timesheetValue}/`, this.timesheetEditableDaysForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.page = 1;
            this.getAllTimesheetEditableDays();
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
    this.initialFormValue = this.timesheetEditableDaysForm?.getRawValue();
  }

  sort(direction: string, column: string) {
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    this.getAllTimesheetEditableDays();
  }

  public getContinuousIndex(index: number): number {

    return (this.page - 1) * this.tableSize + index + 1;
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.getAllTimesheetEditableDays();
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.tableSize = Number(event.value);
      this.getAllTimesheetEditableDays();
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_config_timesheetValue}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allTimesheetEditableDaysList = []
        this.apiService.showSuccess(data.message);
        this.page = 1
        this.getAllTimesheetEditableDays();
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
          this.selectedTimesheetEditableDay = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedTimesheetEditableDaysDetails(this.selectedTimesheetEditableDay);
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
      this.formInputField?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  public getSelectedTimesheetEditableDaysDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_config_timesheetValue}/${id}/`).subscribe((respData: any) => {
      this.timesheetEditableDaysForm.patchValue({ 'number_of_days': respData?.number_of_days });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
     if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.getAllTimesheetEditableDays();
    }
    else if (!this.term) {
      this.page = 1;
      this.getAllTimesheetEditableDays();
    }
  }

  canDeactivate(): Observable<boolean> {
  const currentFormValue = this.timesheetEditableDaysForm?.getRawValue();
  const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
  
  return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.timesheetEditableDaysForm);
}
}

