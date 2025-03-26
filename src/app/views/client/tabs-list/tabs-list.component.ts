import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
@Component({
  selector: 'app-tabs-list',
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss']
})
export class TabsListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Client Name'
  client_id:any;
  selectedIndex:any=0;
  constructor(private common_service: CommonServiceService,private activeRoute:ActivatedRoute) { 
    this.common_service.setTitle(this.BreadCrumbsTitle);
    if(this.activeRoute.snapshot.paramMap.get('id')){
      this.client_id= this.activeRoute.snapshot.paramMap.get('id');
      this.common_service.clientActiveTabindex$.subscribe((index)=>{
        this.selectedIndex=index;
      })
    }
  }

  ngOnInit(): void {
  }
  public onTabChange(event: MatTabChangeEvent){
  this.selectedIndex=event.index;
  }
}
