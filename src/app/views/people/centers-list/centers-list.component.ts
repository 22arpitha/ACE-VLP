import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-centers-list',
  templateUrl: './centers-list.component.html',
  styleUrls: ['./centers-list.component.scss']
})
export class CentersListComponent implements OnInit {
  BreadCrumbsTitle:any='Center list';
  allCenterList=[];
  result:any = [];
  currentIndex = 1;
  page = 1;
  count = 0;
  tableSize =10;
  tableSizes = [10,25,50,100];
  enabled = true;

  term:any='';
  slno:any;
  center:any;
  date:any;
  action:any;
  status:any;
  selectedId: any;
  permissions: any = [];
  user_id: string;
  orgId: string;
  constructor(
    private modalService:NgbModal, 
    private api:ApiserviceService,
    private router:Router,
    private location:Location,
    private common_service:CommonServiceService
    ) {
      this.orgId = sessionStorage.getItem('org_id')
     }

  
 goBack(event){
  event.preventDefault(); // Prevent default back button behavior
  this.location.back();
}
  ngOnInit(): void {
    this.term='';
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.getCenter();
    this.enabled = true;
    this.getUserControls()
  }
  getUserControls(){
    this.user_id = sessionStorage.getItem('user_id')
    this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe((res:any)=>{
      if(res.status_code !== '401'){
        this.common_service.permission.next(res['data'][0]['permissions'])
      }
      else{
        this.api.showError("ERROR !")
      }
    }
  
    )
  
    this.common_service.permission.subscribe(res=>{
      const accessArr = res
      if(accessArr.length > 0){
        accessArr.forEach((element,i) => {
          if(element['CENTERS']){
            this.permissions = element['CENTERS']
          }
          
        });
      }
    })
   
    }
  getCenter(){
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize,
      pagination:'TRUE',
      organization_id:this.orgId,
      search_key:this.term,
  }
    this.api.getCenterDetailsPage(params).subscribe((data:any)=>{
      this.allCenterList= data.result.data;
      const noOfPages:number = data['result'].pagination.number_of_pages
      this.count  = noOfPages * this.tableSize;
      this.page=data['result'].pagination.current_page;

    },((error:any)=>{
      this.api.showError(error.error.error.message)
      
    })

    )
  }
 filterSearch(){
  this.api.getData(`${environment.live_url}/${environment.center_list}?search_key=${this.term}&page_number=${this.page}&data_per_page=${this.tableSize}&pagination=TRUE&organization_id=${this.orgId}`).subscribe((data:any)=>{
    this.allCenterList= data.result.data;
    const noOfPages:number = data['result'].pagination.number_of_pages
    this.count  = noOfPages * this.tableSize;
    this.page=data['result'].pagination.current_page;

  },((error:any)=>{
    this.api.showError(error.error.error.message)
    
  })

  )
 }
  delete(id:any){
    this.api.deleteCenterDetails(id).subscribe((data:any)=>{
      if(data){
        this.api.showWarning('Center deleted successfully!')
          this.allCenterList = []
          this.ngOnInit()
      }
    },((error:any)=>{
      this.api.showError(error.error.error.message)
    }))  
  }
  
  cardId(selected):any{
    this.selectedId = selected.id;
    this.enabled = false;

   }
  deleteCard(id){
    this.delete(id)
   }
  editCard(id){
    this.router.navigate([`/people/updateCenter/${id}/${this.page}/${this.tableSize}`])
  }
  onTableDataChange(event:any){
    this.page = event;
    this.getCenter();
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize 
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    this.getCenter();
  }  
  arrow:boolean=false
  directionValue:any='desc'




  sortValue:any='center_name'
  sort(direction:any,value:any){
    if(direction=='asc'){
      this.arrow=true
      this.directionValue= direction
      this.sortValue= value
    }
    else{
      this.arrow=false
      this.directionValue= direction
      this.sortValue= value
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

getContinuousIndex(index: number):number {
  return (this.page-1)*this.tableSize+ index + 1;
}
}
