import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import {
  WFHApplication,
  WFHBalance,
  WFHCategory,
  WFHStatus,
  WFHTransaction,
  TransactionType,
  ApprovalAction,
  QuarterInfo,
  WFHDashboardData,
  WFHStatistics,
  Employee,
  WeekDay
} from '../models/wfh.model';
import { WfhHolidaysService } from './wfh-holidays.service';


@Injectable({
  providedIn: 'root'
})
export class WorkFromHomeService {

 private applications$ = new BehaviorSubject<WFHApplication[]>([]);
  private balances$ = new BehaviorSubject<WFHBalance[]>([]);
  private transactions$ = new BehaviorSubject<WFHTransaction[]>([]);
  
  private mockApplications: WFHApplication[] = [];
  private mockBalances: WFHBalance[] = [];
  private mockTransactions: WFHTransaction[] = [];

  constructor(private holidayService: WfhHolidaysService) {
    this.initializeMockData();
  }

  // ==================== Application Methods ====================

  getApplications(employeeId: string): Observable<WFHApplication[]> {
    return of(this.mockApplications.filter(app => app.employeeId === employeeId))
      .pipe(delay(300));
  }

  getApplicationById(id: string): Observable<WFHApplication> {
    const application = this.mockApplications.find(app => app.id === id);
    if (!application) {
      return throwError(() => new Error('Application not found'));
    }
    return of(application).pipe(delay(200));
  }

  getPendingApprovals(approverId: string, role: 'MANAGER' | 'DIRECTOR'): Observable<WFHApplication[]> {
    let filtered: WFHApplication[];
    
    if (role === 'MANAGER') {
      filtered = this.mockApplications.filter(app => 
        app.managerId === approverId && 
        app.status === WFHStatus.PENDING_MANAGER
      );
    } else {
      filtered = this.mockApplications.filter(app => 
        app.directorId === approverId && 
        app.status === WFHStatus.PENDING_DIRECTOR
      );
    }
    
    return of(filtered).pipe(delay(300));
  }

  submitApplication(application: Partial<WFHApplication>): Observable<WFHApplication> {
    const currentQuarter = this.getCurrentQuarter();
    
    // Validate balance before submission
    if (application.category === WFHCategory.LIMITED_FLEXIBILITY) {
      const balance = this.getBalanceSync(
        application.employeeId!,
        WFHCategory.LIMITED_FLEXIBILITY,
        currentQuarter.quarter,
        currentQuarter.year
      );
      
      if (balance && application.numberOfDays! > balance.availableDays) {
        return throwError(() => new Error(
          `Insufficient WFH balance. Available: ${balance.availableDays} days, Requested: ${application.numberOfDays} days`
        ));
      }
    }

    const newApplication: WFHApplication = {
      id: this.generateId(),
      employeeId: application.employeeId!,
      employeeName: application.employeeName!,
      managerId: application.managerId!,
      managerName: application.managerName!,
      directorId: application.directorId,
      directorName: application.directorName,
      category: application.category!,
      fromDate: application.fromDate!,
      toDate: application.toDate!,
      numberOfDays: application.numberOfDays!,
      weekDays: application.weekDays!,
      reason: application.reason!,
      attachmentUrl: application.attachmentUrl,
      attachmentName: application.attachmentName,
      status: WFHStatus.PENDING_MANAGER,
      appliedDate: new Date(),
      quarter: currentQuarter.quarter,
      year: currentQuarter.year
    };

    this.mockApplications.push(newApplication);
    this.applications$.next(this.mockApplications);

    // Create pending transaction
    this.createTransaction({
      employeeId: newApplication.employeeId,
      employeeName: newApplication.employeeName,
      category: newApplication.category,
      transactionType: TransactionType.DEBIT,
      days: newApplication.numberOfDays,
      applicationId: newApplication.id,
      description: `WFH Application - Pending Approval`,
      quarter: currentQuarter.quarter,
      year: currentQuarter.year
    });

    return of(newApplication).pipe(delay(500));
  }

  approveApplication(action: ApprovalAction): Observable<WFHApplication> {
    const application = this.mockApplications.find(app => app.id === action.applicationId);
    
    if (!application) {
      return throwError(() => new Error('Application not found'));
    }

    if (action.action === 'APPROVE') {
      if (action.approverRole === 'MANAGER') {
        application.status = application.category === WFHCategory.LIMITED_FLEXIBILITY 
          ? WFHStatus.APPROVED 
          : WFHStatus.PENDING_DIRECTOR;
        application.managerApprovalDate = action.actionDate;
        application.managerComments = action.comments;

        // Update transaction if fully approved
        if (application.status === WFHStatus.APPROVED) {
          this.updateTransactionOnApproval(application);
        }
      } else {
        application.status = WFHStatus.APPROVED;
        application.directorApprovalDate = action.actionDate;
        application.directorComments = action.comments;
        this.updateTransactionOnApproval(application);
      }
    } else {
      application.status = WFHStatus.REJECTED;
      application.rejectionReason = action.comments;
      
      if (action.approverRole === 'MANAGER') {
        application.managerApprovalDate = action.actionDate;
        application.managerComments = action.comments;
      } else {
        application.directorApprovalDate = action.actionDate;
        application.directorComments = action.comments;
      }

      // Remove pending transaction
      this.removeTransaction(application.id);
    }

    this.applications$.next(this.mockApplications);
    return of(application).pipe(delay(500));
  }

