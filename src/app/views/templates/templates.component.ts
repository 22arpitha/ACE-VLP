import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { GenericEditComponent } from 'src/app/generic-edit/generic-edit.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {

BreadCrumbsTitle: any = 'Templates';
 
    constructor(private fb:FormBuilder,private modalService:NgbModal,
        private common_service: CommonServiceService,private apiService:ApiserviceService) { 
      this.common_service.setTitle(this.BreadCrumbsTitle)
    }
  
    ngOnInit(): void {
    }
  }
