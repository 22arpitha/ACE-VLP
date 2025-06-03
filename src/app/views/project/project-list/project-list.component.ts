import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Project list';
  allProjectList: any = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  enabled: boolean = true;
  user_id: any;
  orgId: any;
  sortValue: string = '';
  directionValue: string = '';
  arrow:boolean=false;
  arrowState: { [key: string]: boolean } = {
    project_name: false,
    client_name: false,
    project_manager_name: false,
    start_date: false,
    end_date: false,
    status_name: false,
  };
  userRole:string;
  baseUrl:String;
  accessPermissions = []
  constructor(
    private modalService: NgbModal,
    private api: ApiserviceService,
    private router: Router,
    private location: Location,
    private common_service: CommonServiceService,private accessControlService:SubModuleService
  ) {
    this.orgId = sessionStorage.getItem('organization_id')
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
   }
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.enabled = true;
    if(this.userRole==='Employee'){
      this.baseUrl = `?${'organization'}=${this.orgId}&${'employee_id'}=${this.user_id}&page=${1}&page_size=${5}`
    } else{
      this.baseUrl = `?${'organization'}=${this.orgId}&page=${1}&page_size=${5}`
    }
    // &${'created_by'}=${this.user_id}
    this.getProject(this.baseUrl);
    this.getModuleAccess();
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  
  getProject(params:any) {
    this.api.getData(`${environment.live_url}/${environment.project}/${params}`).subscribe((data: any) => {
      // console.log( data,"ALL")
      this.allProjectList = data.results;
      const noOfPages: number = data?.['total_pages']
      this.count = noOfPages * this.tableSize;
      this.count = data?.['total_no_of_record']
      this.page = data?.['current_page'];
    }, ((error: any) => {
      this.api.showError(error.error.message)
    })

    )
  }

  getFilterBaseUrl(): string {
    if(this.userRole==='Employee'){
      return `?${'organization'}=${this.orgId}&${'employee_id'}=${this.user_id}&page=${this.page}&page_size=${this.tableSize}`
    } else{
      return `?${'organization'}=${this.orgId}&page=${this.page}&page_size=${this.tableSize}`
    }
   
  }

  delete(id: any) {
    this.api.deleteProjectDetails(id).subscribe((data: any) => {
      // if (data) {
        this.allProjectList = []
        this.ngOnInit()
        this.api.showWarning('Project deleted successfully!')
      // }
    }, (error => {
      this.api.showError(error.error.error.message)
    })
    )
  }

  deleteCard(id) {
    this.delete(id)
    this.enabled = true;
  }
  editCard(id) {
    this.router.navigate([`/project/update/${id}`])
  }
  filterSearch(event:any) {
    this.term = event.target.value?.trim();
    if (this.term &&this.term.length >= 2) {
        this.page = 1;
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        this.getProject(query);
      }
       else if(!this.term) {
        this.getProject(this.getFilterBaseUrl());
    }
  }
  
  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getProject(query);
    } else {
      // console.log(this.term,'no')
      this.getProject(this.getFilterBaseUrl());
    }
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1
      this.tableSize = Number(event.value);
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getProject(query);
      } else {
        // console.log(this.term,'no')
        this.getProject(this.getFilterBaseUrl());
      }
    }
  }

  open(content) {
    if (content) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });

      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.delete(content);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }


  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
}