  // ==================== Balance Methods ====================

  getBalance(
    employeeId: string,
    category: WFHCategory,
    quarter: string,
    year: number
  ): Observable<WFHBalance> {
    const balance = this.getBalanceSync(employeeId, category, quarter, year);
    return of(balance).pipe(delay(200));
  }

  getAllBalances(employeeId: string): Observable<WFHBalance[]> {
    const balances = this.mockBalances.filter(b => b.employeeId === employeeId);
    return of(balances).pipe(delay(200));
  }

  // ==================== Transaction Methods ====================

  getTransactions(
    employeeId: string,
    category: WFHCategory,
    fromDate?: Date,
    toDate?: Date
  ): Observable<WFHTransaction[]> {
    let filtered = this.mockTransactions.filter(
      t => t.employeeId === employeeId && t.category === category
    );

    if (fromDate && toDate) {
      filtered = filtered.filter(t => 
        t.transactionDate >= fromDate && t.transactionDate <= toDate
      );
    }

    return of(filtered.sort((a, b) => 
      b.transactionDate.getTime() - a.transactionDate.getTime()
    )).pipe(delay(200));
  }

  // ==================== Dashboard Methods ====================

  getDashboardData(employeeId: string): Observable<WFHDashboardData> {
    const currentQuarter = this.getCurrentQuarter();
    const employee = this.getMockEmployee(employeeId);

    const limitedFlexBalance = this.getBalanceSync(
      employeeId,
      WFHCategory.LIMITED_FLEXIBILITY,
      currentQuarter.quarter,
      currentQuarter.year
    );

    const healthBalance = this.getBalanceSync(
      employeeId,
      WFHCategory.PROLONGED_HEALTH_ISSUES,
      currentQuarter.quarter,
      currentQuarter.year
    );

    const recentApplications = this.mockApplications
      .filter(app => app.employeeId === employeeId)
      .sort((a, b) => b.appliedDate.getTime() - a.appliedDate.getTime())
      .slice(0, 5);

    const upcomingWFHDays = this.mockApplications
      .filter(app => 
        app.employeeId === employeeId &&
        app.status === WFHStatus.APPROVED &&
        app.fromDate >= new Date()
      )
      .sort((a, b) => a.fromDate.getTime() - b.fromDate.getTime());

    const dashboardData: WFHDashboardData = {
      employee,
      currentBalance: {
        limitedFlexibility: limitedFlexBalance,
        prolongedHealthIssues: healthBalance
      },
      recentApplications,
      pendingApprovals: [],
      upcomingWFHDays,
      quarterlyUsage: this.getQuarterlyUsage(employeeId)
    };

    return of(dashboardData).pipe(delay(300));
  }

  // ==================== Utility Methods ====================

  calculateWorkingDays(fromDate: Date, toDate: Date): Observable<WeekDay[]> {
    const weekDays: WeekDay[] = [];
    const holidays = this.holidayService.getHolidaysSync();
    
    const current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const holiday = holidays.find(h => 
        this.isSameDate(h.date, current) && !h.isOptional
      );

      weekDays.push({
        date: new Date(current),
        dayName: this.getDayName(dayOfWeek),
        isWeekend,
        isHoliday: !!holiday,
        holidayName: holiday?.name
      });

      current.setDate(current.getDate() + 1);
    }

