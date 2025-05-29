import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import{SubModuleService} from '../../../service/sub-module.service'
import { CanComponentDeactivate } from 'src/app/auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from 'src/app/service/form-error-scroll-utility-service.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements CanComponentDeactivate, OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Roles';
  rolesForm: FormGroup;
  isEditItem: boolean = false;
  selectedItemId: any
  allRoles = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    designation_name: false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  term: any = '';
  accessPermissions = []
  user_id: any;
  userRole: any;
  initialFormValue:any;
  constructor(
    private common_service: CommonServiceService, private fb: FormBuilder, private api: ApiserviceService,
    private modalService: NgbModal, private router:Router,
    private accessControlService:SubModuleService,
    private formUtilityService:FormErrorScrollUtilityService
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.intialForm();
    this.getModuleAccess();
    this.getAllRolesList(`?page=${1}&page_size=${50}`);
  }

  intialForm() {
    this.rolesForm = this.fb.group({
      designation_name: ['', Validators.required]
    });
    this.initialFormValue = this.rolesForm?.getRawValue();
  }
  get f() {
    return this.rolesForm.controls;
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
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

  getAllRolesList(params: any) {
    this.api.getData(`${environment.live_url}/${environment.settings_roles}/${params}`).subscribe(
      (res: any) => {
        this.allRoles = [];
        console.log(res.results)
        this.allRoles = res.results;
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
      this.getAllRolesList(query);
    }
    else if (!this.term) {
      this.getAllRolesList(this.getFilterBaseUrl());
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
        this.getAllRolesList(query);
      } else {
        // console.log(this.term,'no')
        this.getAllRolesList(this.getFilterBaseUrl());
      }
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getAllRolesList(query);
    } else {
      // console.log(this.term,'no')
      this.getAllRolesList(this.getFilterBaseUrl());
    }
  }

  saveCountryDetails() {
    if (this.rolesForm.invalid) {
      this.rolesForm.markAllAsTouched();
      // this.api.showError('Invalid Form!');
    } else {
      if (this.isEditItem) {
        this.api.updateData(`${environment.live_url}/${environment.settings_roles}/${this.selectedItemId}/`, this.rolesForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            this.getAllRolesList(`?page=1&page_size=${this.tableSize}`);
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      } else {
        this.api.postData(`${environment.live_url}/${environment.settings_roles}/`, this.rolesForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            // this.getAllRolesList('?page=1&page_size=5');
            this.router.navigate([`/settings/roles-access/${respData?.result?.id}`])
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      }
    }
  }
  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.isEditItem = false;
    this.initialFormValue = this.rolesForm?.getRawValue();

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
    this.api.getData(`${environment.live_url}/${environment.settings_roles}/${id}/`).subscribe((respData: any) => {
      this.rolesForm.patchValue({ 'designation_name': respData?.designation_name });
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
    this.api.delete(`${environment.live_url}/${environment.settings_roles}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allRoles = []
        this.api.showSuccess(data.message)
        let query = `?page=${1}&page_size=${this.tableSize}`
        if (this.term) {
          query += `&search=${this.term}`
        }
        this.getAllRolesList(query);
      }

    }, (error => {
      this.api.showError(error?.error?.error)
    }))
  }

  reset() {
    this.resetFormState();
    this.getAllRolesList(`?page=${1}&page_size=${50}`);
  }
  roleAccess(id:any){
    console.log(id)
    this.router.navigate([`/settings/roles-access/${id}`])
  }
  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.rolesForm?.getRawValue();
    const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formUtilityService.isFormDirtyOrInvalidCheck(isFormChanged,this.rolesForm);
  }
}
