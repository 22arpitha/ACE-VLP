import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  Ticket,
  TicketFilter,
  TicketStatus,
} from 'src/app/models/ticket.models';

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
  // filter = {
  //   ticketRaisedDateFrom: null as Date | null,
  //   ticketRaisedDateTo: null as Date | null,
  //   statusDateFrom: null as Date | null,
  //   statusDateTo: null as Date | null,
  //   issue: '',
  //   status: undefined
  // };

  // Mobile menu
  showMobileFilters = false;

  constructor(
    private ticketService: TicketService,
    private router: Router,
  ) {}

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
      .subscribe((tickets) => {
        this.tickets = tickets;
        this.applyFiltersAndSort();
        this.loading = false;
      });
  }

  applyFiltersAndSort(): void {
    this.ticketService
      .getFilteredTickets(this.filter, this.sortColumn, this.sortDirection)
      .pipe(takeUntil(this.destroy$))
      .subscribe((filtered) => {
        // Additional role-based filtering
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
    this.router.navigate(['/tickets', ticket.id]);
  }

  raiseNewTicket(): void {
    this.router.navigate(['/tickets/new']);
  }

  getStatusClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.OPEN:
        return 'status-open';
      case TicketStatus.CLOSE_REQUEST_SENT:
        return 'status-close-request';
      case TicketStatus.REOPEN:
        return 'status-reopen';
      case TicketStatus.CLOSED:
        return 'status-closed';
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
}
