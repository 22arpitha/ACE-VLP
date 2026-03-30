
import { NgModule } from "@angular/core";
import { OverallProductivityComponent } from "./overall-productivity/overall-productivity.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { QuantitativeProductivityComponent } from './quantitative-productivity/quantitative-productivity.component';
import { QualitativeProductivityComponent } from './qualitative-productivity/qualitative-productivity.component';
import { WorkCultureAndWorkEthicsComponent } from './work-culture-and-work-ethics/work-culture-and-work-ethics.component';
import { ProductiveHoursComponent } from './productive-hours/productive-hours.component';
import { NonBillableHoursComponent } from './non-billable-hours/non-billable-hours.component';
import { NonProductiveHoursComponent } from './non-productive-hours/non-productive-hours.component';
import { TabsComponent } from './tabs/tabs.component';
import { NonProdSummaryComponent } from './non-prod-summary/non-prod-summary.component';

@NgModule({
  declarations: [
    OverallProductivityComponent,
    QuantitativeProductivityComponent,
    QualitativeProductivityComponent,
    WorkCultureAndWorkEthicsComponent,
    ProductiveHoursComponent,
    NonBillableHoursComponent,
    NonProductiveHoursComponent,
    TabsComponent,
    NonProdSummaryComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports:[
    OverallProductivityComponent,
    QuantitativeProductivityComponent,
    QualitativeProductivityComponent,
    WorkCultureAndWorkEthicsComponent,
    ProductiveHoursComponent,
    NonBillableHoursComponent,
    NonProductiveHoursComponent,
    TabsComponent
  ]
})
export class ProductivityReportModule { }
