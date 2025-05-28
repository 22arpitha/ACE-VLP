import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { Observable } from 'rxjs';
import { SubModuleService } from '../../../service/sub-module.service';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent implements CanComponentDeactivate, OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('formInputField') formInputField: ElementRef;
  isEditItem: boolean = false;
  endClientForm: FormGroup;
  selectedJobStatus: any;
  allEndClients: any = [];
  allGroupList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    client_name: false,
    group_name:false,

  };
  filters: { group_name: string[]} = {
    group_name: [],
  }
  allGroupsNames:IdNamePair[] = [];
  arrow: boolean = false;
  term: any='';
  client_id:any;
  searchGroupText:any;
  initialFormValue:any;
  filteredList = [];
    filterQuery: string;
    endclientList:any=[];
    accessPermissions = [];
  user_role_name:any;
  user_id:any;
  constructor(private fb: FormBuilder,
     private modalService: NgbModal,
    private router:Router,private activeRoute:ActivatedRoute,
    private common_service: CommonServiceService,
    private apiService: ApiserviceService,
    private formErrorScrollService:FormErrorScrollUtilityService,
    private accessControlService:SubModuleService,
    private cdr: ChangeDetectorRef
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = sessionStorage.getItem('user_role_name');
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id')}
      this.common_service.clientGroupCreationstatus$.subscribe((resp)=>{
        if(resp){
          this.getGroupList();
        }
      });
  }

  async ngOnInit(): Promise<void> {
    this.initializeForm();
    this.getModuleAccess();
    this.getAllEndClients(`?page=1&page_size=5&client=${this.client_id}`);
    this.getGroupList();
  }
  shouldDisableGroupName:boolean
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res:any)=>{
        console.log(res);
        let temp = res.find((item: any) => item.name === 'End Clients');
          // console.log('temp',temp)
          this.accessPermissions = temp?.operations;
          this.shouldDisableGroupName = this.accessPermissions[0]?.['create'];
          this.cdr.detectChanges();
          // if(this.client_id){
          //   this.shouldDisableGroupName = this.accessPermissions[0]?.['update'];
          //   this.cdr.detectChanges();
          // } else{
          //   this.shouldDisableGroupName = this.accessPermissions[0]?.['create'];
          // }
          // this.accessPermissions = res[0].operations;
        // console.log('this.shouldDisableGroupName',this.shouldDisableGroupName)
      }
    )
  }

  public initializeForm() {
    this.endClientForm = this.fb.group({
      client_name: ['', [Validators.required,Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/), Validators.maxLength(50)]],
      group: [null],
      client:this.client_id
    });
    this.initialFormValue=this.endClientForm?.getRawValue();
  }
  public get f() {
    return this.endClientForm.controls;
  }

  public validateKeyPress(event: KeyboardEvent) {
    // Get the key code of the pressed key
    const keyCode = event.which || event.keyCode;

    // Allow only digits (0-9), backspace, and arrow keys
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
      event.preventDefault(); // Prevent the default action (i.e., entering the character)
    }
  }

  public getAllEndClients(pramas: any) {
    this.allEndClients = [];
    this.apiService.getData(`${environment.live_url}/${environment.end_clients}/${pramas}`).subscribe((respData: any) => {
      this.allEndClients = respData.results;
      this.filteredList = respData.results;
      const noOfPages: number = respData.total_pages
      this.count = noOfPages * this.tableSize;
      this.page = respData.current_page;

    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }

  // Search Group
  public filteredGroupList() {
    if (!this.searchGroupText) {
      return this.allGroupList;
    }
    return this.allGroupList.filter((group:any) =>
      group?.group_name?.toLowerCase()?.includes(this.searchGroupText?.toLowerCase())
    );
  }

public clearSearch(){
  this.searchGroupText='';
}

getUniqueValues(
  extractor: (item: any) => { id: any; name: string }
): { id: any; name: string }[] {
  const seen = new Map();

  this.endclientList.forEach(endClient => {
    const value = extractor(endClient);
    if (value && value.id && !seen.has(value.id)) {
      seen.set(value.id, value.name);
    }
  });

  return Array.from(seen, ([id, name]) => ({ id, name }));
}


  public onTableDataChange(event: any) {
    this.page = event;
    this.filterData();
  }
  public saveEndClientDetails() {
    if (this.endClientForm.invalid) {
      this.endClientForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.apiService.updateData(`${environment.live_url}/${environment.end_clients}/${this.selectedJobStatus}/`, this.endClientForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.common_service.setEndClientCreationState(true);
            this.filterData();;
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.end_clients}/`, this.endClientForm.value).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            this.common_service.setEndClientCreationState(true);
            this.filterData();
          }

        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public resetFormState() {
    this.formGroupDirective.resetForm();
    this.endClientForm.patchValue({"client":this.client_id});
    this.isEditItem = false;
    this.getModuleAccess();
    this.term='';
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
      this.filterData();
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

    this.apiService.delete(`${environment.live_url}/${environment.end_clients}/${item?.id}/`).subscribe(async (data: any) => {
      if (data) {
        this.allEndClients = []
        this.apiService.showWarning(data['message']);
        this.common_service.setEndClientCreationState(true);
        let query = this.getFilterBaseUrl();
        if (this.term) {
          query += `&search=${this.term}`
        }
        this.filterData();
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
          this.selectedJobStatus = item?.id;
          this.isEditItem = true;
          modalRef.dismiss();
          this.shouldDisableGroupName = this.accessPermissions[0]?.['update']
          this.scrollToField();
          this.getSelectedEndClient(this.selectedJobStatus);
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
  public getSelectedEndClient(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.end_clients}/${id}/`).subscribe((respData: any) => {
      this.endClientForm.patchValue({ 'client_name': respData?.client_name });
      this.endClientForm.patchValue({ 'group': respData?.group });
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  }
  public filterSearch(event) {
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    this.term = event.target.value?.trim();
      if (this.term && this.term.length >= 2) {
        this.page = 1;
        this.filterData();
      }
  }
  public getGroupList() {
    this.allGroupList = [];
    this.apiService.getData(`${environment.live_url}/${environment.clients_group}/?client=${this.client_id}`).subscribe((respData: any) => {
      this.allGroupList = respData;
      this.endclientList = respData;
      this.allGroupsNames = this.getUniqueValues(endClient => ({ id: endClient.id, name: endClient.group_name }));

    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);

    })
  }

  public getGroupName(id: any) {
    const itemGroup = this.allGroupList.find((s: any) => s?.id === id);

    return itemGroup?.group_name
  }
  viewJobsOfEndClient(data){
    this.router.navigate([`/client/end-client-jobs/${data?.client_name}/${this.client_id}/${data.id}`])
  }

  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}&client=${this.client_id}&search=${this.term}`;
  }
  canDeactivate(): Observable<boolean> {
      const currentFormValue = this.endClientForm?.getRawValue();
      const isFormChanged:boolean =  JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged,this.endClientForm);
    }

    filterData() {
      this.filterQuery = this.getFilterBaseUrl()
      if (this.filters.group_name.length) {
        this.filterQuery += `&group-ids=[${this.filters.group_name.join(',')}]`;
      }
      this.apiService.getData(`${environment.live_url}/${environment.end_clients}/${this.filterQuery}`).subscribe((res: any) => {
        this.allEndClients = res?.results;
        this.filteredList = res?.results;
        this.count = res?.['total_no_of_record'];
        this.page = res?.['current_page'];  
      });
    }
  
    onFilterChange(event: any, filterType: string) {
      const selectedOptions = event;
      this.filters[filterType] = selectedOptions;
      this.filterData();
    }
}

