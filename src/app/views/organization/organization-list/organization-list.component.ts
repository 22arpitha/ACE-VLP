import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { SortPipe } from 'src/app/sort/sort.pipe';
import { environment } from 'src/environments/environment';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss'],
  providers: [
    SortPipe
]
})
export class OrganizationListComponent implements OnInit {
  BreadCrumbsTitle:any='Organization list';
  term:any='';
  // directionValue:any='desc'
  // sortValue:any='org_name'
  arrowState: { [key: string]: boolean } = {
    organization_name: false,
    email: false,
  };
  
  sortValue: string = '';
  directionValue: string = '';
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  url: any;
  organizationData: any = [];
currentIndex: any;
  user_id: string;
  params:any = {}
  permissions: any = [];
  org_id: any;
  organizationStatus = false
  constructor(private api:ApiserviceService,private modalService:NgbModal,
    private router:Router,private location:Location,
    private common_service:CommonServiceService) { }
    goBack(event)
     {
      event.preventDefault(); // Prevent default back button behavior
      this.location.back();
  
    }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id')
    this.org_id = sessionStorage.getItem('org_id') 
    this.getOrgDetails(`?page=${1}&page_size=${5}`)
  }
  getStatusText(): string {
    const status =  this.organizationData?.organization_status || this.organizationStatus ;
    return status ? 'Active' : 'Inactive';
  }
  toggleStatus(event: MatSlideToggleChange): void {
    // this.item.organization_status = event.checked;
    this.organizationStatus = event.checked
  }
  updateStatus(event){
    const data = {
      organization_status:event.organization_status === true ? false : true
    }
    const status = event?.organization_status === true ? 'deactivated' : 'activated'
    this.api.updateData(`${environment.live_url}/${environment.organization}/${event.organization_id}/`,data).subscribe(
      res => {
        if (res) {
          this.api.showSuccess(`Organization ${status} successfully!`);
          let query = `?page=${this.page}&page_size=${this.tableSize}`
          this.getOrgDetails(query)
        }
      }
    )
  }
  sort(direction: string, column: string) {
    // Reset the state of all columns except the one being sorted
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
  
    // Update the state of the currently sorted column
    this.arrowState[column] = direction === 'asc';
  
    this.directionValue = direction;
    this.sortValue = column;
  }
  
  getOrgDetails(params){
    this.api.getData(`${environment.live_url}/${environment.organization}/${params}`).subscribe(res=>{
      if(res){
       this.organizationData = res?.['results']
      
      const noOfPages:number = res?.['total_pages']
      this.count  = noOfPages * this.tableSize;
      this.count = res?.['total_no_of_record']
      this.page=res?.['current_page'];
      }
    },(error =>{
      this.api.showError(error?.error?.message)
    }))
  }
  filterSearch(event){
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 2) {
      this.term = input;
      const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getOrgDetails(query);
    } if(!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getOrgDetails(query);
    }
  }
  onTableDataChange(event:any){
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    this.getOrgDetails(query)
  }  
  onTableSizeChange(event:any): void {
    if(event){
     
    this.tableSize = Number(event.value);
    let query = `?page=${1}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    
    this.getOrgDetails(query)
    }
  } 
  delete(id:any){
    this.api.delete(`${environment.live_url}/${environment.organization}/${id}/`).subscribe(async(data:any)=>{
      if(data){
        this.organizationData = []
        this.api.showWarning('Organization deleted successfully!!')
        let query = `?page=${1}&page_size=${this.tableSize}`
        if(this.term){
          query +=`&search=${this.term}`
        }
        
        this.getOrgDetails(query)
      }
      
    },(error =>{
      this.api.showError(error?.error?.message)
    }))
  }
  editCard(id){
    this.router.navigate([`/organization/updateOrg/${id}`])
  }
  deleteCard(id){
    this.delete(id)
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
