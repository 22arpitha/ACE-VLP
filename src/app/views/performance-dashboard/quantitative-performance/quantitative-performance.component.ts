import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-quantitative-performance',
  templateUrl: './quantitative-performance.component.html',
  styleUrls: ['./quantitative-performance.component.scss'],
})
export class QuantitativePerformanceComponent implements OnInit, OnChanges {
  @Input() dropdwonFilterData: any;

  // Pie Chart
  pieChartData: any[] = [];
  pieChartColorScheme: any = { domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d'] };

  // Bar Chart
  barChartData: any[] = [];
  barChartColorScheme: any = { domain: ['#5AA454', '#C7B42C', '#E44D25', '#7aa3e5', '#a8385d'] };
  user_id: any;
  userRole: any;

  constructor(private apiService: ApiserviceService) {
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.loadDefaultData();
    // this.quantitativePerformanceData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dropdwonFilterData']) {
      const prev = changes['dropdwonFilterData'].previousValue || {};
      const current = changes['dropdwonFilterData'].currentValue;
      const employeeIdChanged = prev.employee_id !== current.employee_id;
      const periodicityChanged = prev.periodicity !== current.periodicity;
      const periodChanged = prev.period !== current.period;
      if (employeeIdChanged || periodicityChanged || periodChanged) {
        this.dropdwonFilterData = current;
        if (this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period) {
          this.quantitativePerformanceData();
        }
      }
    }

  }
  quantitativePerformanceData() {
    let query = `?performance=quantitative`
    if (this.dropdwonFilterData) {
      query += this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}` : this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
      query += this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}` : '';
      query += this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}` : '';
      query += !this.dropdwonFilterData.employee_id && this.userRole==='Manager'? `&show_team=true` :'';
      // query+= this.dropdwonFilterData.employee_id && this.dropdwonFilterData.periodicity && this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'&is_dropdown_selected=False';
      // finalQuery+= this.dropdwonFilterData.employee_id || this.dropdwonFilterData.periodicity || this.dropdwonFilterData.period ? '&is_dropdown_selected=True' :'';
    }
    this.apiService.getData(`${environment.live_url}/${environment.performance_dashboard}/${query}`).subscribe((res: any) => {
      if (res) {
        this.pieChartData = res?.quantitative?.pieChartData || [];
        this.barChartData = res?.quantitative?.barGraphData || [];
      }
      // Process the response to fit the chart data structure
    }, (error) => {
      console.error('Error fetching quantitative performance data:', error);
    }

    );

  }

  loadDefaultData(): void {
    // this.pieChartData = [
    //   { name: 'Completed Tasks', value: 45 },
    //   { name: 'Pending Tasks', value: 20 },
    //   { name: 'Overdue Tasks', value: 10 },
    //   { name: 'In Progress', value: 25 },
    // ];

    this.barChartData = [
      // { name: 'Jan', value: 10 },
      // { name: 'Feb', value: 82 },
      // { name: 'Mar', value: 68 },
      // { name: 'Apr', value: 91 },
      // { name: 'May', value: 77 },
      // { name: 'Jun', value: 85 },
      // { name: 'jul', value: 10 },
      // { name: 'aug', value: 82 },
      // { name: 'sep', value: 68 },
      // { name: 'oct', value: 91 },
      // { name: 'nov', value: 77 },
      // { name: 'dec', value: 85 },
    ];
  }

  loadChartData(): void {
    // Replace with actual API data based on dropdwonFilterData
    this.loadDefaultData();
  }
}
