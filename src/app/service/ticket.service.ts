import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, take } from 'rxjs/operators';
import { Ticket, TicketStatus, TicketFilter, TicketReport, Employee } from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = '/api/tickets'; // Replace with your actual API URL
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTickets();
  }

  // Load all tickets
  // loadTickets(): void {
  //   this.http.get<Ticket[]>(this.apiUrl).pipe(
  //     catchError(error => {
  //       console.error('Error loading tickets:', error);
  //       return of([]);
  //     })
  //   ).subscribe(tickets => {
  //     this.ticketsSubject.next(tickets);
  //   });
  // }


  loadTickets(): void {

  const dummyTickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-AB12C-001',
      employeeId: 'user123',
      employeeName: 'John Doe',
      issue: 'Laptop not connecting to WiFi network',
      details: 'My office laptop is not connecting to the WiFi since morning. It shows authentication error.',
      attachment: null,
      status: TicketStatus.OPEN,
      ticketRaisedDate: new Date('2026-02-10T09:15:00'),
      statusDate: new Date('2026-02-10T09:15:00')
    },
    {
      id: '2',
      ticketNumber: 'TKT-XY98K-002',
      employeeId: 'user123',
      employeeName: 'Sarah Smith',
      issue: 'Email not syncing on mobile device',
      details: 'Outlook email is not syncing on my iPhone. It shows server timeout error.',
      attachment: null,
      status: TicketStatus.CLOSE_REQUEST_SENT,
      ticketRaisedDate: new Date('2026-02-09T14:20:00'),
      statusDate: new Date('2026-02-11T11:00:00')
    },
    {
      id: '3',
      ticketNumber: 'TKT-ZT56L-003',
      employeeId: 'user123',
      employeeName: 'John Doe',
      issue: 'System running very slow',
      details: 'My desktop is extremely slow while opening applications and browser tabs.',
      attachment: null,
      status: TicketStatus.REOPEN,
      ticketRaisedDate: new Date('2026-02-05T10:30:00'),
      statusDate: new Date('2026-02-11T16:45:00')
    },
    {
      id: '4',
      ticketNumber: 'TKT-QW45E-004',
      employeeId: 'user123',
      employeeName: 'Michael Johnson',
      issue: 'Printer not responding',
      details: 'Office printer is not printing documents. It shows paper jam but there is no jam.',
      attachment: null,
      status: TicketStatus.OPEN,
      ticketRaisedDate: new Date('2026-02-01T08:00:00'),
      statusDate: new Date('2026-02-03T15:30:00')
    },
    {
      id: '5',
      ticketNumber: 'TKT-MN22P-005',
      employeeId: 'user123',
      employeeName: 'Emily Brown',
      issue: 'VPN access issue',
      details: 'Unable to connect to company VPN while working from home.',
      attachment: null,
      status: TicketStatus.OPEN,
      ticketRaisedDate: new Date('2026-02-12T07:45:00'),
      statusDate: new Date('2026-02-12T07:45:00')
    },
     {
      id: '6',
      ticketNumber: 'TKT-MN22P-005',
      employeeId: 'user123',
      employeeName: 'Emily Brown',
      issue: 'VPN access issue',
      details: 'Unable to connect to company VPN while working from home.',
      attachment: null,
      status: TicketStatus.OPEN,
      ticketRaisedDate: new Date('2026-02-12T07:45:00'),
      statusDate: new Date('2026-02-12T07:45:00')
    }
  ];

  this.ticketsSubject.next(dummyTickets);
}


  // Get tickets for current user based on role
  getTicketsForUser(userId: string, userRole: string): Observable<Ticket[]> {
    return this.tickets$.pipe(
      map(tickets => {
        if (userRole === 'ADMIN' || userRole === 'DIRECTOR' || userRole === 'TECHNICAL_SUPPORT') {
          return tickets;
        }
        // Regular employees see their own tickets
        return tickets.filter(t => t.employeeId === userId);
      })
    );
  }

  // Get ticket by ID
  // getTicketById(id: string): Observable<Ticket | undefined> {
  //   return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
  //     catchError(error => {
  //       console.error('Error loading ticket:', error);
  //       return of(undefined);
  //     })
  //   );
  // }


  getTicketById(id: string): Observable<Ticket | undefined> {
  return this.ticketsSubject.asObservable().pipe(
    take(1),
    map((tickets: Ticket[]) => {
      return tickets.find(ticket => ticket.id === id);
    }),
    catchError(error => {
      console.error('Error loading ticket:', error);
      return of(undefined);
    })
  );
}


  // Generate ticket number (alpha-numeric)
  private generateTicketNumber(): string {
    const prefix = 'TKT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Raise new ticket
  raiseTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    const newTicket: Ticket = {
      id: this.generateId(),
      ticketNumber: this.generateTicketNumber(),
      employeeId: ticket.employeeId!,
      employeeName: ticket.employeeName!,
      issue: ticket.issue!,
      details: ticket.details!,
      attachment: ticket.attachment,
      status: TicketStatus.OPEN,
      ticketRaisedDate: new Date(),
      statusDate: new Date()
    };

    return this.http.post<Ticket>(this.apiUrl, newTicket).pipe(
      tap(createdTicket => {
        const currentTickets = this.ticketsSubject.value;
        this.ticketsSubject.next([createdTicket, ...currentTickets]);
        // Send notification to technical support team
        this.notifyTechnicalSupport(createdTicket);
      }),
      catchError(error => {
        console.error('Error creating ticket:', error);
        throw error;
      })
    );
  }

  // Update ticket
  updateTicket(id: string, updates: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updatedTicket => {
        const currentTickets = this.ticketsSubject.value;
        const index = currentTickets.findIndex(t => t.id === id);
        if (index !== -1) {
          currentTickets[index] = updatedTicket;
          this.ticketsSubject.next([...currentTickets]);
        }
      }),
      catchError(error => {
        console.error('Error updating ticket:', error);
        throw error;
      })
    );
  }

  // Send close request
  sendCloseRequest(ticketId: string, techSupportUserId: string): Observable<Ticket> {
    return this.updateTicket(ticketId, {
      status: TicketStatus.CLOSE_REQUEST_SENT,
      closeRequestSentBy: techSupportUserId,
      statusDate: new Date()
    }).pipe(
      tap(ticket => {
        // Send email notification to employee
        this.sendEmailNotification(ticket.employeeId, ticket, 'close_request');
      })
    );
  }

  // Approve close request (by employee)
  approveCloseRequest(ticketId: string): Observable<Ticket> {
    return this.updateTicket(ticketId, {
      status: TicketStatus.CLOSED,
      statusDate: new Date()
    });
  }

  // Reject close request and reopen (by employee)
  rejectCloseRequest(ticketId: string, reason: string): Observable<Ticket> {
    return this.updateTicket(ticketId, {
      status: TicketStatus.REOPEN,
      statusDate: new Date(),
      rejectionReason: reason
    });
  }

  // Close ticket directly (by employee or admin)
  closeTicket(ticketId: string): Observable<Ticket> {
    return this.updateTicket(ticketId, {
      status: TicketStatus.CLOSED,
      statusDate: new Date()
    });
  }

  // Get filtered and sorted tickets
  // getFilteredTickets(filter: TicketFilter, sortColumn?: string, sortDirection?: 'asc' | 'desc'): Observable<Ticket[]> {
  //   return this.tickets$.pipe(
  //     map(tickets => {
  //       let filtered = [...tickets];

  //       // Apply filters
  //       if (filter.ticketRaisedDateFrom) {
  //         filtered = filtered.filter(t => 
  //           new Date(t.ticketRaisedDate) >= filter.ticketRaisedDateFrom!
  //         );
  //       }
  //       if (filter.ticketRaisedDateTo) {
  //         filtered = filtered.filter(t => 
  //           new Date(t.ticketRaisedDate) <= filter.ticketRaisedDateTo!
  //         );
  //       }
  //       if (filter.issue) {
  //         filtered = filtered.filter(t => 
  //           t.issue.toLowerCase().includes(filter.issue!.toLowerCase())
  //         );
  //       }
  //       if (filter.status) {
  //         filtered = filtered.filter(t => t.status === filter.status);
  //       }
  //       if (filter.statusDateFrom) {
  //         filtered = filtered.filter(t => 
  //           new Date(t.statusDate) >= filter.statusDateFrom!
  //         );
  //       }
  //       if (filter.statusDateTo) {
  //         filtered = filtered.filter(t => 
  //           new Date(t.statusDate) <= filter.statusDateTo!
  //         );
  //       }

  //       // Apply sorting
  //       if (sortColumn && sortDirection) {
  //         filtered.sort((a, b) => {
  //           let aVal: any = a[sortColumn as keyof Ticket];
  //           let bVal: any = b[sortColumn as keyof Ticket];

  //           if (aVal instanceof Date) aVal = aVal.getTime();
  //           if (bVal instanceof Date) bVal = bVal.getTime();

  //           if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
  //           if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
  //           return 0;
  //         });
  //       }

  //       return filtered;
  //     })
  //   );
  // }


  getFilteredTickets(
  filter: TicketFilter,
  sortColumn?: string,
  sortDirection?: 'asc' | 'desc'
): Observable<Ticket[]> {

  return this.tickets$.pipe(
    map((tickets: Ticket[]) => {

      let filtered = [...tickets];

      // 🔹 Issue Filter
      if (filter.issue && filter.issue.trim() !== '') {
        filtered = filtered.filter(t =>
          t.issue.toLowerCase().includes(filter.issue!.toLowerCase())
        );
      }

      // 🔹 Ticket Raised Date From
      if (filter.ticketRaisedDateFrom) {
        filtered = filtered.filter(t =>
          new Date(t.ticketRaisedDate) >= new Date(filter.ticketRaisedDateFrom!)
        );
      }

      // 🔹 Ticket Raised Date To
      if (filter.ticketRaisedDateTo) {
        filtered = filtered.filter(t =>
          new Date(t.ticketRaisedDate) <= new Date(filter.ticketRaisedDateTo!)
        );
      }

      // 🔹 Status Multi Select Filter
      if (filter.status && filter.status.length > 0) {
        filtered = filtered.filter(t =>
          filter.status!.includes(t.status)
        );
      }

      // 🔹 Status Date From
      if (filter.statusDateFrom) {
        filtered = filtered.filter(t =>
          new Date(t.statusDate) >= new Date(filter.statusDateFrom!)
        );
      }

      // 🔹 Status Date To
      if (filter.statusDateTo) {
        filtered = filtered.filter(t =>
          new Date(t.statusDate) <= new Date(filter.statusDateTo!)
        );
      }

      // 🔹 Sorting
      if (sortColumn && sortDirection) {
        filtered.sort((a: any, b: any) => {

          let aVal = a[sortColumn];
          let bVal = b[sortColumn];

          // Handle dates
          if (aVal instanceof Date) aVal = aVal.getTime();
          if (bVal instanceof Date) bVal = bVal.getTime();

          // Handle strings
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();

          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;

          return 0;
        });
      }

      return filtered;
    })
  );
}




