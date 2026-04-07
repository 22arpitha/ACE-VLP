import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Ticket, TicketStatus } from 'src/app/models/ticket.models';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
  standalone:false
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  ticket: any;
  ticketId: any;
  loading = false;
  processing = false;
  showCloseConfirmation = false;
  showRejectModal = false;
  listOfRejections: any[] = [];
  rejectionReason = '';
  userId:any;
  private destroy$ = new Subject<void>();
  // Current user info (should come from auth service)
  currentUserId = 'user123';
  currentUserRole = 'EMPLOYEE';

  // Permission flags
  canClose = false;
  canSendCloseRequest = false;
  canApproveReject = false;

  constructor(
    private apiService: ApiserviceService,
    public dialogRef: MatDialogRef<TicketDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data)
    this.userId = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
    this.ticketId = this.data?.item?.id;
    this.getTicketData(this.ticketId);
    this.ticketRejections(this.ticketId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ticketRejections(id: string): void {
    this.apiService.getData(`${environment.live_url}/${environment.it_ticket_rejections}/?ticket_id=${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((rejections: any) => {
        if (rejections && rejections.results && rejections.results.length > 0) {
          this.listOfRejections = rejections.results;
        }
      });
  }
  getTicketData(id: string): void {
    this.loading = true;
    this.apiService.getData(`${environment.live_url}/${environment.it_ticket}/${id}/`)
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

  downloadAttachment(): void {
    if (this.ticket?.attachmentUrl) {
      window.open(this.ticket.attachmentUrl, '_blank');
    }
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

  rejectCloseRequest() {
    let data:any= {
    "employee_id": this.userId,
    "status": 1,
    "rejection_comment": this.rejectionReason,
    'issue': this.data?.item?.issue,
  }
    this.apiService.updateData(`${environment.live_url}/${environment.it_ticket}/${this.ticketId}/`, data).subscribe((resp: any) => {
      this.apiService.showSuccess(resp?.message);
      this.dialogRef.close({ data: 'refresh' });
    },
      (error) => {
        this.apiService.showError(error?.error?.detail);
      }
    )
  }


}