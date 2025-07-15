import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubModuleService } from 'src/app/service/sub-module.service';

@Component({
  selector: 'app-view-leave-request',
  templateUrl: './view-leave-request.component.html',
  styleUrls: ['./view-leave-request.component.scss']
})
export class ViewLeaveRequestComponent implements OnInit {

  constructor(private apiService: ApiserviceService,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<ViewLeaveRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  isRejectClicked = false;
  reasonControl = new FormControl({ value: '', disabled: true }, Validators.required);
  ngOnInit(): void {
  }

  approve() {

  }

  delete() {
    const modelRef = this.modalService.open(GenericDeleteComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true
    });
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        this.apiService.delete(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
            this.dialogRef.close();
          },
          (error: any) => {
            console.log('error', error)
          }
        )
        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })

  }

  onRejectClick() {
    this.isRejectClicked = true;
    this.reasonControl.enable();

    if (this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }

    const reason = this.reasonControl.value;
    this.rejectRequest(reason);
  }

  rejectRequest(reason: string): void {
    const payload = {
      reason: reason,
      status: 'Rejected',
      // Add other fields if needed like `id`, `user_id`, etc.
    };

    this.apiService.postData('your-endpoint/reject', payload).subscribe({
      next: (res) => {
        console.log('Reject successful', res);
        // show success toast or update UI
      },
      error: (err) => {
        console.error('Reject failed', err);
        // show error toast
      }
    });
  }




}
