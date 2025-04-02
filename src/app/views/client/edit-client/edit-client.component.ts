import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.scss']
})
export class EditClientComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
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
    end_client_name: false,
    group_name:false,

  };
  arrow: boolean = false;
  term: any;
  client_id:any;
  searchGroupText:any;
  constructor(private fb: FormBuilder,
     private modalService: NgbModal,
    private router:Router,private activeRoute:ActivatedRoute,
    private common_service: CommonServiceService, private apiService: ApiserviceService
  ) {
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id')}
      this.common_service.clientGroupCreationstatus$.subscribe((resp)=>{
        if(resp){
          this.getGroupList();
        }
      });   
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllEndClients(`?page=1&page_size=5&client=${this.client_id}`);
    this.getGroupList();

  }

  public initializeForm() {
    this.endClientForm = this.fb.group({
      client_name: ['', [Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.required, Validators.maxLength(20)]],
      group: [null],
      client:this.client_id
    });
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


  public onTableDataChange(event: any) {
    this.page = event;
    let query = this.getFilterBaseUrl();
    if (this.term) {
      query += `&search=${this.term}`
    }
    this.getAllEndClients(query);
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
            this.getAllEndClients(`?page=1&page_size=5&client=${this.client_id}`);
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
            this.getAllEndClients(`?page=1&page_size=5&client=${this.client_id}`);
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
      let query = this.getFilterBaseUrl();
      if (this.term) {
        query += `&search=${this.term}`
      }
      this.getAllEndClients(query);
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

        this.getAllEndClients(query)
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
          this.getSelectedEndClient(this.selectedJobStatus);
        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
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
    if (input && input.length >= 2) {
      this.term = input;
      this.page = 1;
      let query = this.getFilterBaseUrl();
      query += `&search=${this.term}`
      this.getAllEndClients(query);
    } if (!input) {
      let query = this.getFilterBaseUrl();
      this.getAllEndClients(query);
    }
  }
  public getGroupList() {
    this.allGroupList = [];
    this.apiService.getData(`${environment.live_url}/${environment.clients_group}/?client=${this.client_id}`).subscribe((respData: any) => {
      this.allGroupList = respData;
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
    return `?page=${this.page}&page_size=${this.tableSize}&client=${this.client_id}`;
  }
  
}

