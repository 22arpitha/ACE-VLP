import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';

@Component({
  selector: 'app-leave-type',
  templateUrl: './leave-type.component.html',
  styleUrls: ['./leave-type.component.scss']
})
export class LeaveTypeComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  BreadCrumbsTitle: any = 'Leave Type';
  isEditItem: boolean = false;
  leaveTypeForm: FormGroup;
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
  constructor(private fb: FormBuilder, private modalService: NgbModal,
    private common_service: CommonServiceService, private apiService: ApiserviceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllLeaveTypes('?page=1&page_size=5');
  }

  public initializeForm() {
    this.leaveTypeForm = this.fb.group({
      leave_type_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), , Validators.maxLength(20)]],
    });
  }
  public get f() {
    return this.leaveTypeForm?.controls;
  }

  public getAllLeaveTypes(pramas: any) {
    this.allleavetypeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/${pramas}`).subscribe((respData: any) => {
      this.allleavetypeList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }
  public saveleaveTypeDetails() {
    {
      if (this.leaveTypeForm.invalid) {
        this.apiService.showError('Invalid Form!');
        this.leaveTypeForm.markAllAsTouched();
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.settings_leave_type}/${this.selectedleavetype}/`, this.leaveTypeForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllLeaveTypes('?page=1&page_size=5');
            }
          }, (error: any) => {
            this.apiService.showError(error?.error?.detail);
          });
        } else {
          this.apiService.postData(`${environment.live_url}/${environment.settings_leave_type}/`, this.leaveTypeForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllLeaveTypes('?page=1&page_size=5');
            }

          }, (error: any) => {
            this.apiService.showError(error?.error?.detail);
          });
        }
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
    this.arrowState[column] = direction === 'asc';
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_leave_type}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allleavetypeList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllLeaveTypes(query);
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
          this.selectedleavetype = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.getSelectedJobType(this.selectedleavetype);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  public getSelectedJobType(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/${id}/`).subscribe((respData: any) => {
      this.leaveTypeForm.patchValue({ 'leave_type_name': respData?.leave_type_name });
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
      this.getAllLeaveTypes(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllLeaveTypes(query);
    }
  }
}
