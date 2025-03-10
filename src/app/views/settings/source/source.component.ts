import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss']
})
export class SourceComponent implements OnInit {
  BreadCrumbsTitle: any = 'Source';
  constructor(private common_service: CommonServiceService) {
    this.common_service.setTitle(this.BreadCrumbsTitle)

   }

  ngOnInit(): void {
  }

}
