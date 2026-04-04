import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-qualitative-performance',
  templateUrl: './qualitative-performance.component.html',
  styleUrls: ['./qualitative-performance.component.scss'],
})
export class QualitativePerformanceComponent implements OnInit, OnChanges {
  @Input() dropdwonFilterData: any;

  // Pie Chart
  pieChartData: any[] = [];
  pieChartColorScheme: any = { domain: ['#a8385d', '#7aa3e5', '#5AA454', '#E44D25', '#CFC0BB'] };

  // Bar Chart
  barChartData: any[] = [];
  barChartColorScheme: any = { domain: ['#7aa3e5', '#a8385d', '#5AA454', '#C7B42C', '#E44D25'] };
  user_id: any;
  userRole: any;
  constructor(private apiService: ApiserviceService) {
 this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    // this.loadDefaultData();
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
          this.qualitativePerformanceData();
        }
      }
    }

  }

  loadDefaultData(): void {
    // this.pieChartData = [
    //   { name: 'Excellent', value: 30 },
    //   { name: 'Good', value: 40 },
    //   { name: 'Average', value: 20 },
    //   { name: 'Needs Improvement', value: 10 },
    // ];

    // this.barChartData = [
    //   { name: 'Communication', value: 85 },
    //   { name: 'Teamwork', value: 78 },
    //   { name: 'Leadership', value: 72 },
    //   { name: 'Problem Solving', value: 90 },
    //   { name: 'Creativity', value: 65 },
    //   { name: 'Time Management', value: 80 },
    // ];
  }

  loadChartData(): void {
    // Replace with actual API data based on dropdwonFilterData
    this.loadDefaultData();
  }

  qualitativePerformanceData() {
    let query = `?performance=qualitative`
    if (this.dropdwonFilterData) {
      query += this.dropdwonFilterData.employee_id ? `&employee-id=${this.dropdwonFilterData.employee_id}` : this.userRole === 'Admin' ? '' : `&employee-id=${this.user_id}`;
      query += this.dropdwonFilterData.periodicity ? `&periodicity=${this.dropdwonFilterData.periodicity}` : '';
      query += this.dropdwonFilterData.period ? `&period=${encodeURIComponent(JSON.stringify(this.dropdwonFilterData.period))}` : '';
      query += !this.dropdwonFilterData.employee_id && this.userRole==='Manager'? `&show_team=true` :'';
    }
    this.apiService.getData(`${environment.live_url}/${environment.performance_dashboard}/${query}`).subscribe((res: any) => {
      if (res) {
        this.pieChartData = res?.qualitative?.pieChartData || [];
        this.barChartData = res?.qualitative?.barGraphData || [];
      }
    }, (error) => {
      console.error('Error fetching qualitative performance data:', error);
    });
  }
}
