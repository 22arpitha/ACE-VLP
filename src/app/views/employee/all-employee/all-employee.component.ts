import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericEditComponent } from '../../../generic-components/generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
export interface IdNamePair {
  id: any;
  name: string;
}
@Component({
  selector: 'app-all-employee',
  templateUrl: './all-employee.component.html',
  styleUrls: ['./all-employee.component.scss']
})
export class AllEmployeeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employee';
  term:any='';
  isCurrent:boolean=true;
  isHistory:boolean=false;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId:any;
  arrowState: { [key: string]: boolean } = {
employee_number:false,
user__full_name:false,
user__email:false,
designation__designation_name:false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  allEmployeeList:any=[];
  accessPermissions = []
  user_id: any;
  userRole: any;
  filters: { designation__designation_name: string[]} = {
    designation__designation_name:[]
  }
  allRoleNames:IdNamePair[] = [];
  filterQuery: string;
  filteredemployeeList:any =[];
  constructor(private common_service: CommonServiceService,
    private router:Router,private modalService: NgbModal,private accessControlService:SubModuleService,
    private apiService: ApiserviceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
    this.common_service.empolyeeStatus$.subscribe((status:boolean)=>{
      if(status){
        this.getActiveEmployeeList();
      }else{
        this.getInActiveEmployeeList();        
      }
    })
   }

  ngOnInit() {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.getModuleAccess();
    this.getAllRoleList();
  }

  access_name:any ;
  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name=access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  public openCreateEmployeePage(){
    // console.log('ddddddddd')
    sessionStorage.setItem('access-name', this.access_name?.name)
    this.router.navigate(['/settings/create-employee']);

  }
  async edit(item: any) {
    this.selectedItemId = item?.user_id;
      sessionStorage.setItem('access-name', this.access_name?.name)
      this.router.navigate(['/settings/update-employee/',this.selectedItemId]);
    // try {
    //   const modalRef = await this.modalService.open(GenericEditComponent, {
    //     size: 'sm',
    //     backdrop: 'static',
    //     centered: true
    //   });

    //   modalRef.componentInstance.status.subscribe(resp => {
    //     if (resp === 'ok') {
    //       modalRef.dismiss();

    //     } else {
    //       modalRef.dismiss();
    //     }
    //   });
    // } catch (error) {
    //   console.error('Error opening modal:', error);
    // }
  }
public getAllRoleList() {
    this.allRoleNames = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_roles}/`).subscribe((respData: any) => {
      if(respData && respData.length>=1){
      this.allRoleNames = respData?.map((role:any) => ({ id: role?.id, name: role?.designation_name }));
      }
    }, (error: any) => {
      this.apiService.showError(error.detail);

    })
  }

  // Current Btn event
  getCurrentEmployeeList(){
    this.page = 1;
    this.tableSize = 50;
  this.getActiveEmployeeList();    
  }
// History btn event 
  getEmployeeHistoryList(){
    this.page = 1;
    this.tableSize = 50;
    this.getInActiveEmployeeList();
  }

public getActiveEmployeeList(){
this.isHistory=false;
this.isCurrent = true;
 let query = this.getFilterBaseUrl()
      query += `&is_active=True`;
this.apiService.getData(`${environment.live_url}/${environment.employee}/${query}`).subscribe(
      (res: any) => {
        this.allEmployeeList = res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }

  public getInActiveEmployeeList(){
    this.isCurrent = false;
    this.isHistory=true;
    let query = this.getFilterBaseUrl()
    query += `&is_active=False`;
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${query}`).subscribe(
      (res: any) => {
        this.allEmployeeList = res.results;
        this.filteredemployeeList=res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
  public onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      this.filterData();
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    this.filterData();
  }
  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      this.filterData();
    }
    else if (!this.term) {
      this.filterData();
    }
  }

  public getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}&search=${this.term}&employee=True`;
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

  // Filter Related
  onFilterChange(event: any, filterType: string) {
    const selectedOptions = event;
    this.filters[filterType] = selectedOptions;
    this.filterData();
  }

  filterData() {
    this.filterQuery = this.getFilterBaseUrl();
    if (this.filters.designation__designation_name.length) {
      this.filterQuery += `&designation-ids=[${this.filters.designation__designation_name.join(',')}]`;
    }

    if(this.isCurrent){
      this.filterQuery += `&is_active=True`;
    }
    else{
      this.filterQuery += `&is_active=False`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${this.filterQuery}`).subscribe(
      (res: any) => {
        this.allEmployeeList = res?.results;
        this.filteredemployeeList=res?.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
}
