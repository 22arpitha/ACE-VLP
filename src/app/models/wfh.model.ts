export enum WFHCategory {
  LIMITED_FLEXIBILITY = 'LIMITED_FLEXIBILITY',
  PROLONGED_HEALTH_ISSUES = 'PROLONGED_HEALTH_ISSUES',
}

export enum WFHStatus {
  DRAFT = 'DRAFT',
  PENDING_MANAGER = 'PENDING_MANAGER',
  PENDING_DIRECTOR = 'PENDING_DIRECTOR',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  EXPIRED = 'EXPIRED',
  RESET = 'RESET',
}

export interface WFHApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  directorId?: string;
  directorName?: string;
  category: WFHCategory;
  fromDate: Date;
  toDate: Date;
  numberOfDays: number;
  weekDays: WeekDay[];
  reason: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: WFHStatus;
  appliedDate: Date;
  managerApprovalDate?: Date;
  managerComments?: string;
  directorApprovalDate?: Date;
  directorComments?: string;
  rejectionReason?: string;
  quarter: string; // e.g., 'Q1-2026'
  year: number;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
}

export interface WFHBalance {
  employeeId: string;
  employeeName: string;
  category: WFHCategory;
  quarter: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  expiredDays: number;
  lastUpdated: Date;
}

export interface WFHTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  category: WFHCategory;
  transactionType: TransactionType;
  days: number;
  balanceAfter: number;
  applicationId?: string;
  transactionDate: Date;
  quarter: string;
  year: number;
  description: string;
}

export interface WFHSummaryReport {
  employeeId: string;
  employeeName: string;
  department: string;
  limitedFlexibility: {
    currentQuarter: string;
    totalAllowed: number;
    used: number;
    pending: number;
    available: number;
    expired: number;
  };
  prolongedHealthIssues: {
    currentYear: number;
    totalUsed: number;
    pending: number;
    balance: number;
  };
  generatedDate: Date;
}

export interface WFHTransactionReport {
  employeeId: string;
  employeeName: string;
  category: WFHCategory;
  transactions: WFHTransaction[];
  openingBalance: number;
  closingBalance: number;
  period: {
    from: Date;
    to: Date;
  };
  generatedDate: Date;
}

export interface Holiday {
  id: string;
  date: Date;
  name: string;
  isNational: boolean;
  isOptional: boolean;
}

export interface QuarterInfo {
  quarter: string;
  year: number;
  startDate: Date;
  endDate: Date;
  isCurrentQuarter: boolean;
}

export interface ApprovalAction {
  applicationId: string;
  action: 'APPROVE' | 'REJECT';
  comments: string;
  approverId: string;
  approverName: string;
  approverRole: 'MANAGER' | 'DIRECTOR';
  actionDate: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  managerId: string;
  managerName: string;
  directorId: string;
  directorName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR' | 'ADMIN';
  joinDate: Date;
  isActive: boolean;
}

export interface WFHDashboardData {
  employee: Employee;
  currentBalance: {
    limitedFlexibility: WFHBalance;
    prolongedHealthIssues: WFHBalance;
  };
  recentApplications: WFHApplication[];
  pendingApprovals: WFHApplication[];
  upcomingWFHDays: WFHApplication[];
  quarterlyUsage: {
    quarter: string;
    used: number;
    total: number;
  }[];
}

export interface WFHStatistics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  totalWFHDays: number;
  categoryWiseBreakdown: {
    limitedFlexibility: number;
    prolongedHealthIssues: number;
  };
  monthlyTrend: {
    month: string;
    applications: number;
    days: number;
  }[];
}