    return of(weekDays).pipe(delay(100));
  }

  getWorkingDaysCount(weekDays: WeekDay[]): number {
    return weekDays.filter(day => !day.isWeekend && !day.isHoliday).length;
  }

  getCurrentQuarter(): QuarterInfo {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let quarter: string;
    let startDate: Date;
    let endDate: Date;

    if (month < 3) {
      quarter = 'Q1';
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 2, 31);
    } else if (month < 6) {
      quarter = 'Q2';
      startDate = new Date(year, 3, 1);
      endDate = new Date(year, 5, 30);
    } else if (month < 9) {
      quarter = 'Q3';
      startDate = new Date(year, 6, 1);
      endDate = new Date(year, 8, 30);
    } else {
      quarter = 'Q4';
      startDate = new Date(year, 9, 1);
      endDate = new Date(year, 11, 31);
    }

    return {
      quarter,
      year,
      startDate,
      endDate,
      isCurrentQuarter: true
    };
  }

  // ==================== Private Helper Methods ====================

  private getBalanceSync(
    employeeId: string,
    category: WFHCategory,
    quarter: string,
    year: number
  ): WFHBalance {
    let balance = this.mockBalances.find(
      b => b.employeeId === employeeId &&
           b.category === category &&
           b.quarter === quarter &&
           b.year === year
    );

    if (!balance) {
      balance = this.initializeBalance(employeeId, category, quarter, year);
      this.mockBalances.push(balance);
    }

    return balance;
  }

  private initializeBalance(
    employeeId: string,
    category: WFHCategory,
    quarter: string,
    year: number
  ): WFHBalance {
    const employee = this.getMockEmployee(employeeId);
    
    return {
      employeeId,
      employeeName: employee.name,
      category,
      quarter,
      year,
      totalDays: category === WFHCategory.LIMITED_FLEXIBILITY ? 5 : 0,
      usedDays: 0,
      pendingDays: 0,
      availableDays: category === WFHCategory.LIMITED_FLEXIBILITY ? 5 : 0,
      expiredDays: 0,
      lastUpdated: new Date()
    };
  }

  private createTransaction(data: Partial<WFHTransaction>): void {
    const balance = this.getBalanceSync(
      data.employeeId!,
      data.category!,
      data.quarter!,
      data.year!
    );

    const transaction: WFHTransaction = {
      id: this.generateId(),
      employeeId: data.employeeId!,
      employeeName: data.employeeName!,
      category: data.category!,
      transactionType: data.transactionType!,
      days: data.days!,
      balanceAfter: balance.availableDays - (data.transactionType === TransactionType.DEBIT ? data.days! : -data.days!),
      applicationId: data.applicationId,
      transactionDate: new Date(),
      quarter: data.quarter!,
      year: data.year!,
      description: data.description!
    };

    this.mockTransactions.push(transaction);
    
    // Update balance
    if (data.transactionType === TransactionType.DEBIT) {
      balance.pendingDays += data.days!;
      balance.availableDays -= data.days!;
    }
    
    balance.lastUpdated = new Date();
  }

  private updateTransactionOnApproval(application: WFHApplication): void {
    const transaction = this.mockTransactions.find(
      t => t.applicationId === application.id && t.transactionType === TransactionType.DEBIT
    );

    if (transaction) {
      const balance = this.getBalanceSync(
        application.employeeId,
        application.category,
        application.quarter,
        application.year
      );

      balance.pendingDays -= application.numberOfDays;
      balance.usedDays += application.numberOfDays;
      
      if (application.category === WFHCategory.PROLONGED_HEALTH_ISSUES) {
        balance.availableDays -= application.numberOfDays;
      }
      
      balance.lastUpdated = new Date();
      transaction.description = `WFH Application - Approved`;
    }
  }

  private removeTransaction(applicationId: string): void {
    const index = this.mockTransactions.findIndex(
      t => t.applicationId === applicationId
    );

    if (index !== -1) {
      const transaction = this.mockTransactions[index];
      const balance = this.getBalanceSync(
        transaction.employeeId,
        transaction.category,
        transaction.quarter,
        transaction.year
      );

      balance.pendingDays -= transaction.days;
      balance.availableDays += transaction.days;
      balance.lastUpdated = new Date();

      this.mockTransactions.splice(index, 1);
    }
  }

  private getQuarterlyUsage(employeeId: string): any[] {
    const currentYear = new Date().getFullYear();
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    return quarters.map(q => {
      const balance = this.getBalanceSync(
        employeeId,
        WFHCategory.LIMITED_FLEXIBILITY,
        q,
        currentYear
      );
      
      return {
        quarter: q,
        used: balance.usedDays,
        total: balance.totalDays
      };
    });
  }

  private getMockEmployee(employeeId: string): Employee {
    return {
      id: employeeId,
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      managerId: 'MGR001',
      managerName: 'Jane Smith',
      directorId: 'DIR001',
      directorName: 'Robert Johnson',
      role: 'EMPLOYEE',
      joinDate: new Date('2020-01-15'),
      isActive: true
    };
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private generateId(): string {
    return 'WFH-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private initializeMockData(): void {
    // Initialize with some sample data if needed
    const currentQuarter = this.getCurrentQuarter();
    const employeeId = 'EMP001';
    
    // Initialize balance
    this.getBalanceSync(
      employeeId,
      WFHCategory.LIMITED_FLEXIBILITY,
      currentQuarter.quarter,
      currentQuarter.year
    );
  }
}
