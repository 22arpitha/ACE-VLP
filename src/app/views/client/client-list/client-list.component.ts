import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { SortPipe } from 'src/app/sort/sort.pipe';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
  providers: [
    SortPipe
]
})
export class ClientListComponent implements OnInit {
  BreadCrumbsTitle:any='Client list';
  allClientList=[];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  slno:any;
  code:any;
  name:any;
  industry:any;
  type:any;
  contact_person:any;
  project:any;
  date:any;
  action:any;
  selectedId: any;
  enabled: boolean = true;
  permissions: any = [];
  user_id: any;
  orgId: any;
  arrowState: { [key: string]: boolean } = {
    c_name: false,
    c_contact_person: false,
    c_c_timestamp: false
  };
  
  sortValue: string = '';
  directionValue: string = '';
  userRole:string
  accessPermissions = []
  constructor(
    private modalService:NgbModal, 
    private api:ApiserviceService,
    private router:Router,
    private location:Location,
    private common_service:CommonServiceService,
     private accessControlService:SubModuleService
    ) { }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.orgId = sessionStorage.getItem('organization_id')
    this.userRole =  sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
    // this.getNewClients(`?organization_id=${this.orgId}&page=${1}&page_size=${5}`);
    this.enabled = true;
    // this.getModuleAccess()
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

    filterSearch(event:any) {
      this.term = event.target.value?.trim();
    if (this.term &&this.term.length >= 2) {
        this.page = 1;
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        this.getNewClients(query);
      }
       else if(!this.term) {
        this.getNewClients(this.getFilterBaseUrl());
    }
  }
    getFilterBaseUrl(): string {
      return `?organization_id=${this.orgId}&page=${this.page}&page_size=${this.tableSize}`;
    }
  

    getNewClients(params:any){
      this.api.getData(`${environment.live_url}/${environment.client}/${params}`).subscribe(
        (res:any)=>{
          this.allClientList = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
        },
        (error) => {
          this.api.showError(error.error.error.message)
        }
      )
    }
  delete(id:any){
    this.api.deleteClient(id).subscribe((data:any)=>{
      this.ngOnInit();
      this.api.showWarning('Client deleted successfully!!')
      // if(data){
      // }
    },error=>{
     this.api.showError(error.error.error.message)
    })
  }
 
  deleteCard(id){
    this.delete(id)
    this.enabled = true;
  }
  editCard(id){
    this.router.navigate([`/client/update/${id}/${this.page}/${this.tableSize}`])
  }
  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getNewClients(query);
    } else {
      // console.log(this.term,'no')
      this.getNewClients(this.getFilterBaseUrl());
    }
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getNewClients(query);
      } else {
        // console.log(this.term,'no')
        this.getNewClients(this.getFilterBaseUrl());
      }
    }
  }

  arrow:boolean=false;
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
  }


  open(content) {
    if(content){
      const modelRef =   this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered:true
      });
     
      modelRef.componentInstance.status.subscribe(resp => {
        if(resp == "ok"){
         this.delete(content);
         modelRef.close();
        }
        else{
          modelRef.close();
        }
    })
	
	}
  
}

getContinuousIndex(index: number):number {
  return (this.page-1)*this.tableSize+ index + 1;
}
}
