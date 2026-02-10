import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { NewTicketComponent } from './new-ticket/new-ticket.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketReportsComponent } from './ticket-reports/ticket-reports.component';

const routes: Routes = [
  {
    path: 'ticket-list',
    component: TicketListComponent,
  },
  {
    path: 'new',
    component: NewTicketComponent,
  },
  {
    path: 'reports',
    component: TicketReportsComponent,
  },
  {
    path: ':id',
    component: TicketDetailComponent,
  },
  {
    path: '',
    redirectTo: 'ticket-list',
    pathMatch: 'full',
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
