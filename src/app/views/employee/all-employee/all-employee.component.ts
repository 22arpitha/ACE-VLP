import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from 'src/app/service/common-service.service';

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
  arrowState: { [key: string]: boolean } = {
employee_number:false,
first_name:false,
last_name:false,
email:false,
role:false,
status:false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  allEmployeeList:any=[];
  constructor(private common_service: CommonServiceService,private router:Router) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
   }

  ngOnInit(): void {
  }

  public openCreateEmployeePage(){
    this.router.navigate(['/settings/create-employee']);

  }

public getActiveEmployeeList(){
this.isHistory=false;
this.isCurrent = true;
  }

  public getInActiveEmployeeList(){
    this.isCurrent = false;
    this.isHistory=true;
    
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
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
  }

  public getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
