import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';

@Component({
  selector: 'app-create-update-job',
  templateUrl: './create-update-job.component.html',
  styleUrls: ['./create-update-job.component.scss']
})
export class CreateUpdateJobComponent implements OnInit {
BreadCrumbsTitle: any = 'Job';
@ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
jobFormGroup:FormGroup;
allClientslist:any=[];
endClientslists:any=[];
groupslists:any=[];
allServiceslist:any=[];
allPeroidicitylist:any=[];
peroidslist:any=[];
allJobtypeList:any=[];
allJobStatusList:any=[];
job_id:any;
isEditItem:boolean=false;

  constructor(private fb:FormBuilder,private activeRoute:ActivatedRoute,
        private common_service: CommonServiceService,private router:Router,private datepipe:DatePipe,
        private apiService: ApiserviceService,private modalService: NgbModal) { 
        this.common_service.setTitle(this.BreadCrumbsTitle)
        if(this.activeRoute.snapshot.paramMap.get('id')){
          this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
          this.job_id= this.activeRoute.snapshot.paramMap.get('id')
          this.isEditItem = true;
        }else{
          this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
        }
      }

  ngOnInit(): void {
  }

}
