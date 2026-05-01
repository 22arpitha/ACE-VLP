import { Component, OnInit, Inject } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-view-timesheet-request',
  templateUrl: './view-timesheet-request.component.html',
  styleUrls: ['./view-timesheet-request.component.scss']
})
export class ViewTimesheetRequestComponent implements OnInit {

  userId: any;
  rejectionReason = '';
  requestData: any;
  userRole:any=''
  constructor(
    private apiService: ApiserviceService,
    public dialogRef: MatDialogRef<ViewTimesheetRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userId = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name').toLowerCase();
  }
  ngOnInit(): void {
    this.getTimesheetRequestData();
  }

  getTimesheetRequestData() {
    this.apiService.getData(`${environment.live_url}/${environment.unlock_request}/${this.data}/`).subscribe(
      (res: any) => {
        this.requestData = res;
      },
      (error) => {
        console.log(error);
        this.apiService.showError(error?.error?.error);
      }
    )
  }

  
  rejectRequest() {
    const payload = {
      "action": 'reject',
      "user_id": this.userId,
      "rejected_reason": this.rejectionReason,
    }
    this.apiService.updateData(`${environment.live_url}/${environment.unlock_request}/${this.data}/`, payload).subscribe(
      (res: any) => {
        this.apiService.showSuccess(res.message);
        this.dialogRef.close({ data: 'refresh' });
      },
      (error) => {
        console.log(error);
      }
    )
  }

  approveRequest() {
    const payload = {
      "action": 'approve',
      "user_id": this.userId,
    }
    this.apiService.updateData(`${environment.live_url}/${environment.unlock_request}/${this.data}/`, payload).subscribe(
      (res: any) => {
        this.apiService.showSuccess(res.message);
        this.dialogRef.close({ data: 'refresh' });
      },
      (error) => {
        console.log(error);
      }
    )
  }

  canShowActions(): boolean {
    return (
      (this.userRole === 'manager' && this.requestData?.status === 'pending_manager') ||
      (this.userRole === 'admin' && this.requestData?.status === 'pending_admin')
    );
  }

}
