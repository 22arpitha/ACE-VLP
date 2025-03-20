import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Client Name'
  constructor(private common_service: CommonServiceService) { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
  }

}
