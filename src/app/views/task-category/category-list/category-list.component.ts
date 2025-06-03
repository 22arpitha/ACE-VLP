import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { CommonServiceService } from '../../../service/common-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  BreadCrumbsTitle:any='Project Templates';
  categoryList=[];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  slno:any;
  name:any;
  date:any;
  action:any;
  status:any;
  selectedId: any;
  enabled: boolean;
  user_id: any;
  userRole:string
  orgId: string;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    tpc_name: false,
    tpc_c_date: false,
  };
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
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole =  sessionStorage.getItem('user_role_name');
    this.getCategory(`?organization_id=${this.orgId}&page=${1}&page_size=${5}`);
    this.getModuleAccess();
  }
  getFilterBaseUrl(): string {
    return `?organization_id=${this.orgId}&page=${this.page}&page_size=${this.tableSize}`;
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }
 
  getCategory(params:any){
    this.api.getData(`${environment.live_url}/${environment.project_template}/${params}`).subscribe((data:any)=>{     
      if(data){
        this.categoryList = data.results;
        const noOfPages: number = data?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = data?.['total_no_of_record']
        this.page = data?.['current_page'];
      }
      
    },((error)=>{
      this.api.showError(error.error.message)
    }))
  }
  delete(id:any){
    this.api.deleteProjCategory(id).subscribe((data:any)=>{
      // if(data){
        this.categoryList = []
        this.ngOnInit()
        this.api.showWarning('Project template deleted successfully')
      // }
     
    },((error)=>{
      this.api.showError(error.error.message)
    }))
    
  }
  
  deleteCard(id){
    this.delete(id)
    this.enabled = true;
  }
  editCard(id){
    this.router.navigate([`/task/update/${id}/${this.page}/${this.tableSize}`])
  }
  filterSearch(event:any){
    this.term = event.target.value?.trim();
    if (this.term &&this.term.length >= 2) {
        this.page = 1;
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        this.getCategory(query);
      }
       else if(!this.term) {
        this.getCategory(this.getFilterBaseUrl());
    }
  }
  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getCategory(query);
    } else {
      // console.log(this.term,'no')
      this.getCategory(this.getFilterBaseUrl());
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
        this.getCategory(query);
      } else {
        // console.log(this.term,'no')
        this.getCategory(this.getFilterBaseUrl());
      }
    }
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

sort(direction: string, column: string) {
  Object.keys(this.arrowState).forEach(key => {
    this.arrowState[key] = false;
  });
  this.arrowState[column] = direction === 'asc';
  this.directionValue = direction;
  this.sortValue = column;
}

  getContinuousIndex(index: number):number {
    return (this.page-1)*this.tableSize+ index + 1;
  }
}

