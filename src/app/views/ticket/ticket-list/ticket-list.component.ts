import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Ticket,
  TicketFilter,
  TicketStatus,
} from 'src/app/models/ticket.models';
import { CommonServiceService } from 'src/app/service/common-service.service';

import { TicketService } from 'src/app/service/ticket.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
})
export class TicketListComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  loading = false;
  private destroy$ = new Subject<void>();
  // Pagination
  page: number = 1;
  tableSize: number = 10;
  tableSizes: number[] = [5, 10, 25, 50];
  BreadCrumbsTitle: any = 'Tickets';
  // Current user info (should come from auth service)
  currentUserId = 'user123'; // Replace with actual auth service
  currentUserRole = 'EMPLOYEE'; // Replace with actual auth service

  // Filter properties
  filter: TicketFilter = {};
  ticketStatuses = Object.values(TicketStatus);

  // Sorting
  sortColumn: string = 'ticketRaisedDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  displayedColumns = [
    'ticketNumber',
    'ticketRaisedDate',
    'issue',
    'status',
    'statusDate',
  ];

  // Mobile menu
  showMobileFilters = false;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private common_service:CommonServiceService
  ) {
     this.common_service.setTitle(this.BreadCrumbsTitle);
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService
      .getTicketsForUser(this.currentUserId, this.currentUserRole)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tickets: any) => {
        this.tickets = tickets;
        this.applyFiltersAndSort();
        this.loading = false;
      });
  }

  // applyFiltersAndSort(): void {
  //   this.ticketService
  //     .getFilteredTickets(this.filter, this.sortColumn, this.sortDirection)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((filtered: any) => {
  //       // Additional role-based filtering
  //       if (this.currentUserRole === 'EMPLOYEE') {
  //         if (this.filter.status && this.filter.status.length > 0) {
  //           filtered = filtered.filter((t) =>
  //             this.filter.status?.includes(t.status),
  //           );
  //         }

  //         this.filteredTickets = filtered.filter(
  //           (t: any) => t.employeeId === this.currentUserId,
  //         );
  //       } else {
  //         this.filteredTickets = filtered;
  //       }
  //     });
  // }

  applyFiltersAndSort() {
    this.ticketService
      .getFilteredTickets(this.filter, this.sortColumn, this.sortDirection)
      .pipe(takeUntil(this.destroy$))
      .subscribe((filtered: Ticket[]) => {
        if (this.currentUserRole === 'EMPLOYEE') {
          this.filteredTickets = filtered.filter(
            (t) => t.employeeId === this.currentUserId,
          );
        } else {
          this.filteredTickets = filtered;
        }
      });
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  clearFilters(): void {
    this.filter = {};
    this.applyFiltersAndSort();
  }

  openTicket(ticket: Ticket): void {
    this.router.navigate(['it-support/tickets/', ticket.id]);
  }

  raiseNewTicket(): void {
    this.router.navigate(['/it-support/tickets/new']);
  }

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OPEN:
        return 'open';
      case TicketStatus.CLOSE_REQUEST_SENT:
        return 'close-request-sent';
      case TicketStatus.REOPEN:
        return 're-open';
      case TicketStatus.CLOSED:
        return 'closed';
      default:
        return '';
    }
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Open':
        return 'danger';
      case 'In Progress':
        return 'warning';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'info';
      default:
        return 'secondary';
    }
  }

  columns = [
    { key: 'ticketNumber', label: 'Ticket #', visible: true },
    { key: 'ticketRaisedDate', label: 'Raised Date', visible: true },
    { key: 'issue', label: 'Issue', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'statusDate', label: 'Status Date', visible: true },
  ];

  isColumnVisible(key: string): boolean {
    return this.columns.find((c) => c.key === key)?.visible ?? true;
  }
  clearDateFilter(): void {
    this.filter.ticketRaisedDateFrom = undefined;
    this.filter.ticketRaisedDateTo = undefined;
    this.applyFiltersAndSort();
  }


  onStatusChange(ticket: Ticket, event: any): void {

  const newStatus = event.value;

  ticket.status = newStatus;
  ticket.statusDate = new Date();

  // If using dummy backend:
  this.ticketService.updateTicketStatus(ticket.id, newStatus);

  this.applyFiltersAndSort();
}

ticketStatusValidation(ticket: Ticket, newStatus: TicketStatus): boolean {

  // Example rules:
  if (ticket.status === TicketStatus.CLOSED) {
    return true; // cannot change closed ticket
  }

  if (ticket.status === TicketStatus.OPEN &&
      newStatus === TicketStatus.REOPEN) {
    return true; // cannot reopen if not closed
  }

  return false;
}

}
