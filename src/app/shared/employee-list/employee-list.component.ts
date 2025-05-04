import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnChanges {
  user_role_name: any;
  user_id: any;
  allEmployeeList: any = [];
  searchEmployeeText: any;
  selectedEmployeeVal: any;
  @Input() resetFilterField: boolean = false;
  @Output() selectEmployee: EventEmitter<any> = new EventEmitter<any>();
  constructor(private apiService: ApiserviceService) {
    this.user_role_name = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetFilterField'] && changes['resetFilterField'].currentValue ===true) {
      this.resetFilterField = changes['resetFilterField'].currentValue
      if (this.user_role_name === 'Accountant') {
        this.selectedEmployeeVal = this.allEmployeeList[0]?.user_id;
        this.selectEmployee.emit(this.allEmployeeList[0]?.user_id);
      } else {
        this.selectedEmployeeVal = null;
        this.selectEmployee.emit(null);
      }
    }
  }

  ngOnInit(): void {
    this.getAllEmployeeList();
  }

  public getAllEmployeeList() {
    this.allEmployeeList = [];
    let queryparams = `?is_active=True&employee=True`;
    if (this.user_role_name === 'Accountant') {
      queryparams += `&employee_id=${this.user_id}`;
    } else if (this.user_role_name === 'Manager') {
      queryparams += `&reporting_manager_id=${this.user_id}`;
    }
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
      this.allEmployeeList.push(...this.managerData);
      if (this.user_role_name === 'Accountant') {
        this.selectedEmployeeVal = this.allEmployeeList[0].user_id;
        this.selectEmployee.emit(this.allEmployeeList[0].user_id);
      }
      if (this.user_role_name === 'Manager') {
        this.getManagerData()
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }

  managerData: any = []
  getManagerData() {
    let queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`;
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.managerData = respData;
      this.allEmployeeList.push(...this.managerData);
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }
  filteredEmployeeList() {
    if (!this.searchEmployeeText) {
      return this.allEmployeeList;
    }
    return this.allEmployeeList.filter((emp: any) =>
      emp?.user__full_name?.toLowerCase()?.includes(this.searchEmployeeText?.toLowerCase())
    );
  }

  public clearSearch() {
    this.searchEmployeeText = '';
  }

  public onSelectedEmployee(event: any) {
    this.selectedEmployeeVal = event.value;
    this.selectEmployee.emit(event.value);
  }
}
