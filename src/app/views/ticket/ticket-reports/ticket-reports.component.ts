import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketFilter, TicketReport, TicketStatus } from 'src/app/models/ticket.models';
import { TicketService } from 'src/app/service/ticket.service';


@Component({
  selector: 'app-ticket-reports',
  templateUrl: './ticket-reports.component.html',
  styleUrls: ['./ticket-reports.component.scss']
})
export class TicketReportsComponent implements OnInit, OnDestroy {
  reports: TicketReport[] = [];
  filteredReports: TicketReport[] = [];
  loading = false;
  exporting = false;
  private destroy$ = new Subject<void>();

  // Current user info (should come from auth service)
  currentUserRole = 'ADMIN'; // or 'TECHNICAL_SUPPORT'

  // Filter properties
  filter: TicketFilter = {};
  ticketStatuses = Object.values(TicketStatus);
  
  // Sorting
  sortColumn: string = 'statusDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Mobile menu
  showMobileFilters = false;

  // Statistics
  totalTickets = 0;
  openTickets = 0;
  closedTickets = 0;
  averageTAT = 0;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReports(): void {
    this.loading = true;
    this.ticketService.generateReport(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(reports => {
        this.reports = reports;
        this.applySort();
        this.calculateStatistics();
        this.loading = false;
      });
  }

  applySort(): void {
    this.filteredReports = [...this.reports].sort((a, b) => {
      let aVal: any = a[this.sortColumn as keyof TicketReport];
      let bVal: any = b[this.sortColumn as keyof TicketReport];

      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      // Handle undefined TAT values
      if (this.sortColumn === 'tat') {
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  calculateStatistics(): void {
    this.totalTickets = this.reports.length;
    this.openTickets = this.reports.filter(r => 
      r.status === TicketStatus.OPEN || r.status === TicketStatus.REOPEN
    ).length;
    this.closedTickets = this.reports.filter(r => 
      r.status === TicketStatus.CLOSED
    ).length;

    // Calculate average TAT for closed tickets
    const closedWithTAT = this.reports.filter(r => r.tat !== undefined && r.tat > 0);
    if (closedWithTAT.length > 0) {
      const totalTAT = closedWithTAT.reduce((sum, r) => sum + (r.tat || 0), 0);
      this.averageTAT = Math.round((totalTAT / closedWithTAT.length) * 100) / 100;
    } else {
      this.averageTAT = 0;
    }
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  onFilterChange(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.filter = {};
    this.loadReports();
  }

  exportToCSV(): void {
    this.exporting = true;

    try {
      // Prepare CSV content
      const headers = ['Employee Name', 'Issue', 'Details', 'Attachment', 'Status', 'Status Date', 'TAT (Hours)'];
      const rows = this.filteredReports.map(report => [
        this.escapeCsvValue(report.employeeName),
        this.escapeCsvValue(report.issue),
        this.escapeCsvValue(report.details),
        this.escapeCsvValue(report.attachment || 'N/A'),
        this.escapeCsvValue(report.status),
        this.formatDate(report.statusDate),
        report.tat !== undefined ? report.tat.toString() : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `IT_Issues_Report_${this.formatDateForFilename(new Date())}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.exporting = false;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export report. Please try again.');
      this.exporting = false;
    }
  }

  exportToPDF(): void {
    alert('PDF export functionality would be implemented here using a library like jsPDF or pdfmake');
  }

  printReport(): void {
    window.print();
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForFilename(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  viewAttachment(url?: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  formatTAT(tat?: number): string {
    if (tat === undefined) return 'N/A';
    if (tat < 1) return `${Math.round(tat * 60)} mins`;
    if (tat < 24) return `${tat.toFixed(1)} hrs`;
    const days = Math.floor(tat / 24);
    const hours = Math.round(tat % 24);
    return `${days}d ${hours}h`;
  }
}