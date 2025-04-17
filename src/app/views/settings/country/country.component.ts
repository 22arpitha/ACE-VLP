import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from 'src/app/service/sub-module.service';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { CanComponentDeactivate } from 'src/app/auth-guard/can-deactivate.guard';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements CanComponentDeactivate, OnInit,OnDestroy {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
  BreadCrumbsTitle: any = 'Country';
  countryForm: FormGroup;
  isEditItem: boolean = false;
  selectedItemId: any
  allCountry = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    country_name: false,
    created_datetime: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  constructor(
    private common_service: CommonServiceService, private fb: FormBuilder, private api: ApiserviceService,
    private modalService: NgbModal,private accessControlService:SubModuleService,
    private formUtilityService:FormErrorScrollUtilityService
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.intialForm();
    this.getAllCountryList(`?page=${1}&page_size=${5}`);
    this.countryForm?.valueChanges?.subscribe(() => {
      const currentFormValue = this.countryForm?.getRawValue();
      const isInvalid = this.countryForm.touched && this.countryForm.invalid;
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

  intialForm() {
    this.countryForm = this.fb.group({
      country_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(20)]],
    });
    this.initialFormValue = this.countryForm?.getRawValue();
  }
  get f() {
    return this.countryForm.controls;
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  getAllCountryList(params: any) {
    this.api.getData(`${environment.live_url}/${environment.settings_country}/${params}`).subscribe(
      (res: any) => {
        console.log(res.results)
        this.allCountry = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      },(error: any) => {
        this.api.showError(error?.error?.detail);
      });
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      this.getAllCountryList(query);
    }
    else if (!this.term) {
      this.getAllCountryList(this.getFilterBaseUrl());
    }
  }
  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getAllCountryList(query);
      } else {
        // console.log(this.term,'no')
        this.getAllCountryList(this.getFilterBaseUrl());
      }
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getAllCountryList(query);
    } else {
      // console.log(this.term,'no')
      this.getAllCountryList(this.getFilterBaseUrl());
    }
  }

  saveCountryDetails() {
    if (this.countryForm.invalid) {
      console.log(this.countryForm.value)
      this.countryForm.markAllAsTouched();
      this.formUtilityService.setUnsavedChanges(true);
    } else {
      if (this.isEditItem) {
        this.api.updateData(`${environment.live_url}/${environment.settings_country}/${this.selectedItemId}/`, this.countryForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllCountryList('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      } else {
        this.api.postData(`${environment.live_url}/${environment.settings_country}/`, this.countryForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllCountryList('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      }
    }
  }
  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.formUtilityService.resetHasUnsavedValue();
    this.isEditItem = false;
    this.term='';
    this.initialFormValue = this.countryForm?.getRawValue();
  }
  async edit(item: any) {

    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          this.selectedItemId = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.scrollToField();
          this.getSelectedItemData(this.selectedItemId)
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
  getSelectedItemData(id: any) {
    this.api.getData(`${environment.live_url}/${environment.settings_country}/${id}/`).subscribe((respData: any) => {
      this.countryForm.patchValue({ 'country_name': respData?.country_name });
    }, (error: any) => {
      this.api.showError(error?.error?.detail);
    })
  }

  delete(id: any) {
    if (id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.deleteContent(id);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(id: any) {
    this.api.delete(`${environment.live_url}/${environment.settings_country}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allCountry = []
        this.api.showSuccess(data.message)
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllCountryList(query)
      }

    }, (error => {
      this.api.showError(error?.error?.detail)
    }))
  }

  reset() {
    this.resetFormState();
    this.getAllCountryList(`?page=${1}&page_size=${5}`);
  }
  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.countryForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.countryForm);
  }
}
