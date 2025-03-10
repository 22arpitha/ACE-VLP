import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';


@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
export class JobStatusComponent implements OnInit {
  BreadCrumbsTitle: any = 'Job Status';

  constructor(private common_service: CommonServiceService
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle)
   }

  ngOnInit(): void {
  }

}
