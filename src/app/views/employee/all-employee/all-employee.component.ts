import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-all-employee',
  templateUrl: './all-employee.component.html',
  styleUrls: ['./all-employee.component.scss']
})
export class AllEmployeeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employee';
  constructor(private common_service: CommonServiceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
   }

  ngOnInit(): void {
  }

}
