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

  isRejectClicked = false;
  reasonControl = new FormControl(
    { value: '', disabled: false },
    Validators.required,
  );

  ngOnInit(): void {
    this.getModuleAccess();
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

  approveByDirector(data: any) {
    this.reasonControl.clearValidators();
    this.reasonControl.updateValueAndValidity();
    console.log('data=>', data);
    let data_to_send = {
      wfh_id: this.leave_data?.id,
      is_confirmed: true,
    };
    this.apiService
      .postData(
        `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
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

  rejectByDirector(data: any) {
    this.isRejectClicked = true;

    // Add required validator dynamically
    this.reasonControl.setValidators([Validators.required]);
    this.reasonControl.updateValueAndValidity();

    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }
    const data_to_send = {
      wfh_id: this.leave_data?.id,
      is_confirmed: false,
    };

    this.apiService
      .postData(
        `${environment.live_url}/${environment.confirm_prolonged_leave}/`,
        data_to_send,
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.message);
        this.dialogRef.close(res);
      });
  }

  get isDirectorApprovalVisible(): boolean {
    return (
      this.userRole === 'Director' &&
      this.canUpdateWfh &&
      this.leave_data?.status === 'Approved' &&
      this.leave_data?.wfh_type_name === 'prolonged_health_issue' &&
      this.leave_data?.is_confirmed_by_director === false
    );
  }

  get isDirectorRejectedMessageVisible(): boolean {
    return (
      this.userRole === 'Director' &&
      this.leave_data?.status === 'Rejected' &&
      this.leave_data?.wfh_type_name === 'prolonged_health_issue' &&
      this.leave_data?.is_confirmed_by_director === false &&
      this.leave_data?.rejected_by !== 'null'
    );
  }

  // ===================== FRONTEND ENHANCEMENTS =====================

  /**
   * Get day of week name from date
   */
  getDayOfWeek(date: any): string {
    if (!date) return '';
    try {
      const d = new Date(date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    return {
      'pending': 'badge bg-warning text-dark',
      'approved': 'badge bg-success',
      'rejected': 'badge bg-danger',
      'draft': 'badge bg-secondary'
    }[normalizedStatus] || 'badge bg-secondary';
  }

  /**
   * Check if employee can see rejection reason (employees should see it)
   */
  canSeeRejectionReason(): boolean {
    return this.leave_data?.rejected_reason && 
           (this.leave_data?.status === 'Rejected' || this.leave_data?.status === 'rejected');
  }

  /**
   * Check if this is a Prolonged Health Issues request
   */
  isProlongedHealthIssue(): boolean {
    const wfhType = this.leave_data?.wfh_type_name?.toLowerCase();
    return wfhType === 'prolonged_health_issue' || wfhType === 'prolonged health issues';
  }

  /**
   * Check if this is a Limited Flexibility request
   */
  isLimitedFlexibility(): boolean {
    const wfhType = this.leave_data?.wfh_type_name?.toLowerCase();
    return wfhType === 'limited_flexibility' || wfhType === 'limited flexibility';
  }

  /**
   * Get approval stage message for Prolonged Health Issues
   */
  getApprovalStageMessage(): string {
    if (this.isProlongedHealthIssue()) {
      if (this.leave_data?.status === 'Pending' || this.leave_data?.status === 'PENDING') {
        return 'Awaiting Manager Approval (Stage 1 of 2)';
      }
      if (this.leave_data?.status === 'Approved' || this.leave_data?.status === 'approved') {
        if (this.leave_data?.is_confirmed_by_director === false) {
          return 'Awaiting Director Approval (Stage 2 of 2)';
        }
      }
    }
    return '';
  }

  /**
   * Extract filename from URL
   */
  getFileNameFromUrl(url: string): string {
    if (!url) return 'Download';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename || 'Download';
  }
}
