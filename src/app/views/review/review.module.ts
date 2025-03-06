import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewRoutingModule } from './review-routing.module';
import { ReviewComponent } from './review.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ManagerReviewComponent } from './manager-review/manager-review.component'
import {MatCardModule} from '@angular/material/card';
import { MatButtonModule} from '@angular/material/button';
import { MatTabsModule} from '@angular/material/tabs';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    ReviewComponent,
    ManagerReviewComponent
  ],
  imports: [
    CommonModule,
    ReviewRoutingModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    SharedModule,
    NgbTooltipModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class ReviewModule { }
