import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Client Name'
  client_id:any;
  constructor(private common_service: CommonServiceService,private activeRoute:ActivatedRoute) { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id')
    }
  }

  ngOnInit(): void {
  }

}
