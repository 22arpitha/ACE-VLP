import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericEditComponent } from '../../../generic-edit/generic-edit.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-all-employee',
  templateUrl: './all-employee.component.html',
  styleUrls: ['./all-employee.component.scss']
})
export class AllEmployeeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employee';
  term:any;
  isCurrent:boolean=true;
  isHistory:boolean=false;
  sortValue: string = '';
  directionValue: string = '';
  selectedItemId:any;
  arrowState: { [key: string]: boolean } = {
employee_number:false,
first_name:false,
email:false,
designation:false,
is_active:false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  allEmployeeList:any=[];
  constructor(private common_service: CommonServiceService,
    private router:Router,private modalService: NgbModal,
    private apiService: ApiserviceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
   }

  ngOnInit(): void {
    this.getActiveEmployeeList()
  }

  public openCreateEmployeePage(){
    this.router.navigate(['/settings/create-employee']);

  }
  async edit(item: any) {
    this.selectedItemId = item?.id;
    try {
      const modalRef = await this.modalService.open(GenericEditComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });

      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          modalRef.dismiss();
          this.router.navigate(['/settings/update-employee/',this.selectedItemId]);

        } else {
          modalRef.dismiss();
        }
      });
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }
public getActiveEmployeeList(){
this.isHistory=false;
this.isCurrent = true;
 let query = this.getFilterBaseUrl()
      query += `&is_active=true`;
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
    query += `&is_active=false`;
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${query}`).subscribe(
      (res: any) => {
        this.allEmployeeList = res.results;
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
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        if(this.isCurrent){
          this.getActiveEmployeeList()
        }else{
          this.getInActiveEmployeeList();
        }
      } else {
        if(this.isCurrent){
          this.getActiveEmployeeList()
        }else{
          this.getInActiveEmployeeList();
        }
      }
    }
  }
  public onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      if(this.isCurrent){
        this.getActiveEmployeeList()
      }else{
        this.getInActiveEmployeeList();
      }
    } else {
      if(this.isCurrent){
        this.getActiveEmployeeList()
      }else{
        this.getInActiveEmployeeList();
      }
    }
  }
  public filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      if(this.isCurrent){
        this.getActiveEmployeeList()
      }else{
        this.getInActiveEmployeeList();
      }
    }
    else if (!this.term) {
      if(this.isCurrent){
        this.getActiveEmployeeList()
      }else{
        this.getInActiveEmployeeList();
      }
    }
  }

  public getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
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
}
