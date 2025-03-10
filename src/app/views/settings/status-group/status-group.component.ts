import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-status-group',
  templateUrl: './status-group.component.html',
  styleUrls: ['./status-group.component.scss']
})
export class StatusGroupComponent implements OnInit {
  BreadCrumbsTitle: any = 'Status Group';

  constructor(private common_service: CommonServiceService) { 
    this.common_service.setTitle(this.BreadCrumbsTitle)

  }

  ngOnInit(): void {
  }

}
