import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { log } from 'console';
@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss']
})
export class SourceComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  BreadCrumbsTitle: any = 'Source';
  isEditItem: boolean = false;
  sourceForm: FormGroup;
  selectedSource: any;
  allSourceList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    source_name: false,
  };
  arrow: boolean = false;
  term: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,
    private common_service: CommonServiceService, private apiService: ApiserviceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllSource('?page=1&page_size=5');
  }

  public initializeForm() {
    this.sourceForm = this.fb.group({
      source_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(20)]],
    });
  }

  public get f() {

    return this.sourceForm?.controls;
  }

  public getAllSource(pramas: any) {
    this.allSourceList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_source}/${pramas}`).subscribe((respData: any) => {
      this.allSourceList = respData?.results;
      const noOfPages: number = respData?.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData?.current_page;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }
  public saveSourceDetails() {
    {
      if (this.sourceForm.invalid) {
        this.apiService.showError('Invalid Form!');
        this.sourceForm.markAllAsTouched();
      } else {
        if (this.isEditItem) {
          this.apiService.updateData(`${environment.live_url}/${environment.settings_source}/${this.selectedSource}/`, this.sourceForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllSource('?page=1&page_size=5');
            }
          }, (error: any) => {
            this.apiService.showError(error?.error?.detail);
          });
        } else {
          this.apiService.postData(`${environment.live_url}/${environment.settings_source}/`, this.sourceForm.value).subscribe((respData: any) => {
            if (respData) {
              this.apiService.showSuccess(respData['message']);
              this.resetFormState();
              this.getAllSource('?page=1&page_size=5');
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
    this.getAllSource(query);
  }
  public onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `?page=${1}&page_size=${this.tableSize}`
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllSource(query);
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
    this.apiService.delete(`${environment.live_url}/${environment.settings_source}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allSourceList = []
        this.apiService.showSuccess(data.message);
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllSource(query);
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
          this.selectedSource = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.getSelectedSourceDetails(this.selectedSource);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
  public getSelectedSourceDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.settings_source}/${id}/`).subscribe((respData: any) => {
      this.sourceForm.patchValue({ 'source_name': respData?.source_name });
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
      this.getAllSource(query);
    } if (!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getAllSource(query);
    }
  }

}
