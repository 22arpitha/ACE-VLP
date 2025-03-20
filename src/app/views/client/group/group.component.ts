import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  groupForm: FormGroup;
  isEditItem: boolean = false;
  selectedItemId: any
  allGroups = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    group_name: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';

  constructor(
    private common_service: CommonServiceService, private fb: FormBuilder, private api: ApiserviceService,
    private modalService: NgbModal, private router:Router
  ) { }

  ngOnInit(): void {
    this.intialForm();
    this.getAllGroupList(`?page=${1}&page_size=${5}`);
  }

  intialForm() {
    this.groupForm = this.fb.group({
      group_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(20)]],
    })
  }
  get f() {
    return this.groupForm.controls;
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

  getAllGroupList(params: any) {
    this.api.getData(`${environment.live_url}/${environment.settings_country}/${params}`).subscribe(
      (res: any) => {
        console.log(res.results)
        this.allGroups = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      this.getAllGroupList(query);
    }
    else if (!this.term) {
      this.getAllGroupList(this.getFilterBaseUrl());
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
        this.getAllGroupList(query);
      } else {
        // console.log(this.term,'no')
        this.getAllGroupList(this.getFilterBaseUrl());
      }
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getAllGroupList(query);
    } else {
      // console.log(this.term,'no')
      this.getAllGroupList(this.getFilterBaseUrl());
    }
  }

  saveCountryDetails() {
    if (this.groupForm.invalid) {
      console.log(this.groupForm.value)
      this.groupForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        // this.api.updateData(`${environment.live_url}/${environment.settings_country}/${this.selectedItemId}/`, this.groupForm.value).subscribe((respData: any) => {
        //   if (respData) {
        //     this.api.showSuccess(respData['message']);
        //     this.resetFormState();
        //     this.getAllGroupList('?page=1&page_size=5');
        //   }
        // }, (error: any) => {
        //   this.api.showError(error?.error?.detail);
        // });
      } else {
        // this.api.postData(`${environment.live_url}/${environment.settings_country}/`, this.groupForm.value).subscribe((respData: any) => {
        //   if (respData) {
        //     this.api.showSuccess(respData['message']);
        //     this.resetFormState();
        //     this.getAllGroupList('?page=1&page_size=5');
        //   }
        // }, (error: any) => {
        //   this.api.showError(error?.error?.detail);
        // });
      }
    }
  }
  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.isEditItem = false;
  }
  async edit(item: any) {
    this.selectedItemId = item?.id;
    this.isEditItem = true;
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          modalRef.dismiss();
          this.getSelectedItemData(this.selectedItemId)
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  getSelectedItemData(id: any) {
    // this.api.getData(`${environment.live_url}/${environment.settings_country}/${id}/`).subscribe((respData: any) => {
    //   this.groupForm.patchValue({ 'group_name': respData?.group_name });
    // }, (error: any) => {
    //   this.api.showError(error?.error?.detail);
    // })
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
          // this.deleteContent(id);
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
        this.allGroups = []
        this.api.showSuccess(data.message)
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }

        this.getAllGroupList(query)
      }

    }, (error => {
      this.api.showError(error?.error?.detail)
    }))
  }

  reset() {
    this.resetFormState();
    this.getAllGroupList(`?page=${1}&page_size=${5}`);
  }

  viewClientsOfGrpup(data){
    this.router.navigate([`/client/client-groups/${'Alpa'}/${12}`])
  }
}
