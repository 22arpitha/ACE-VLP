import { Component, Input, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clients-of-group',
  templateUrl: './clients-of-group.component.html',
  styleUrls: ['./clients-of-group.component.scss']
})
export class ClientsOfGroupComponent implements OnInit {
  endClientData: any;
  BreadCrumbsTitle: any
  allClients = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    client_name: false,
  };
  page = 1;
  count = 0;
  tableSize = 50;
  tableSizes = [50,75,100];
  currentIndex: any;
  term: any = '';
  client_id:any;
  group_id:any

  constructor(private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
    private api: ApiserviceService,
  ) {
     this.endClientData = this.activateRoute.snapshot.paramMap.get('group-client-name')
     this.client_id = this.activateRoute.snapshot.paramMap.get('client-id')
     this.group_id = this.activateRoute.snapshot.paramMap.get('id')
     this.BreadCrumbsTitle = 'Group - ' + this.endClientData
     this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.getAllClientOfGroup(`?page=${1}&page_size=${50}&client=${this.client_id}&group=${this.group_id}`);
   
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
     Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'ascending' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
    let query = this.getFilterBaseUrl()
    query += `&sort-by=${this.sortValue}&sort-type=${this.directionValue}`
    this.getAllClientOfGroup(query);
  }

  getAllClientOfGroup(params: any) {
      this.api.getData(`${environment.live_url}/${environment.end_clients}/${params}`).subscribe(
        (res: any) => {
          // console.log(res.results)
          this.allClients = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
        },(error: any) => {
          this.api.showError(error?.error?.detail);
        });
    }
    filterSearch(event: any) {
      this.term = event.target.value?.trim();
      if (this.term && this.term.length >= 2) {
        this.page = 1;
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        this.getAllClientOfGroup(query);
      }
      else if (!this.term) {
        this.getAllClientOfGroup(this.getFilterBaseUrl());
      }
    }
    getFilterBaseUrl(): string {
      return `?page=${this.page}&page_size=${this.tableSize}client=${this.client_id}&group=${this.group_id}`
    }
  
    onTableSizeChange(event: any): void {
      if (event) {
        this.page = 1;
        this.tableSize = Number(event.value);
        if (this.term) {
          let query = this.getFilterBaseUrl()
          query += `&search=${this.term}`
          // console.log(this.term)
          this.getAllClientOfGroup(query);
        } else {
          // console.log(this.term,'no')
          this.getAllClientOfGroup(this.getFilterBaseUrl());
        }
      }
    }
  
    onTableDataChange(event: any) {
      this.page = event;
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getAllClientOfGroup(query);
      } else {
        // console.log(this.term,'no')
        this.getAllClientOfGroup(this.getFilterBaseUrl());
      }
    }

    backToEndClients(id){
      this.common_service.setClientActiveTabindex(id);
      this.router.navigate([`/client/update-client/${this.client_id}`])
    }

}
