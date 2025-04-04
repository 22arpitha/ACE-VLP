import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';
@Component({
  selector: 'app-leave-master',
  templateUrl: './leave-master.component.html',
  styleUrls: ['./leave-master.component.scss']
})
export class LeaveMasterComponent implements OnInit {
  BreadCrumbsTitle:any='Leave Master';
  leaveMasterList=[];
  currentIndex:any;
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];

  term:any='';
  slno:any;
  title:any;
  type:any;
  leave:any;
  carry:any;
  day:any;
  encashment:any;
  maximum_enhancement:any;
  action:any;
  selectedId: any;
  enabled: boolean = true;
  user_id: any;
  orgId: any;
  params:any;
  sortValue: string = '';
  directionValue: string = '';
  organization_id: any;
  accessPermissions = []
  userRole:any;
  constructor(
    private modalService:NgbModal, 
    private api:ApiserviceService,
    private router:Router,
    private location:Location,
    private common_service:CommonServiceService,
    private accessControlService:SubModuleService
    ) { }
    
    arrowState: { [key: string]: boolean } = {
      number_of_leaves: false,
      cary_forward_percentage: false,
      graceful_days:false,
      maximum_enhancement:false
    };
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.organization_id = JSON.parse(sessionStorage.getItem('organization_id'))
    this.getLeaveType(`?organization=${this.organization_id}&page=${this.page}&page_size=${this.tableSize}`);
    this.getModuleAccess();
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
  filterSearch(event){
    const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
    if (input && input.length >= 3) {
      this.term = input;
      const query = `?organization=${this.organization_id}&page=1&page_size=${this.tableSize}&search=${this.term}`;
      this.getLeaveType(query);
    } if(!input) {
      const query = `?organization=${this.organization_id}&page=${this.page}&page_size=${this.tableSize}`;
      this.getLeaveType(query);
    }

  
  }

  
  getLeaveType(params){
  
    this.api.getData(`${environment.live_url}/${environment.leave_master}/${params}`).subscribe((data:any)=>{
      this.leaveMasterList= data?.['results'];
      const noOfPages:number = data.total_pages
      this.count  = noOfPages * this.tableSize;
      this.page=data?.['current_page'];

    },(error=>{
     this.api.showError(error?.error?.message)
      
    })

    )
  }
  delete(id:any){
    this.api.delete(`${environment.live_url}/${environment.leave_master}/${id}/`).subscribe((data:any)=>{
      this.enabled = true
      this.api.showWarning('Deleted successfully!')
      let query = `?organization=${this.organization_id}&page=${this.page}&page_size=${this.tableSize}`
      if(this.term){
        query +=`&search=${this.term}`
      }
      this.getLeaveType(query);

    },error=>{
      this.api.showError(error?.error?.message);
      
    })
    
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
  cardId(selected):any{
    this.selectedId = selected.id;
    this.enabled = false;

   }
  deleteCard(id){
    this.delete(id)
    this.enabled = true;
  }
  editCard(id){
    this.router.navigate([`/leave/updateLeaveDetails/${id}`])
  }
  onTableDataChange(event:any){
    this.page = event;
    let query = `?organization=${this.organization_id}&page=${this.page}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    this.getLeaveType(query);
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.value);
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize 
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    let query = `?organization=${this.organization_id}&page=${this.page}&page_size=${this.tableSize}`
    if(this.term){
      query +=`&search=${this.term}`
    }
    this.getLeaveType(query);
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
