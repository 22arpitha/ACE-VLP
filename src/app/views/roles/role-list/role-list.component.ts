import { Component, Inject, OnInit ,ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
// import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';
@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  BreadCrumbsTitle:any='Designation';
  allRoleList=[];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';

  show = false
  selectedId: any;
  enabled: boolean = true;
  closeResult: string;
  sortedRolls: any[];
  moveNext: boolean;
  defaultUrl:any ;
  totalCount: number;
  permission: any = [];
  admin: boolean = false;
  userRole: any;
  accessPermissions = []
  permissions: any =[];
  org_id: string;
  user_id: any;

  
  constructor(private api:ApiserviceService,
    private router:Router,
    private modalService:NgbModal,
    private location:Location,
    private common_service : CommonServiceService,
private accessControlService:SubModuleService
    ) { }
    goBack(event){
      event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
    }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id')
    this.enabled = true
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
    this.getAllDesignations(`?organization_id=${this.org_id}&page=${1}&page_size=${5}`);
    this.getModuleAccess();
    
    // this.getUserControls()
  
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
  getAllDesignations(params:any){
    this.api.getData(`${environment.live_url}/${environment.designation}/${params}`).subscribe(
      (res:any)=>{
        console.log('desinations',res);
        this.allRoleList = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
        // this.count = res.total_no_of_record;
      }
    )
  }
  getFilterBaseUrl(): string {
    return `?organization_id=${this.org_id}&page=${this.page}&page_size=${this.tableSize}`;
  }
  filterSearch(event:any){
    this.term = event.target.value?.trim();
    if (this.term &&this.term.length >= 2) {
        this.page = 1;
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        this.getAllDesignations(query);
      }
       else if(!this.term) {
        this.getAllDesignations(this.getFilterBaseUrl());
    }
  }
 
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  delete(id:any){
    this.api.deleteDesignationList(id).subscribe((data:any)=>{
      if(data){
        this.allRoleList = []
        this.ngOnInit()
        this.api.showWarning(data['message'])
     
      }
    },((error)=>{
      this.api.showError(error.error.error.message)
    }))
  
  }
  cardId(selected):any{
    this.selectedId = selected.id;
    this.enabled = false;

   }
  deleteCard(){
    this.delete(this.selectedId)
    this.enabled = true;
  }
  onTableDataChange(event: any) {
    this.page = event;
    if(this.term){
      let query = this.getFilterBaseUrl()
      query+=`&search=${this.term}`
      // console.log(this.term)
      this.getAllDesignations(query);
    } else{
      // console.log(this.term,'no')
      this.getAllDesignations(this.getFilterBaseUrl());
    }
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if(this.term){
        let query = this.getFilterBaseUrl()
        query+=`&search=${this.term}`
        // console.log(this.term)
        this.getAllDesignations(query);
      } else{
        // console.log(this.term,'no')
        this.getAllDesignations(this.getFilterBaseUrl());
      }
    }
  } 

 
	open(content) {
    if(content){
      const modelRef = this.modalService.open(GenericDeleteComponent, {
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
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    department_name: false,
    created_datetime: false,
  };
  arrow:boolean=false
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
 

