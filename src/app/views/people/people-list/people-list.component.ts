import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { SubModuleService } from '../../../service/sub-module.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { LimitReachedComponent } from '../../../views/accounts/limit-reached/limit-reached.component';

@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit {
  BreadCrumbsTitle: any = 'Employees list';
  allPeople = [];
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  pNav: boolean = true;
  term: any = '';
  slno: any;
  people_name: any;
  designation: any;
  doj: any;
  role: any;
  center: any;
  photo: any;
  status: any;
  action: any;

  startDate: any
  selectedId: any;
  enabled: boolean = true;
  user_id: any;
  params: any = {};
  org_id: any;
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    first_name: false,
    designation_name: false,
    is_active: false,
  };
  arrow: boolean = false
  activeEmployees: any = [];
  userRole: String;
  accessPermissions = []
  constructor(
    private api: ApiserviceService,
    private router: Router,
    private modalService: NgbModal,
    private location: Location,
    private common_service: CommonServiceService,
    private accessControlService: SubModuleService
  ) { }

  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  }
  ngOnInit(): void {
    this.term = '';
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.org_id = sessionStorage.getItem('organization_id')
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
    localStorage.removeItem('employee_id');
    this.getPeople(`?organization_id=${this.org_id}&page=${1}&page_size=${10}`);
    this.enabled = true;
    this.getModuleAccess();
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  async getSubscriptionDetails() {
    try {
      const res: any = await this.api
        .getData(`${environment.live_url}/${environment.my_subscription}/?organization=${this.org_id}`)
        .toPromise();

      if (res.data && res.data.length) {
        for (const element of res.data) {
          if (element.is_active && element.added_users >= element.max_user) {
            const modalRef = await this.modalService.open(LimitReachedComponent, {
              size: <any>'sm',
              backdrop: true,
              centered: true,
            });

            modalRef.componentInstance.status.subscribe((resp: any) => {
              if (resp === "ok") {
                this.router.navigate(['/accounts/subscription']);
              }
              modalRef.close();
            });
            return; // Exit loop after showing modal
          }
        }
        // If no condition was met for showing the modal, navigate to create people
        this.router.navigate(['/people/create-people']);
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    }
  }

  changeYearStartDate(event: any) {
    //console.log(event.target.value)
    this.startDate = event.target.value
  }
  isDate(value: any): boolean {
    // Convert the value to a Date object
    const date = new Date(value);
    // Check if the converted date is valid and not NaN
    return date instanceof Date && !isNaN(date.getTime());
  }

  getFilterBaseUrl(): string {
    return `?organization_id=${this.org_id}&page=${this.page}&page_size=${this.tableSize}`;
  }

  getPeople(params: any) {
    this.api.getData(`${environment.live_url}/${environment.allEmployee}/${params}`).subscribe((data: any) => {
      const transformedData = data.results.map(item => {
        return Object.assign({}, item, item.user, { user: '' });
      });

      this.allPeople = transformedData;
      // console.log('all employees', this.allPeople)
      const noOfPages: number = data?.['total_pages']
      this.count = noOfPages * this.tableSize;
      this.count = data?.['total_no_of_record']
      this.page = data?.['current_page'];

    }, ((error) => {
      this.api.showError(error.error.error.message)
    })
    )
  }



  flattenUserData(data: any): any {
    return {
      ...data, // Main object properties
      ...data.user // Spread the user properties
    };
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      this.getPeople(query);
    }
    else if (!this.term) {
      this.getPeople(this.getFilterBaseUrl());
    }
  }
  delete(id: any) {
    this.api.deleteEmployees(id).subscribe((data: any) => {
      // if(data){
      this.api.showWarning('Employee deleted successfully!')
      this.allPeople = []
      this.ngOnInit()
      // }

    }, ((error: any) => {
      this.api.showError(error.error.error.message)
    }))
  }
  cardId(selected): any {
    this.selectedId = selected.id;
  }
  deleteCard(id) {
    this.delete(id)

  }
  editCard(id) {
    this.router.navigate([`/people/updatePeople/${id}/${this.page}/${this.tableSize}`])
  }
  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getPeople(query);
    } else {
      // console.log(this.term,'no')
      this.getPeople(this.getFilterBaseUrl());
    }
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getPeople(query);
      } else {
        // console.log(this.term,'no')
        this.getPeople(this.getFilterBaseUrl());
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

  openUpdatePeople(id) {
    localStorage.removeItem('employee_id');
    localStorage.setItem('employee_id', id);
    this.router.navigate(['/people/updatePeople']);
  }
}
