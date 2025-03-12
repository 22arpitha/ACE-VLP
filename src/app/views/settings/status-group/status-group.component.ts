import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { GenericEditComponent } from 'src/app/generic-edit/generic-edit.component';

@Component({
  selector: 'app-status-group',
  templateUrl: './status-group.component.html',
  styleUrls: ['./status-group.component.scss']
})
export class StatusGroupComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Source Group';
  isEditItem: boolean = false;
  statusGroupForm: FormGroup;
  selectedStatusGroup: any;
  allStatusGroupList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    group_name: false,
  };
  arrow: boolean = false;
  term: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,
    private common_service: CommonServiceService, private apiService: ApiserviceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)

  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllStatusGroup('?page=1&page_size=5');
  }

  public initializeForm() {
    this.statusGroupForm = this.fb.group({
      group_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/), , Validators.maxLength(20)]],
    });
  }

  public get f() {
    return this.statusGroupForm?.controls;
  }

  public getAllStatusGroup(pramas: any) {
    this.allStatusGroupList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/${pramas}`).subscribe((respData: any) => {
      this.allStatusGroupList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.error?.message);

    })
  }
  public saveStatusGroupDetails() {
    {
      if (!this.statusGroupForm.dirty || !this.statusGroupForm.valid) {
        this.apiService.showError('Invalid!');
        this.statusGroupForm.markAllAsTouched();
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.settings_status_group}/${this.selectedStatusGroup}/`, this.statusGroupForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllStatusGroup('?page=1&page_size=5');
            }
          }, (error: any) => {
            this.apiService.showError(error?.error?.message);
          });
        } else {
          this.apiService.postData(`${environment.live_url}/${environment.settings_status_group}/`, this.statusGroupForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllStatusGroup('?page=1&page_size=5');
            }

          }, (error: any) => {
            this.apiService.showError(error?.error?.message);
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
    this.getAllStatusGroup(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllStatusGroup(query);
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_status_group}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allStatusGroupList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllStatusGroup(query);
      }

    }, (error => {
      this.apiService.showError(error?.error?.message)
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
              this.selectedStatusGroup = item?.id;
              this.isEditItem = true;
              modalRef.dismiss();
              this.getSelectedStatusGroupDetails(this.selectedStatusGroup);
            } else {
              modalRef.dismiss();
            }
          });
        } catch (error) {
          console.error('Error opening modal:', error);
        }
  }
  public getSelectedStatusGroupDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_status_group}/${id}/`).subscribe((respData: any) => {
      this.statusGroupForm.patchValue({ 'group_name': respData?.group_name });
    }, (error: any) => {
      this.apiService.showError(error?.error?.message);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getAllStatusGroup(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllStatusGroup(query);
    }
  }

}
