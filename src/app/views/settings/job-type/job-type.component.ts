import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-job-type',
  templateUrl: './job-type.component.html',
  styleUrls: ['./job-type.component.scss']
})
export class JobTypeComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Type';

  constructor(private common_service: CommonServiceService) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle)

  }

}
