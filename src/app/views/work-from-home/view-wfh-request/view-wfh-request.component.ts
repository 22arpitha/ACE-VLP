import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { SubModuleService } from '../../../service/sub-module.service';

@Component({
  selector: 'app-view-wfh-request',
  templateUrl: './view-wfh-request.component.html',
  styleUrls: ['./view-wfh-request.component.scss'],
  standalone: false,
})
export class ViewWfhRequestComponent implements OnInit {
  leave_data: any;
  displayButton: boolean = true;
  userRole: any;
  user_id: any;
  access_name: any;
  accessPermissions: any = [];
  canCreateWfh = false;
  canViewWfh = false;
  canUpdateWfh = false;
  canDeleteWfh = false;

  constructor(
    private apiService: ApiserviceService,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<ViewWfhRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accessControlService: SubModuleService,
  ) {
    console.log(data);

    this.leave_data = data?.data || {};
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');

    // Safe JSON parse
    if (this.leave_data?.cc) {
      try {
        this.leave_data.cc =
          typeof this.leave_data.cc === 'string'
            ? JSON.parse(this.leave_data.cc)
            : this.leave_data.cc;
      } catch (error) {
        console.error('Invalid JSON in cc:', error);
        this.leave_data.cc = [];
      }
    } else {
      this.leave_data.cc = [];
    }

    this.displayButton = this.leave_data?.status === 'Pending';
  }

  get canApproveOrReject(): boolean {
    // Manager cannot approve/reject their own WFH requests
    const isManager = this.userRole === 'Manager';
    const hasPermission = this.canUpdateWfh;
    const employeeId =
      this.leave_data?.employee_id || this.leave_data?.employee;
    const isNotOwnRequest = String(this.user_id) !== String(employeeId);
    const result = isManager && hasPermission && isNotOwnRequest;
    console.log('canApproveOrReject:', result, {
      isManager,
      hasPermission,
      isNotOwnRequest,
      userRole: this.userRole,
      user_id: this.user_id,
      employee: this.leave_data?.employee,
      employee_id: this.leave_data?.employee_id,
    });
    return result;
  }

  isRejectClicked = false;
  reasonControl = new FormControl(
    { value: '', disabled: false },
    Validators.required,
  );

  ngOnInit(): void {
    this.getModuleAccess();
    this.getLeaveStatus();
  }

  getModuleAccess() {
    this.accessControlService
      .getAccessForActiveUrl(this.user_id)
      .subscribe((access: any) => {
        if (access?.length) {
          this.access_name = access[0];
          this.accessPermissions = access[0].operations || access[0];
          const ops = Array.isArray(this.accessPermissions)
            ? this.accessPermissions[0]
            : this.accessPermissions;

          this.canCreateWfh = !!ops?.create && this.userRole !== 'Admin';
          this.canViewWfh = !!ops?.view;
          this.canUpdateWfh = !!ops?.update;
          this.canDeleteWfh = !!ops?.delete;
        } else {
          console.log('No matching access found.');
        }
      });
  }
  approve(data: any) {
    this.reasonControl.clearValidators();
    this.reasonControl.updateValueAndValidity();
    console.log('data=>', data);
    let data_to_send = {
      status: 'Approved',
      approved_by: Number(sessionStorage.getItem('user_id')),
    };
    this.apiService
      .updateData(
        `${environment.live_url}/${environment.apply_wfh}/?id=${data.id}`,
        data_to_send,
      )
      .subscribe(
        (res: any) => {
          this.apiService.showSuccess(res?.message);
          this.dialogRef.close(res);
        },
        (error: any) => {
          console.log('error', error);
        },
      );
  }

  delete() {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.status.subscribe((resp: any) => {
      if (resp == 'ok') {
        this.apiService
          .delete(
            `${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`,
          )
          .subscribe(
            (res: any) => {
              console.log(res);
              this.apiService.showSuccess(res['message']);
              this.dialogRef.close();
            },
            (error: any) => {
              console.log('error', error);
            },
          );
        modelRef.close();
      } else {
        modelRef.close();
      }
    });
  }

