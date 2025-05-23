import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { Observable } from 'rxjs';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements CanComponentDeactivate, OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('formInputField') formInputField: ElementRef;
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
  client_id:any;
  initialFormValue:any;
  accessPermissions = [];
  user_role_name:any;
  user_id:any;
  constructor(
    private common_service: CommonServiceService,
    private activeRoute:ActivatedRoute,
    private fb: FormBuilder, private api: ApiserviceService,
    private modalService: NgbModal, private router:Router,
    private formErrorScrollService:FormErrorScrollUtilityService,
    private accessControlService:SubModuleService,
    private cdr: ChangeDetectorRef
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name');
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id')}
      this.common_service.clientEndClientCreationstatus$.subscribe((resp)=>{
        if(resp){
          this.getAllGroupList(`?page=${1}&page_size=${5}&client=${this.client_id}`);
        }
      });
   }

  ngOnInit(): void {
    this.getModuleAccess()
    this.intialForm();
    this.getAllGroupList(`?page=${1}&page_size=${5}&client=${this.client_id}`);
  }

  shouldDisableGroupName:boolean
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res:any)=>{
        console.log(res);
        let temp = res.find((item: any) => item.name === 'Groups');
          console.log('temp',temp)
         if(temp){
          this.accessPermissions = temp?.operations;
         }
          this.shouldDisableGroupName = this.accessPermissions[0]?.['create'];
          this.cdr.detectChanges();
        // this.accessPermissions = res[0].operations;
        // this.shouldDisableGroupName = this.accessPermissions[0]?.['create'];
        // console.log('this.shouldDisableGroupName',this.shouldDisableGroupName)
      }
    )
  }

  intialForm() {
    this.groupForm = this.fb.group({
      group_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      client:this.client_id
    });
    this.initialFormValue=this.groupForm?.getRawValue();
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
    this.api.getData(`${environment.live_url}/${environment.clients_group}/${params}`).subscribe(
      (res: any) => {
        this.allGroups = res.results;
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
      this.getAllGroupList(query);
    }
    else if (!this.term) {
      this.getAllGroupList(this.getFilterBaseUrl());
    }
  }
  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}&client=${this.client_id}`;
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

  saveGroupDetails() {
    if (this.groupForm.invalid) {
      console.log(this.groupForm.value)
      this.groupForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.api.updateData(`${environment.live_url}/${environment.clients_group}/${this.selectedItemId}/`, this.groupForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            this.common_service.setGroupCreationState(true);
            this.getAllGroupList(`?page=${1}&page_size=${5}&client=${this.client_id}`);
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      } else {
        this.api.postData(`${environment.live_url}/${environment.clients_group}/`, this.groupForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.resetFormState();
            this.common_service.setGroupCreationState(true);
            this.getAllGroupList(`?page=${1}&page_size=${5}&client=${this.client_id}`);
          }
        }, (error: any) => {
          this.api.showError(error?.error?.detail);
        });
      }
    }
  }
  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.groupForm.patchValue({"client":this.client_id});
    this.isEditItem = false;
    this.term='';
    this.getModuleAccess();
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
          this.shouldDisableGroupName = this.accessPermissions[0]?.['update']
          this.getSelectedItemData(this.selectedItemId);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  getSelectedItemData(id: any) {
    this.api.getData(`${environment.live_url}/${environment.clients_group}/${id}/`).subscribe((respData: any) => {
      this.groupForm.patchValue({ 'group_name': respData?.group_name });
    }, (error: any) => {
      this.api.showError(error?.error?.detail);
    })
  }

  public scrollToField(){
    if (this.formInputField) {
      this.formInputField?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    this.api.delete(`${environment.live_url}/${environment.clients_group}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allGroups = [];
        this.api.showSuccess(data.message)
        this.common_service.setGroupCreationState(true);
        let query = this.getFilterBaseUrl();
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
    this.getAllGroupList(`?page=${1}&page_size=${5}&client=${this.client_id}`);
  }

  viewClientsOfGrpup(data){
    this.router.navigate([`/client/client-groups/${data?.group_name}/${this.client_id}/${data.id}`])
  }

  canDeactivate(): Observable<boolean> {
      const currentFormValue = this.groupForm?.getRawValue();
      const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged,this.groupForm);
    }
}
