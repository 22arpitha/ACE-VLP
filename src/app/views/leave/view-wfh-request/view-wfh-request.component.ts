import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-components/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-wfh-request',
  templateUrl: './view-wfh-request.component.html',
  styleUrls: ['./view-wfh-request.component.scss'],
  standalone:false
})
export class ViewWfhRequestComponent implements OnInit {

 leave_data: any;
  displayButton: boolean = true;
  constructor(
    private apiService: ApiserviceService,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<ViewWfhRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.leave_data = data.data;
    this.leave_data.cc = JSON.parse(this.leave_data.cc);
    if (this.leave_data.status != 'Pending') {
      this.displayButton = false;
    } else {
      this.displayButton = true;
    }
  }

  isRejectClicked = false;
  reasonControl = new FormControl(
    { value: '', disabled:false},
    Validators.required
  );

  ngOnInit(): void {    
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
        data_to_send
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.message);
        this.dialogRef.close(res);
      },
            (error: any) => {
              console.log('error', error);
            }
    );
  }

  delete() {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.status.subscribe((resp) => {
      if (resp == 'ok') {
        this.apiService
          .delete(
            `${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`
          )
          .subscribe(
            (res: any) => {
              console.log(res);
              this.apiService.showSuccess(res['message']);
              this.dialogRef.close();
            },
            (error: any) => {
              console.log('error', error);
            }
          );
        modelRef.close();
      } else {
        modelRef.close();
      }
    });
  }

  onRejectClick(data:any) {
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
      rejected_reason: this.reasonControl.value
    };

    this.apiService
      .updateData(
        `${environment.live_url}/${environment.apply_wfh}/?id=${data.id}`,
        data_to_send
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
      next: (res) => {
        console.log('Reject successful', res);
      },
      error: (err) => {
        console.error('Reject failed', err);
      },
    });
  }

  openInNewTab(url: string): void {
    window.open(url, '_blank');
  }

}
