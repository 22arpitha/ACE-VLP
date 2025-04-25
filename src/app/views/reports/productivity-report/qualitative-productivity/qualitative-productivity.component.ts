import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '../../../../service/common-service.service';
import { buildPaginationQuery } from '../../../../shared/pagination.util';
import { tableConfig } from './qualitative-productivity-config';
@Component({
  selector: 'app-qualitative-productivity',
  templateUrl: './qualitative-productivity.component.html',
  styleUrls: ['./qualitative-productivity.component.scss']
})
export class QualitativeProductivityComponent implements OnInit,OnChanges {

BreadCrumbsTitle: any = 'Qualitative Productivity';
@Input() dropdwonFilterData:any;
      term: string = '';
      tableSize: number = 5;
      page: any = 1;
      tableSizes = [5, 10, 25, 50, 100];

      tableConfig:any = {
        columns: [],
        data: [],
        searchTerm: '',
        actions: [],
        accessConfig: [],
        tableSize: 5,
        pagination: true,
      };
      constructor(private common_service:CommonServiceService,private router:Router) {}
      ngOnChanges(changes: SimpleChanges): void {
        if(changes['dropdwonFilterData']){
          this.dropdwonFilterData=changes['dropdwonFilterData']?.currentValue;
        }
      }

      ngOnInit(): void {
        this.common_service.setTitle(this.BreadCrumbsTitle)
        this.tableConfig = tableConfig;
        console.log('Table Config:', this.tableConfig);
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


      ngOnDestroy(): void {
        this.tableConfig=null
      }
}
