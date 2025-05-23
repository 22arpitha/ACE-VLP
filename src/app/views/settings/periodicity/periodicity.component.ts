import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { CanComponentDeactivate } from 'src/app/auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-periodicity',
  templateUrl: './periodicity.component.html',
  styleUrls: ['./periodicity.component.scss']
})
export class PeriodicityComponent implements CanComponentDeactivate, OnInit,OnDestroy {

   @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
    BreadCrumbsTitle: any = 'Periodicity';
    isEditItem: boolean = false;
    periodicityForm: FormGroup;
    selectedPeriodicity: any;
    allPeriodicityList: any = [];
    page = 1;
    count = 0;
    tableSize = 5;
    tableSizes = [5, 10, 25, 50, 100];
    currentIndex: any;
    sortValue: string = '';
    directionValue: string = '';
    arrowState: { [key: string]: boolean } = {
      periodicty_name: false,
    };
    arrow: boolean = false;
    term: any;
    initialFormValue:any;
    constructor(private fb: FormBuilder, private modalService: NgbModal,
      private common_service: CommonServiceService, private apiService: ApiserviceService,
      private formUtilityService:FormErrorScrollUtilityService) {
      this.common_service.setTitle(this.BreadCrumbsTitle)
    }

    ngOnInit(): void {
      this.initializeForm();
      this.getAllPeriodicity('?page=1&page_size=5');
      this.periodicityForm?.valueChanges?.subscribe(() => {
        const currentFormValue = this.periodicityForm?.getRawValue();
        const isInvalid = this.periodicityForm?.touched && this.periodicityForm?.invalid;
       const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
       let unSavedChanges = isFormChanged || isInvalid;
       this.formUtilityService.setUnsavedChanges(unSavedChanges);
      });
    }
    ngOnDestroy(): void {
  this.formUtilityService.resetHasUnsavedValue();
    }
    public initializeForm() {
      this.periodicityForm = this.fb.group({
        periodicty_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), , Validators.maxLength(20)]],
      });
       this.initialFormValue = this.periodicityForm?.getRawValue();
    }
    public get f() {
      return this.periodicityForm?.controls;
    }

    public getAllPeriodicity(pramas: any) {
      this.allPeriodicityList = [];
      this.apiService.getData(`${environment.live_url}/${environment.settings_periodicty}/${pramas}`).subscribe((respData: any) => {
        this.allPeriodicityList = respData?.results;
        const noOfPages: number = respData?.total_pages
        this.count = noOfPages * this.tableSize;
        this.page = respData?.current_page;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);

      })
    }
    public savePeriodicityDetails() {
      if (this.periodicityForm.invalid) {
        this.periodicityForm.markAllAsTouched();
        this.formUtilityService.setUnsavedChanges(true);
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.settings_periodicty}/${this.selectedPeriodicity}/`, this.periodicityForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllPeriodicity('?page=1&page_size=5');
            }
          }, (error: any) => {
            this.apiService.showError(error?.error?.detail);
          });
        } else {
          this.apiService.postData(`${environment.live_url}/${environment.settings_periodicty}/`, this.periodicityForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllPeriodicity('?page=1&page_size=5');
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
      this.initialFormValue = this.periodicityForm?.getRawValue();
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
      this.getAllPeriodicity(query);
    }
    public onTableSizeChange(event: any): void {
      if (event) {

        this.tableSize = Number(event.value);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }
        this.getAllPeriodicity(query);
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
      this.apiService.delete(`${environment.live_url}/${environment.settings_periodicty}/${item?.id}/`).subscribe(async (data: any) => {
        if (data) {
          this.allPeriodicityList = []
          this.apiService.showSuccess(data.message);
          let query = `?page=${1}&page_size=${this.tableSize}`
          if (this.term) {
            query += `&search=${this.term}`
          }

          this.getAllPeriodicity(query);
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
            this.selectedPeriodicity = item?.id;
            this.isEditItem = true;
            modalRef.dismiss();
            this.scrollToField();
            this.getSelectedPeriodicity(this.selectedPeriodicity);
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

    public getSelectedPeriodicity(id: any) {
      this.apiService.getData(`${environment.live_url}/${environment.settings_periodicty}/${id}/`).subscribe((respData: any) => {
        this.periodicityForm.patchValue({ 'periodicty_name': respData?.periodicty_name });
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
        this.getAllPeriodicity(query);
      } if (!input) {
        const query = `?page=${this.page}&page_size=${this.tableSize}`;
        this.getAllPeriodicity(query);
      }
    }

    canDeactivate(): Observable<boolean> {
      const currentFormValue = this.periodicityForm?.getRawValue();
      const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.periodicityForm);
    }
}
