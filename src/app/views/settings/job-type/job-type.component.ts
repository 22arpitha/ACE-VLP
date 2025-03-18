import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-job-type',
  templateUrl: './job-type.component.html',
  styleUrls: ['./job-type.component.scss']
})
export class JobTypeComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  BreadCrumbsTitle: any = 'Job Type';
  isEditItem: boolean = false;
  jobTypeForm: FormGroup;
  selectedJobtype: any;
  allJobTypesList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    job_type_name: false,
    job_price:false,
  };
  arrow: boolean = false;
  term: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,
    private common_service: CommonServiceService, private apiService: ApiserviceService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllJobTypes('?page=1&page_size=5');
  }

  public initializeForm() {
    this.jobTypeForm = this.fb.group({
      job_type_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(20)]],
      job_price: [null, [Validators.required,Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/), Validators.maxLength(10), Validators.min(0), Validators.minLength(1)]],
    });
  }
  public get f() {
    return this.jobTypeForm.controls;
  }

  public validateKeyPress(event: KeyboardEvent) {
    // Get the key code of the pressed key
    const keyCode = event.which || event.keyCode;

    // Allow only digits (0-9), backspace, and arrow keys
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
      event.preventDefault(); // Prevent the default action (i.e., entering the character)
    }
  }
  public getAllJobTypes(pramas: any) {
    this.allJobTypesList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/${pramas}`).subscribe((respData: any) => {
      this.allJobTypesList = respData.results;
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
    this.getAllJobTypes(query);
  }
  public saveJobTypeDetails() {
    if (this.jobTypeForm.invalid) {
      this.jobTypeForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_job_type}/${this.selectedJobtype}/`, this.jobTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllJobTypes('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_job_type}/`, this.jobTypeForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllJobTypes('?page=1&page_size=5');
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
      this.getAllJobTypes(query);
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
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllJobTypes(query)
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
          this.getSelectedJobType(this.selectedJobtype);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }

  }

  public getSelectedJobType(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/${id}/`).subscribe((respData: any) => {
      this.jobTypeForm.patchValue({ 'job_type_name': respData?.job_type_name });
      this.jobTypeForm.patchValue({ 'job_price': respData?.job_price });
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
      this.getAllJobTypes(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllJobTypes(query);
    }
  }
}

