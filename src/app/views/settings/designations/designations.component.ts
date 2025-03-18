import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-designations',
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.scss']
})
export class DesignationsComponent implements OnInit {

  BreadCrumbsTitle: any = 'Designation';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  isEditItem: boolean = false;
  designationForm: FormGroup;
  selectedDesignationStatus: any;
  allDesignationStatusList: any = [];
  RolesList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    sub_designation_name: false,
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
    this.getAllDesignation('?page=1&page_size=5');
    this.getAllRolesList();
  }

  public initializeForm() {
    this.designationForm = this.fb.group({
      sub_designation_name: ['', [Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/), Validators.required, Validators.maxLength(20)]],
      designation: [null, Validators.required],
    });
  }
  public get f() {
    return this.designationForm.controls;
  }

  public getAllDesignation(pramas: any) {
    this.allDesignationStatusList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_designation}/${pramas}`).subscribe((respData: any) => {
      this.allDesignationStatusList = respData.results;
      console.log( this.allDesignationStatusList)
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
    this.getAllDesignation(query);
  }
  public saveJobTypeDetails() {
    if (this.designationForm.invalid) {
      // this.apiService.showError('Invalid!');
      this.designationForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.settings_designation}/${this.selectedDesignationStatus}/`, this.designationForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllDesignation('?page=1&page_size=5');
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.settings_designation}/`, this.designationForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllDesignation('?page=1&page_size=5');
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
    this.arrowState[column] = direction === 'asc';
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
      this.getAllDesignation(query);
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

    this.apiService.delete(`${environment.live_url}/${environment.settings_designation}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allDesignationStatusList = []
        this.apiService.showWarning('Job Status deleted successfully!')
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllDesignation(query)
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
          this.selectedDesignationStatus = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.getSelectedDesignation(this.selectedDesignationStatus);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
  public getSelectedDesignation(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_designation}/${id}/`).subscribe((respData: any) => {
      this.designationForm.patchValue({ 'sub_designation_name': respData?.sub_designation_name });
      this.designationForm.patchValue({ 'designation': respData?.designation });
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
      this.getAllDesignation(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllDesignation(query);
    }
  }
  public getAllRolesList() {
    this.RolesList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_roles}/`).subscribe((respData: any) => {
      this.RolesList = respData;
    }, (error: any) => {
      this.apiService.showError(error.detail);

    })
  }

  public getRoleName(id: any) {
    const itemStatusGroup = this.RolesList.find((s: any) => s?.id === id);

    return itemStatusGroup?.designation_name
  }
}

