import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  BreadCrumbsTitle: any = 'Services';
  constructor(private fb:FormBuilder,private modalService:NgbModal,
        private common_service: CommonServiceService,private apiService:ApiserviceService) { 
      this.common_service.setTitle(this.BreadCrumbsTitle)
  
    }

  ngOnInit(): void {
  }

}
