export interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  reportingManagerId?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  employeeId: string;
  employeeName: string;
  issue: string;
  details: string;
  attachment?: File | string;
  attachmentUrl?: string;
  status: TicketStatus;
  ticketRaisedDate: Date;
  statusDate: Date;
  closeRequestSentBy?: string;
  rejectionReason?: string;
}

export enum TicketStatus {
  OPEN = 'Open',
  CLOSE_REQUEST_SENT = 'Close Request sent',
  REOPEN = 'Re-Open',
  CLOSED = 'Closed'
}

export interface TicketListItem {
  ticketNumber: string;
  ticketRaisedDate: Date;
  issue: string;
  status: TicketStatus;
  statusDate: Date;
}

export interface TicketReport {
  employeeName: string;
  issue: string;
  details: string;
  attachment?: string;
  status: TicketStatus;
  statusDate: Date;
  tat?: number; // in hours
}

export interface TicketFilter {
  ticketRaisedDateFrom?: Date;
  ticketRaisedDateTo?: Date;
  issue?: string;
  status?: TicketStatus;
  statusDateFrom?: Date;
  statusDateTo?: Date;
}