import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-jobs-of-clients',
  templateUrl: './jobs-of-clients.component.html',
  styleUrls: ['./jobs-of-clients.component.scss']
})
export class JobsOfClientsComponent implements OnInit {
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
  
    constructor(private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
      private api: ApiserviceService,
    ) {
       this.client_id = this.activateRoute.snapshot.paramMap.get('id');
    }
  
    ngOnInit(): void {
      this.getJobsOfClient(`?page=${1}&page_size=${5}&client=${this.client_id}`);
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
  
    getJobsOfClient(params: any) {
        this.api.getData(`${environment.live_url}/${environment.jobs}/${params}`).subscribe(
          (res: any) => {
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
          this.getJobsOfClient(query);
        }
        else if (!this.term) {
          this.getJobsOfClient(this.getFilterBaseUrl());
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
            this.getJobsOfClient(query);
          } else {
            // console.log(this.term,'no')
            this.getJobsOfClient(this.getFilterBaseUrl());
          }
        }
      }
    
      onTableDataChange(event: any) {
        this.page = event;
        if (this.term) {
          let query = this.getFilterBaseUrl()
          query += `&search=${this.term}`
          // console.log(this.term)
          this.getJobsOfClient(query);
        } else {
          // console.log(this.term,'no')
          this.getJobsOfClient(this.getFilterBaseUrl());
        }
      }
}
