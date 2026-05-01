import { Component, OnInit,Inject } from '@angular/core';
import { ApiserviceService } from '../../../service/apiservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-request-unlock',
  templateUrl: './request-unlock.component.html',
  styleUrls: ['./request-unlock.component.scss']
})
export class RequestUnlockComponent implements OnInit {
  userId: any;
  rejectionReason = '';
  constructor(
    private apiService: ApiserviceService,
    public dialogRef: MatDialogRef<RequestUnlockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userId = sessionStorage.getItem('user_id');
  }

  ngOnInit(): void {
  }

  requestUnlock() {
    const payload = {
      "employee": this.userId,
      // "request_count": this.data.apiRes.count,
      "requested_date": this.data.requestedDate,
      "reason": this.rejectionReason,
    }
    console.log(payload)
    this.apiService.postData(`${environment.live_url}/${environment.unlock_request}/`, payload).subscribe(
      (res: any) => {
        console.log(res);
        this.apiService.showSuccess(res.message)
        this.dialogRef.close({ data: 'refresh' });
      },
      (error) => {
        console.error('Error requesting unlock:', error);
        this.apiService.showError(error?.error?.error)
      }
    );
  }
  close(){
     this.dialogRef.close({ data: 'refresh' });
  }
}
