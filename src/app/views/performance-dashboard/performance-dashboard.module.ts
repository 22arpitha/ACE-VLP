import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../../shared/shared.module';
import { PerformanceDashboardRoutingModule } from './performance-dashboard-routing.module';
import { PerformanceDashboardComponent } from './performance-dashboard.component';
import { QuantitativePerformanceComponent } from './quantitative-performance/quantitative-performance.component';
import { QualitativePerformanceComponent } from './qualitative-performance/qualitative-performance.component';
import { DefaultComponent } from './default/default.component';

@NgModule({
  declarations: [
    PerformanceDashboardComponent,
    QuantitativePerformanceComponent,
    QualitativePerformanceComponent,
    DefaultComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxChartsModule,
    PerformanceDashboardRoutingModule,
  ],
})
export class PerformanceDashboardModule {}
