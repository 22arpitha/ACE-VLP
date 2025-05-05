import { Component, Input, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
export interface IdNamePair {
  id: any;
  name: string;
}
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
  filters: {employees:string[];status:string[] } = {
    employees:[],
    status:[]
  };
  allEmployeeNames: IdNamePair[] = [];
  allStatusNames: IdNamePair[] = [];
  dateFilterValue: any = null;
  constructor( private datePipe: DatePipe,private common_service: CommonServiceService,private activateRoute:ActivatedRoute,private router: Router,
    private api: ApiserviceService,
  ) {
     this.endClientData = this.activateRoute.snapshot.paramMap.get('end-client-name');
     this.client_id = this.activateRoute.snapshot.paramMap.get('client-id')
     this.end_client_id = this.activateRoute.snapshot.paramMap.get('id')
     this.BreadCrumbsTitle = this.endClientData + ' - Jobs';
     this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.getJobsOfEndClient(`?page=${1}&page_size=${5}&end-client=${this.end_client_id}`);
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
      this.api.getData(`${environment.live_url}/${environment.jobs}/${params}`).subscribe(
        (res: any) => {
          console.log(res.results)
          this.allJobs = res.results;
          const noOfPages: number = res?.['total_pages']
          this.count = noOfPages * this.tableSize;
          this.count = res?.['total_no_of_record']
          this.page = res?.['current_page'];
          this.allEmployeeNames = this.getUniqueValues(job => {
            const emp = job.employees?.find((e: any) => e.is_primary);
            return { id: emp?.employee || '', name: emp?.employee_name || '' };
          });
          this.allStatusNames = this.getUniqueValues(job => ({ id: job.job_status, name: job.job_status_name }));

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
      this.common_service.setClientActiveTabindex(id);
      this.router.navigate([`/client/update-client/${this.client_id}`])
    }
    getUniqueValues(
      extractor: (item: any) => { id: any; name: string }
    ): { id: any; name: string }[] {
      const seen = new Map();
  
      this.allJobs.forEach(job => {
        const value = extractor(job);
        if (value && value.id && !seen.has(value.id)) {
          seen.set(value.id, value.name);
        }
      });
  
      return Array.from(seen, ([id, name]) => ({ id, name }));
    }

    setDateFilterColumn(event){
      const selectedDate = event.value;
    if (selectedDate) {
      const formatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    }
    }
    onDateSelected(event: any): void {
      const selectedDate = event.value;
  
      if (selectedDate) {
        const formatted = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
      }
    }
}