updateTicketStatus(id: string, status: TicketStatus): void {
  const tickets = this.ticketsSubject.value;

  const index = tickets.findIndex(t => t.id === id);

  if (index !== -1) {
    tickets[index].status = status;
    tickets[index].statusDate = new Date();
  }

  this.ticketsSubject.next([...tickets]);
}

  // Generate IT Issues Report
  generateReport(filter: TicketFilter): Observable<TicketReport[]> {
    return this.getFilteredTickets(filter).pipe(
      map(tickets => tickets.map(ticket => ({
        employeeName: ticket.employeeName,
        issue: ticket.issue,
        details: ticket.details,
        attachment: ticket.attachmentUrl,
        status: ticket.status,
        statusDate: ticket.statusDate,
        tat: this.calculateTAT(ticket)
      })))
    );
  }

  // Calculate TAT (Turnaround Time) in hours
  private calculateTAT(ticket: Ticket): number | undefined {
    if (ticket.status !== TicketStatus.CLOSED) {
      return undefined;
    }
    const raisedDate = new Date(ticket.ticketRaisedDate).getTime();
    const closedDate = new Date(ticket.statusDate).getTime();
    const diffMs = closedDate - raisedDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }

  // Get open tickets
  getOpenTickets(): Observable<Ticket[]> {
    return this.tickets$.pipe(
      map(tickets => tickets.filter(t => t.status === TicketStatus.OPEN || t.status === TicketStatus.REOPEN)
        .sort((a, b) => new Date(a.ticketRaisedDate).getTime() - new Date(b.ticketRaisedDate).getTime())
      )
    );
  }

  // Upload attachment
  uploadAttachment(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{url: string}>(`${this.apiUrl}/upload`, formData).pipe(
      map(response => response.url),
      catchError(error => {
        console.error('Error uploading file:', error);
        throw error;
      })
    );
  }

  // Send email notification
  private sendEmailNotification(userId: string, ticket: Ticket, type: string): void {
    const emailData = {
      userId,
      ticketNumber: ticket.ticketNumber,
      type,
      ticket
    };

    this.http.post(`${this.apiUrl}/notify`, emailData).pipe(
      catchError(error => {
        console.error('Error sending notification:', error);
        return of(null);
      })
    ).subscribe();
  }

  // Notify technical support team
  private notifyTechnicalSupport(ticket: Ticket): void {
    this.http.post(`${this.apiUrl}/notify-tech-support`, ticket).pipe(
      catchError(error => {
        console.error('Error notifying tech support:', error);
        return of(null);
      })
    ).subscribe();
  }

  // Send daily open tickets report
  sendDailyReport(): Observable<any> {
    return this.http.post(`${this.apiUrl}/daily-report`, {});
  }

  // Helper method to generate ID
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Check user permission
  canCloseTicket(ticket: Ticket, userId: string, userRole: string): boolean {
    return (
      ticket.employeeId === userId || 
      userRole === 'ADMIN' || 
      userRole === 'DIRECTOR' ||
      userRole === 'TECHNICAL_SUPPORT'
    );
  }

  canViewTicket(ticket: Ticket, userId: string, userRole: string, reportingManagerId?: string): boolean {
    return (
      ticket.employeeId === userId ||
      userId === reportingManagerId ||
      userRole === 'ADMIN' ||
      userRole === 'DIRECTOR' ||
      userRole === 'TECHNICAL_SUPPORT'
    );
  }



  
}