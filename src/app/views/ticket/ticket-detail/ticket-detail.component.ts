import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ticket, TicketStatus } from '../../../models/ticket.models';
import { CommonServiceService } from '../../../service/common-service.service';
import { TicketService } from '../../../service/ticket.service';



@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
  standalone:false
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket?: Ticket;
  loading = false;
  processing = false;
  showCloseConfirmation = false;
  showRejectModal = false;
  rejectionReason = '';
  private destroy$ = new Subject<void>();
BreadCrumbsTitle: any = 'Ticket Details';
  // Current user info (should come from auth service)
  currentUserId = 'user123';
  currentUserRole = 'EMPLOYEE';

  // Permission flags
  canClose = false;
  canSendCloseRequest = false;
  canApproveReject = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private commonService:CommonServiceService
  ) {
    this.commonService.setTitle(this.BreadCrumbsTitle)
  }

  ngOnInit(): void {
      this.ticketService.loadTickets();
    const ticketId = this.route.snapshot.params['id'];
    this.loadTicket(ticketId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete(); 
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.ticketService.getTicketById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ticket => {
        this.ticket = ticket;
        this.loading = false;
        if (ticket) {
          this.updatePermissions();
        }
      });
  }

  updatePermissions(): void {
    if (!this.ticket) return;

    const isOwner = this.ticket.employeeId === this.currentUserId;
    const isAdmin = this.currentUserRole === 'ADMIN' || this.currentUserRole === 'DIRECTOR';
    const isTechSupport = this.currentUserRole === 'TECHNICAL_SUPPORT';

    // Can close directly: Owner or Admin
    this.canClose = (isOwner || isAdmin) && 
                    (this.ticket.status === TicketStatus.OPEN || this.ticket.status === TicketStatus.REOPEN);

    // Can send close request: Tech Support
    this.canSendCloseRequest = isTechSupport && 
                                (this.ticket.status === TicketStatus.OPEN || this.ticket.status === TicketStatus.REOPEN);

    // Can approve/reject: Owner when close request is sent
    this.canApproveReject = isOwner && this.ticket.status === TicketStatus.CLOSE_REQUEST_SENT;
  }

  closeTicket(): void {
    if (!this.ticket || this.processing) return;

    this.processing = true;
    this.ticketService.closeTicket(this.ticket.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.processing = false;
          this.showCloseConfirmation = false;
          this.updatePermissions();
        },
        error: (error) => {
          console.error('Error closing ticket:', error);
          this.processing = false;
          alert('Failed to close ticket. Please try again.');
        }
      });
  }

  sendCloseRequest(): void {
    if (!this.ticket || this.processing) return;

    this.processing = true;
    this.ticketService.sendCloseRequest(this.ticket.id, this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.processing = false;
          this.updatePermissions();
          alert('Close request sent to employee successfully!');
        },
        error: (error) => {
          console.error('Error sending close request:', error);
          this.processing = false;
          alert('Failed to send close request. Please try again.');
        }
      });
  }

  approveCloseRequest(): void {
    if (!this.ticket || this.processing) return;

    this.processing = true;
    this.ticketService.approveCloseRequest(this.ticket.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.processing = false;
          this.updatePermissions();
        },
        error: (error) => {
          console.error('Error approving close request:', error);
          this.processing = false;
          alert('Failed to approve close request. Please try again.');
        }
      });
  }

  rejectCloseRequest(): void {
    if (!this.ticket || this.processing || !this.rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    this.processing = true;
    this.ticketService.rejectCloseRequest(this.ticket.id, this.rejectionReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTicket) => {
          this.ticket = updatedTicket;
          this.processing = false;
          this.showRejectModal = false;
          this.rejectionReason = '';
          this.updatePermissions();
        },
        error: (error) => {
          console.error('Error rejecting close request:', error);
          this.processing = false;
          alert('Failed to reject close request. Please try again.');
        }
      });
  }

  downloadAttachment(): void {
    if (this.ticket?.attachmentUrl) {
      window.open(this.ticket.attachmentUrl, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/it-support/tickets/']);
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openCloseConfirmation(): void {
    this.showCloseConfirmation = true;
  }

  cancelCloseConfirmation(): void {
    this.showCloseConfirmation = false;
  }

  openRejectModal(): void {
    this.showRejectModal = true;
    this.rejectionReason = '';
  }

  cancelRejectModal(): void {
    this.showRejectModal = false;
    this.rejectionReason = '';
  }
}