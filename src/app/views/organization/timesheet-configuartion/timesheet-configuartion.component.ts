import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SortPipe } from '../../../sort/sort.pipe';
import { environment } from '../../../../environments/environment';
import { CommonServiceService } from '../../../service/common-service.service';
import { CreateOrganizationWorkingHoursComponent } from './create-organization-working-hours/create-organization-working-hours.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-timesheet-configuartion',
  templateUrl: './timesheet-configuartion.component.html',
  styleUrls: ['./timesheet-configuartion.component.scss'],
  providers: [
    SortPipe
]
})
export class TimesheetConfiguartionComponent implements OnInit {
  BreadCrumbsTitle:any='Timesheet Configuration';
 
  term:any='';
  arrowState: { [key: string]: boolean } = {
    organization__organization_name: false,
    working_hour: false,
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
  workingHoursList = [];
  organizationStatus = false
  constructor(private api:ApiserviceService,private modalService:NgbModal,
    private dialog:MatDialog,
    private router:Router,private location:Location,
    private common_service:CommonServiceService) { }
    goBack(event)
     {
      event.preventDefault(); // Prevent default back button behavior
      this.location.back();
  
    }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id') || '';
    this.org_id = sessionStorage.getItem('org_id') 
    this.getHoursConfigData(`?page=${1}&page_size=${5}`)
  }
  getStatusText(): string {
    const status =  this.organizationData?.organization_status || this.organizationStatus ;
    return status ? 'Active' : 'Inactive';
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
  
  getHoursConfigData(params){
    this.api.getData(`${environment.live_url}/${environment.working_hour_config}/${params}`).subscribe(res=>{
      if(res){
       this.workingHoursList = res?.['results']
      
    //  const noOfPages:number = res?.['total_pages']
    // //  this.count  = noOfPages * this.tableSize;
     this.count = res?.['total_no_of_record']
      this.page=res['current_page'];
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
      this.getHoursConfigData(query);
    } if(!input) {
      const query = `?page=${this.page}&page_size=${this.tableSize}`;
      this.getHoursConfigData(query);
    }
  }
  onTableDataChange(event:any){
    this.page = event;
    let query = `?page=${this.page}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    this.getHoursConfigData(query)
  }  
  onTableSizeChange(event:any): void {
    if(event){
     
    this.tableSize = Number(event.value);
    let query = `?page=${1}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    
    this.getHoursConfigData(query)
    }
  } 
  delete(id:any){
    this.api.delete(`${environment.live_url}/${environment.working_hour_config}/${id}/`).subscribe(async(data:any)=>{
      if(data){
        this.organizationData = []
        this.api.showWarning('Working hour deleted successfully!')
        let query = `?page=${1}&page_size=${this.tableSize}`
        if(this.term){
          query +=`&search=${this.term}`
        }
        
        this.getHoursConfigData(query)
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
openEdit(event){
  this.api.getData(`${environment.live_url}/${environment.working_hour_config}/${event.id}/`).subscribe(async(res)=>{
    if(res){
     const modelRef = await this.dialog.open(CreateOrganizationWorkingHoursComponent, {
        data: res
      
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if(resp == "ok"){
          this.getHoursConfigData(`?page=${1}&page_size=${5}`)
         modelRef.close();
        }
        else{
          modelRef.close();
        }
      })
    }},(error=>{
      this.api.showError(error?.error?.message)
    }))
    this.dialog.closeAll()
}
addWorkingHours(){
    const modelRef = this.dialog.open(CreateOrganizationWorkingHoursComponent, {
      // size: <any>'sm',
      // backdrop: true,
      // centered:true
    });
   
    modelRef.componentInstance.status.subscribe(resp => {
      if(resp == "ok"){
        this.getHoursConfigData(`?page=${1}&page_size=${5}`)
       modelRef.close();
      }
      else{
        modelRef.close();
      }
  })


}

}
