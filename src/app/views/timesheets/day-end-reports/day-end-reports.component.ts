import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SubModuleService } from '../../../service/sub-module.service';
import { ApiserviceService } from '../../../service/apiservice.service';

@Component({
  selector: 'app-day-end-reports',
  templateUrl: './day-end-reports.component.html',
  styleUrls: ['./day-end-reports.component.scss']
})
export class DayEndReportsComponent implements OnInit {
  BreadCrumbsTitle: any = 'Day End Reports'
  selectedIndex: any = 0;
  constructor(private common_service: CommonServiceService) {
     this.common_service.setTitle(this.BreadCrumbsTitle);
   }

  ngOnInit(): void {
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedIndex = event.index;
  }
}
