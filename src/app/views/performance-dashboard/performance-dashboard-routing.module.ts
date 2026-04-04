import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PerformanceDashboardComponent } from './performance-dashboard.component';
import { DefaultComponent } from './default/default.component';

const routes: Routes = [
  {
    path: '',
    component: PerformanceDashboardComponent,
    children: [
      { path: 'dashboard', component: DefaultComponent },
    ],
  },
];

@NgModule({   
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceDashboardRoutingModule {}