  onRejectClick(data: any) {
    this.isRejectClicked = true;

    // Add required validator dynamically
    this.reasonControl.setValidators([Validators.required]);
    this.reasonControl.updateValueAndValidity();

    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }
    const data_to_send = {
      status: 'Rejected',
      rejected_by: Number(sessionStorage.getItem('user_id')),
      rejected_reason: this.reasonControl.value,
    };

    this.apiService
      .updateData(
        `${environment.live_url}/${environment.apply_wfh}/?id=${data.id}`,
        data_to_send,
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.message);
        this.dialogRef.close(res);
      });
  }

  rejectRequest(reason: string): void {
    const payload = {
      reason: reason,
      status: 'Rejected',
    };

    this.apiService.postData('your-endpoint/reject', payload).subscribe({
      next: (res: any) => {
        console.log('Reject successful', res);
      },
      error: (err: any) => {
        console.error('Reject failed', err);
      },
    });
  }

  openInNewTab(url: string): void {
    window.open(url, '_blank');
  }

  leaveStatuses: any;
  getLeaveStatus() {
    this.apiService
      .getData(`${environment.live_url}/${environment.leave_status}/`)
      .subscribe(
        (res: any) => {
          this.leaveStatuses = res.data;
          console.log(res);
        },
        (error: any) => {
          console.log(error);
        },
      );
  }
  // approveByDirector(data: any) {
  //   this.reasonControl.clearValidators();
  //   this.reasonControl.updateValueAndValidity();
  //   console.log('data=>', data);
  //   const approvedStatus =
  //     this.leaveStatuses?.find((status: any) => status.key === 'approved')
  //       ?.value || 'Approved';
  //   let data_to_send = {
  //     wfh_id: data?.id,
  //     is_confirmed: true,
  //     status: approvedStatus,
  //     approved_by: Number(sessionStorage.getItem('user_id')),
  //     rejected_by: null,
  //   };
  //   this.apiService
  //     .postData(
  //       `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
  //       data_to_send,
  //     )
  //     .subscribe(
  //       (res: any) => {
  //         this.apiService.showSuccess(res?.message);
  //         this.dialogRef.close(res);
  //       },
  //       (error: any) => {
  //         console.log('error', error);
  //       },
  //     );
  // }

  approveByDirector(data: any) {
    const isDirectFlow =
      String(this.leave_data?.reporting_to) === String(this.user_id) &&
      this.leave_data?.status === 'Pending';

    const approvedStatus =
      this.leaveStatuses?.find((status: any) => status.key === 'approved')
        ?.value || 'Approved';

    const payload = {
      wfh_id: data?.id,
      is_confirmed: true,
      status: approvedStatus,
      approved_by: Number(sessionStorage.getItem('user_id')),
      rejected_by: null,
      // ✅ mark directly approved if direct flow
      ...(isDirectFlow ? { final_approval: true } : {}),
    };

    this.apiService
      .postData(
        `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
        payload,
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.message);
        this.dialogRef.close(res);
      });
  }
  // rejectByDirector(data: any) {
  //   console.log(data);

  //   this.isRejectClicked = true;
  //   this.reasonControl.setValidators([Validators.required]);
  //   this.reasonControl.updateValueAndValidity();

  //   if (this.reasonControl.invalid) {
  //     this.reasonControl.markAsTouched();
  //     return;
  //   }

  //   const rejectedStatus =
  //     this.leaveStatuses?.find((status: any) => status.key === 'rejected')
  //       ?.value || 'Rejected';
  //   const data_to_send = {
  //     wfh_id: data?.id,
  //     is_confirmed: false,
  //     status: rejectedStatus,
  //     approved_by: null,
  //     rejected_by: Number(sessionStorage.getItem('user_id')),
  //     rejected_reason: this.reasonControl?.value,
  //   };

  //   this.apiService
  //     .postData(
  //       `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
  //       data_to_send,
  //     )
  //     .subscribe((res: any) => {
  //       this.apiService.showSuccess(res?.message);
  //       this.dialogRef.close(res);
  //     });
  // }

  // get isDirectorApprovalVisible(): boolean {
  //   return (
  //     this.userRole === 'Director' &&
  //     this.canUpdateWfh &&
  //     this.leave_data?.status === 'Approved' &&
  //     this.leave_data?.wfh_type_name === 'prolonged_health_issue' &&
  //     this.leave_data?.is_confirmed_by_director === false
  //   );
  // }

  // get isDirectorRejectedMessageVisible(): boolean {
  //   return (
  //     this.userRole === 'Director' &&
  //     this.leave_data?.status === 'Rejected' &&
  //     this.leave_data?.wfh_type_name === 'prolonged_health_issue' &&
  //     this.leave_data?.is_confirmed_by_director === false &&
  //     this.leave_data?.rejected_by !== 'null'
  //   );
  // }

  // ===================== FRONTEND ENHANCEMENTS =====================

  rejectByDirector(data: any) {
    console.log(data);

    this.isRejectClicked = true;
    this.reasonControl.setValidators([Validators.required]);
    this.reasonControl.updateValueAndValidity();

    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }

    // ✅ SAME direct flow check as approve
    const isDirectFlow =
      String(this.leave_data?.reporting_to) === String(this.user_id) &&
      this.leave_data?.status === 'Pending';

    const rejectedStatus =
      this.leaveStatuses?.find((status: any) => status.key === 'rejected')
        ?.value || 'Rejected';

    const payload = {
      wfh_id: data?.id,
      is_confirmed: false,
      status: rejectedStatus,
      approved_by: null,
      rejected_by: Number(sessionStorage.getItem('user_id')),
      rejected_reason: this.reasonControl?.value,

      // ✅ IMPORTANT: mark final rejection if direct flow
      ...(isDirectFlow ? { final_approval: true } : {}),
    };

    this.apiService
      .postData(
        `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
        payload,
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.message);
        this.dialogRef.close(res);
      });
  }
  /**
   * Get day of week name from date
   */
  getDayOfWeek(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return days[d.getDay()];
    } catch (e) {
      return '';
    }
  }

  /**
   * Get CSS class for status badge
   */
  getStatusBadgeClass(status: string): string {
    const normalizedStatus = status?.toLowerCase();
    return (
      {
        pending: 'badge bg-warning text-dark',
        approved: 'badge bg-success',
        rejected: 'badge bg-danger',
        draft: 'badge bg-secondary',
      }[normalizedStatus] || 'badge bg-secondary'
    );
  }

  /**
   * Check if employee can see rejection reason (employees should see it)
   */
  canSeeRejectionReason(): boolean {
    return (
      (this.leave_data?.rejected_reason || this.leave_data?.rejected_by) &&
      (this.leave_data?.status === 'Rejected' ||
        this.leave_data?.status === 'rejected')
    );
  }

  /**
   * Get display text for who rejected the request
   */
  getRejectedByLabel(): string {
    const rejectedBy = this.leave_data?.rejected_by;
    if (!rejectedBy || rejectedBy === 'null') {
      return 'Unknown';
    }

    const reportingToId = this.leave_data?.reporting_to;
    const reportingToName = this.leave_data?.reporting_to_name;

    if (reportingToId && String(rejectedBy) === String(reportingToId)) {
      return reportingToName || 'Manager';
    }

    return this.leave_data?.rejected_by_name || 'Director';
  }

  /**
   * Check if director rejection notice should be shown for director users
   */
  get isDirectorRejectedMessageVisible(): boolean {
    return (
      this.userRole === 'Director' &&
      this.leave_data?.status === 'Rejected' &&
      this.leave_data?.wfh_type_name === 'prolonged_health_issue' &&
      this.leave_data?.is_confirmed_by_director === false &&
      this.leave_data?.rejected_by &&
      this.leave_data?.rejected_by !== 'null' &&
      this.leave_data?.rejected_by !== this.leave_data?.reporting_to
    );
  }

  /**
   * Check if this is a Prolonged Health Issues request
   */
  isProlongedHealthIssue(): boolean {
    const wfhType = this.leave_data?.wfh_type_name?.toLowerCase();
    return (
      wfhType === 'prolonged_health_issue' ||
      wfhType === 'prolonged health issues'
    );
  }

  /**
   * Check if this is a Limited Flexibility request
   */
  isLimitedFlexibility(): boolean {
    const wfhType = this.leave_data?.wfh_type_name?.toLowerCase();
    return (
      wfhType === 'limited_flexibility' || wfhType === 'limited flexibility'
    );
  }

  /**
   * Get approval stage message for Prolonged Health Issues
   */
  // getApprovalStageMessage(): string {
  //   if (this.isProlongedHealthIssue()) {
  //     if (
  //       this.leave_data?.status === 'Pending' ||
  //       this.leave_data?.status === 'PENDING'
  //     ) {
  //       return 'Awaiting Manager Approval (Stage 1 of 2)';
  //     }
  //     if (
  //       this.leave_data?.status === 'Approved' ||
  //       this.leave_data?.status === 'approved'
  //     ) {
  //       if (this.leave_data?.is_confirmed_by_director === false) {
  //         return 'Awaiting Director Approval (Stage 2 of 2)';
  //       }
  //     }
  //   }
  //   return '';
  // }

  //   getApprovalStageMessage(): string {
  //   if (this.isProlongedHealthIssue()) {

  //     const status = this.leave_data?.status?.toLowerCase();

  //     // ✅ Detect direct reporting to Director
  //     const isDirectDirectorFlow =
  //       this.userRole === 'Director' &&
  //       String(this.leave_data?.reporting_to) === String(this.user_id);

  //     // 🔥 CASE 1: Direct flow (Manager → Director)
  //     if (isDirectDirectorFlow) {
  //       if (status === 'pending') {
  //         return 'Awaiting Director Approval (Single Stage)';
  //       }
  //     }

  //     // 🔥 CASE 2: Normal 2-stage flow (existing)
  //     if (status === 'pending') {
  //       return 'Awaiting Manager Approval (Stage 1 of 2)';
  //     }

  //     if (status === 'approved') {
  //       if (this.leave_data?.is_confirmed_by_director === false) {
  //         return 'Awaiting Director Approval (Stage 2 of 2)';
  //       }
  //     }
  //   }

  //   return '';
  // }

  /**
   * Extract filename from URL
   */
  getFileNameFromUrl(url: string): string {
    if (!url) return 'Download';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename || 'Download';
  }

  // isLimitedFlexibilityApprovalAllowed(): boolean {
  //   const isAdminOrDirector =
  //     this.userRole === 'Admin' || this.userRole === 'Director';

  //   const hasPermission = this.canUpdateWfh;

  //   const isLimitedFlex =
  //     this.leave_data?.wfh_type_name?.toLowerCase() === 'limited_flexibility' ||
  //     this.leave_data?.wfh_type_name?.toLowerCase() === 'limited flexibility';

  //   const isPending =
  //     this.leave_data?.status === 'Pending' ||
  //     this.leave_data?.status === 'PENDING';

  //   // 🔥 NEW CONDITION (IMPORTANT)
  //   const isReportingManager =
  //     String(this.leave_data?.reporting_to) === String(this.user_id);

  //   return (
  //     isAdminOrDirector &&
  //     hasPermission &&
  //     isLimitedFlex &&
  //     isPending &&
  //     isReportingManager
  //   );
  // }

  isLimitedFlexibilityApprovalAllowed(): boolean {
    const role = this.userRole?.toLowerCase();

    const isAdminOrDirector = role === 'admin' || role === 'director';

    const hasPermission = this.canUpdateWfh;

    const type = this.leave_data?.wfh_type_name?.toLowerCase();

    const isLimitedFlex =
      type === 'limited_flexibility' || type === 'limited flexibility';

    const status = this.leave_data?.status?.toLowerCase();

    const isPending = status === 'pending';

    const isReportingManager =
      String(this.leave_data?.reporting_to) === String(this.user_id);

    return (
      isAdminOrDirector &&
      hasPermission &&
      isLimitedFlex &&
      isPending &&
      isReportingManager
    );
  }

  isDirectDirectorFlow(): boolean {
    return (
      this.userRole === 'Director' &&
      String(this.leave_data?.reporting_to) === String(this.user_id)
    );
  }

  // get isDirectorApprovalVisible(): boolean {
  //   const isReportingManager =
  //     String(this.leave_data?.reporting_to) === String(this.user_id);

  //   const isProlonged =
  //     this.leave_data?.wfh_type_name === 'prolonged_health_issue';

  //   const isDirectFlow = isReportingManager && this.userRole === 'Director';

  //   // admin as reporting manager flow
  //     const adminAsReportingManagerFlow =
  //     this.userRole === 'Admin' &&
  //     this.canUpdateWfh &&
  //     isReportingManager &&
  //     this.leave_data?.status === 'Pending' &&
  //     isProlonged &&
  //     this.leave_data?.is_confirmed_by_director === false;

  //   // ✅ CASE 1: Normal 2-stage flow (existing)
  //   const normalFlow =
  //     this.userRole === 'Director' &&
  //     this.canUpdateWfh &&
  //     isReportingManager &&
  //     this.leave_data?.status === 'Approved' &&
  //     isProlonged &&
  //     this.leave_data?.is_confirmed_by_director === false;

  //   // ✅ CASE 2: DIRECT FLOW (skip manager stage)
  //   const directFlow =
  //     isDirectFlow &&
  //     this.canUpdateWfh &&
  //     this.leave_data?.status === 'Pending' &&
  //     isProlonged;

  //   return normalFlow || directFlow ||adminAsReportingManagerFlow;
  // }

  get isDirectorApprovalVisible(): boolean {
    const isReportingManager =
      String(this.leave_data?.reporting_to) === String(this.user_id);

    const isProlonged =
      this.leave_data?.wfh_type_name === 'prolonged_health_issue';

    // ✅ ADMIN acting as reporting manager (NEW FIX)
    const adminFlow =
      this.userRole === 'Admin' &&
      this.canUpdateWfh &&
      isReportingManager &&
      this.leave_data?.status === 'Pending' &&
      isProlonged &&
      this.leave_data?.is_confirmed_by_director === false;

    // ✅ NORMAL FLOW (Manager → Director)
    const normalDirectorFlow =
      this.userRole === 'Director' &&
      this.canUpdateWfh &&
      // isReportingManager &&
      this.leave_data?.status === 'Approved' &&
      isProlonged &&
      this.leave_data?.is_confirmed_by_director === false;

    // ✅ DIRECT FLOW (Director is reporting manager)
    const directDirectorFlow =
      this.userRole === 'Director' &&
      this.canUpdateWfh &&
      isReportingManager &&
      this.leave_data?.status === 'Pending' &&
      isProlonged;

    return adminFlow || normalDirectorFlow || directDirectorFlow;
  }

  isProlongedHealthIssueFlow(): boolean {
    return (
      this.leave_data?.wfh_type_name?.toLowerCase() === 'prolonged_health_issue'
    );
  }

  getApprovalStageMessage(): string {
    if (!this.isProlongedHealthIssueFlow()) return '';

    const status = this.leave_data?.status?.toLowerCase();

    const isReportingManager =
      String(this.leave_data?.reporting_to) === String(this.user_id);

    const role = this.userRole;

    // 🔥 CASE 1: Manager → Director (direct)
    if (role === 'Director' && isReportingManager) {
      if (status === 'pending') {
        return 'Awaiting Director Approval (Single Stage)';
      }
    }

    // 🔥 CASE 2: Manager → Admin → Director
    if (status === 'pending') {
      return 'Awaiting Reporting Manager Approval (Stage 1 of 2)';
    }

    if (
      status === 'approved' &&
      this.leave_data?.is_confirmed_by_director === false
    ) {
      return 'Awaiting Director Approval (Stage 2 of 2)';
    }

    return '';
  }

  get canAdminApproveProlonged(): boolean {
    const role = this.userRole?.toLowerCase();

    const isReportingManager =
      String(this.leave_data?.reporting_to) === String(this.user_id);

    const status = this.leave_data?.status?.toLowerCase();

    const type = this.leave_data?.wfh_type_name?.toLowerCase();

    return (
      role === 'admin' && // ✅ allow admin directly
      isReportingManager &&
      status === 'pending' &&
      (type === 'prolonged_health_issue' || type === 'prolonged health issues')
    );
  }
}
