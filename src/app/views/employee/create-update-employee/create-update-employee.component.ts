import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-create-update-employee',
  templateUrl: './create-update-employee.component.html',
  styleUrls: ['./create-update-employee.component.scss']
})
export class CreateUpdateEmployeeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employee';

  constructor(private common_service: CommonServiceService) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
  }

}
