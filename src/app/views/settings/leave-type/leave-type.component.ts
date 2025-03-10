import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-leave-type',
  templateUrl: './leave-type.component.html',
  styleUrls: ['./leave-type.component.scss']
})
export class LeaveTypeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Leave Type';

  constructor(private common_service: CommonServiceService) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)

  }

  ngOnInit(): void {
  }

}
