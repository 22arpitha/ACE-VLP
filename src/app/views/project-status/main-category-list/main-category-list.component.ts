import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-main-category-list',
  templateUrl: './main-category-list.component.html',
  styleUrls: ['./main-category-list.component.scss']
})
export class MainCategoryListComponent implements OnInit {

  allMainCategoryList=[];
  currentIndex = 1;
  page = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [10,25,50,100];

  term:any='';
  slno:any;
  main:any;
  color:any;
  action:any;
  selectedColor: any[];
  selectedId: any;
  enabled: boolean = true;
  permissions: any = [];
  user_id: string;
  constructor(
    private modalService:NgbModal, 
    private api:ApiserviceService,
    private router:Router,
    private location:Location,
    private common_service:CommonServiceService
    ) { }

  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  ngOnInit(): void {
    this.getMainCategory();
    this.enabled = true;
    this.getUserControls()
  }
  filterSearch(){
    this.api.getData(`${environment.live_url}/${environment.main_category}?search_key=${this.term}&page_number=1&data_per_page=10`).subscribe((res:any)=>{
      if(res){
      this.allMainCategoryList= res.result.data;
      this.selectedColor = this.allMainCategoryList.map(cr => cr.psmc_color_code)
     
      const noOfPages:number = res['result'].pagination.number_of_pages
      this.count  = noOfPages * this.tableSize;
      this.page=res['result'].pagination.current_page;

      }
    },((error:any)=>{
      this.api.showError(error.error.error.message)
    }))
  }
  getUserControls(){
    this.user_id = sessionStorage.getItem('user_id')
    this.api.getUserRoleById(`user_id=${this.user_id}&page_number=1&data_per_page=10`).subscribe((res:any)=>{
      if(res.status_code !== '401'){
        this.common_service.permission.next(res['data'][0]['permissions'])
        //console.log(this.common_service.permission,"PERMISSION")
      }
      else{
        this.api.showError("ERROR !")
      }
      //console.log(res,'resp from yet');
      
    },(error=>{
      this.api.showError(error.error.error.message)
   })
  
    )
  
    this.common_service.permission.subscribe(res=>{
      const accessArr = res
      if(accessArr.length > 0){
        accessArr.forEach(element => {
          if(element['MAIN_CATEGORIES']){
            this.permissions = element['MAIN_CATEGORIES']
          }
          
        });
      }
    })
    }
  getMainCategory(){
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize
  }
    this.api.getMainCategoryDetailsPage(params).subscribe((data:any)=>{
      this.allMainCategoryList= data.result.data;
      this.selectedColor = this.allMainCategoryList.map(cr => cr.psmc_color_code)
     
      const noOfPages:number = data['result'].pagination.number_of_pages
      this.count  = noOfPages * this.tableSize;
      this.page=data['result'].pagination.current_page;

    },((error:any)=>{
      this.api.showError(error.error.error.message)
    })

    )
  }
  delete(id:any){
    this.api.deleteMainCategoryDetails(id).subscribe((data:any)=>{
      if(data){
        this.allMainCategoryList = []
        this.ngOnInit();
        this.api.showWarning('Main category deleted successfully!!')
      }
      
    },error=>{
      this.api.showError(error.error.error.message)
      
    })
    
  }
 
  deleteCard(id){
    this.delete(id)
    this.enabled = true;
  }
  editCard(id){
    this.router.navigate([`/status/updateMainCategory/${id}/${this.page}/${this.tableSize}`])
  }
  onTableDataChange(event:any){
    this.page = event;
    this.getMainCategory();
  }  
  onTableSizeChange(event:any): void {
    this.tableSize = Number(event.target.value);
    this.count = 0
    // Calculate new page number
    const calculatedPageNo = this.count / this.tableSize
    
    if(calculatedPageNo < this.page){
      this.page = 1
    }
    this.getMainCategory();
  } 
  arrow:boolean=false
  directionValue:any='desc'




  sortValue:any='psmc_name'
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