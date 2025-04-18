import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { buildPaginationQuery } from 'src/app/shared/pagination.util';
import { tableConfig } from './productive-hours-config';

@Component({
  selector: 'app-productive-hours',
  templateUrl: './productive-hours.component.html',
  styleUrls: ['./productive-hours.component.scss']
})
export class ProductiveHoursComponent implements OnInit {

  BreadCrumbsTitle: any = 'Non Billable Hours';
      term: string = '';
      tableSize: number = 10;
      page: any = 1;
      tableSizes = [5, 10, 25, 50, 100];

      tableConfig:any = {
        columns: [],
        data: [],
        searchTerm: '',
        actions: [],
        accessConfig: [],
        tableSize: 12,
        pagination: true,
      };
      constructor(private common_service:CommonServiceService,private router:Router) {}

      ngOnInit(): void {
        this.common_service.setTitle(this.BreadCrumbsTitle)
        this.tableConfig = tableConfig;
      }

      handleAction(event: { actionType: string; row: any }) {
        switch (event.actionType) {
          case 'navigate':
            console.log('View action triggered for row:', event.row);
            this.router.navigate(['/reports/employee-details'])
            break;
        }
      }

      onTableDataChange(event: any) {
        this.page = event;
        const query = buildPaginationQuery({
          page: this.page,
          pageSize: this.tableSize,
          searchTerm: this.term
        });

        console.log('Pagination Query:', query);
        // use this query in your API call
        // this.apiService.getData(`your-api-endpoint${query}`).subscribe(...)
      }
      onTableSizeChange(event: any): void {
        if (event) {
          this.tableSize = Number(event.value);
          this.page = 1;
          const query = buildPaginationQuery({
            page: this.page,
            pageSize: this.tableSize,
            searchTerm: this.term
          });

          console.log('Page Size Change Query:', query);
          // use this query in your API call
        }

      }
      triggerAction(event: any) {
        this.handleAction(event);
      }


}
