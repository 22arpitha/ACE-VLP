import { Component, Input, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-jobs-of-endclient',
  templateUrl: './jobs-of-endclient.component.html',
  styleUrls: ['./jobs-of-endclient.component.scss']
})
export class JobsOfEndclientComponent implements OnInit {
  endClientData: any;
  BreadCrumbsTitle: any
  allJobs = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    job_number: false,
    job_name: false,
    employee_name: false,
    status: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';
  client_id:any;
  end_client_id:any

  constructor(private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
    private api: ApiserviceService,
  ) {
     this.endClientData = this.activateRoute.snapshot.paramMap.get('end-client-name');
     this.client_id = this.activateRoute.snapshot.paramMap.get('client-id')
     this.end_client_id = this.activateRoute.snapshot.paramMap.get('id')
     this.BreadCrumbsTitle = this.endClientData + ' - Jobs';
     this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.getJobsOfEndClient(`?page=${1}&page_size=${5}`);
   
  }

  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
    this.arrowState[column] = direction === 'asc' ? true : false;
    this.directionValue = direction;
    this.sortValue = column;
  }

  getJobsOfEndClient(params: any) {
      this.api.getData(`${environment.live_url}/${environment.end_client_jobs}/${params}`).subscribe(
        (res: any) => {
          console.log(res.results)
          this.allJobs = res.results;
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
        this.getJobsOfEndClient(query);
      }
      else if (!this.term) {
        this.getJobsOfEndClient(this.getFilterBaseUrl());
      }
    }
    getFilterBaseUrl(): string {
      return `?page=${this.page}&page_size=${this.tableSize}`;
    }
  
    onTableSizeChange(event: any): void {
      if (event) {
        this.page = 1;
        this.tableSize = Number(event.value);
        if (this.term) {
          let query = this.getFilterBaseUrl()
          query += `&search=${this.term}`
          // console.log(this.term)
          this.getJobsOfEndClient(query);
        } else {
          // console.log(this.term,'no')
          this.getJobsOfEndClient(this.getFilterBaseUrl());
        }
      }
    }
  
    onTableDataChange(event: any) {
      this.page = event;
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getJobsOfEndClient(query);
      } else {
        // console.log(this.term,'no')
        this.getJobsOfEndClient(this.getFilterBaseUrl());
      }
    }

    backToEndClients(id){
      this.router.navigate([`/client/update-client/${this.client_id}`])
    }

}
