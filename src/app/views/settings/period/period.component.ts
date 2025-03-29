import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { GenericEditComponent } from 'src/app/generic-edit/generic-edit.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit {

  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
   @ViewChild('formInputField') formInputField: ElementRef;
 
   BreadCrumbsTitle: any = 'Period';
   isEditItem: boolean = false;
   periodForm: FormGroup;
   selectedperiod: any;
   allPeriodList: any = [];
   page = 1;
   count = 0;
   tableSize = 5;
   tableSizes = [5, 10, 25, 50, 100];
   currentIndex: any;
   sortValue: string = '';
   directionValue: string = '';
   arrowState: { [key: string]: boolean } = {
    period_name: false,
    periodicity:false,
   };
   arrow: boolean = false;
   term: any;
   searchPeriodicityText:any
   allPeriodicityList:any=[];
   constructor(private fb: FormBuilder, private modalService: NgbModal,
     private common_service: CommonServiceService, private apiService: ApiserviceService) {
     this.common_service.setTitle(this.BreadCrumbsTitle)
   }
 
   ngOnInit(): void {
     this.initializeForm();
     this.getAllPeriodicity();
     this.getAllPeriod('?page=1&page_size=5');
   }
 
   public initializeForm() {
     this.periodForm = this.fb.group({
      period_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/), , Validators.maxLength(20)]],
      periodicity: [null, Validators.required], 
    });
   }
   public get f() {
     return this.periodForm?.controls;
   }
 
   public getAllPeriod(pramas: any) {
     this.allPeriodList = [];
     this.apiService.getData(`${environment.live_url}/${environment.settings_period}/${pramas}`).subscribe((respData: any) => {
       this.allPeriodList = respData?.results;
       const noOfPages: number = respData?.total_pages
       this.count = noOfPages * this.tableSize;
       this.page = respData?.current_page;
     }, (error: any) => {
       this.apiService.showError(error?.error?.detail);
 
     })
   }

   public getAllPeriodicity(){
    this.allPeriodicityList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_periodicty}/`).subscribe((respData: any) => {
      this.allPeriodicityList = respData;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
   }
   filteredPeriodicityList() {
    if (!this.searchPeriodicityText) {
      return this.allPeriodicityList;
    }
    return this.allPeriodicityList.filter((pc:any) => 
      pc?.periodicty_name?.toLowerCase()?.includes(this.searchPeriodicityText?.toLowerCase())
    );
  }

  clearSearch(){
    this.searchPeriodicityText ='';
  }
   public saveleaveTypeDetails() {
    if (this.periodForm.invalid) {
      this.periodForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_period}/${this.selectedperiod}/`, this.periodForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllPeriod('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_period}/`, this.periodForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllPeriod('?page=1&page_size=5');
          }

        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
   }
 
   public resetFormState() {
     this.formGroupDirective.resetForm();
     this.isEditItem = false;
     this.term='';
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
     this.getAllPeriod(query);
   }
   public onTableSizeChange(event: any): void {
     if (event) {
 
       this.tableSize = Number(event.value);
       let query = `?page=${1}&page_size=${this.tableSize}`
       if (this.term) {
         query += `&search=${this.term}`
       }
       this.getAllPeriod(query);
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
     this.apiService.delete(`${environment.live_url}/${environment.settings_period}/${item?.id}/`).subscribe(async (data: any) => {
       if (data) {
         this.allPeriodList = []
         this.apiService.showSuccess(data.message);
         let query = `?page=${1}&page_size=${this.tableSize}`
         if (this.term) {
           query += `&search=${this.term}`
         }
 
         this.getAllPeriod(query);
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
           this.selectedperiod = item?.id;
           this.isEditItem = true;
           modalRef.dismiss();
           this.scrollToField();
           this.getSelectedPeriod(this.selectedperiod);
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
 
   public getSelectedPeriod(id: any) {
     this.apiService.getData(`${environment.live_url}/${environment.settings_period}/${id}/`).subscribe((respData: any) => {
       this.periodForm.patchValue({ 'period_name': respData?.period_name });
       this.periodForm.patchValue({ 'periodicity': respData?.periodicity });

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
       this.getAllPeriod(query);
     } if (!input) {
       const query = `?page=${this.page}&page_size=${this.tableSize}`;
       this.getAllPeriod(query);
     }
   }
   public getPeriodicityName(id: any) {
    const itemPeriodicity = this.allPeriodicityList?.find((p: any) => p?.id=== id);
    return itemPeriodicity?.periodicty_name
  }
}
