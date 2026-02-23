import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cancel-leave-request',
  templateUrl: './cancel-leave-request.component.html',
  styleUrls: ['./cancel-leave-request.component.scss']
})
export class CancelLeaveRequestComponent implements OnInit {
  cancelLeaveform!: FormGroup;
  sessions = [
    { label: 'Session 1', value: 'session 1' },
    { label: 'Session 2', value: 'session 2' }
  ];
  date_ranges_list: any = [];
  constructor(private apiService: ApiserviceService, private fb: FormBuilder,
    public dialogRef: MatDialogRef<CancelLeaveRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.cancelLeaveform = this.fb.group({
      date_ranges: this.fb.array([])
    });
    this.getDataofCancelRequest();
  }

  get dateRanges(): FormArray {
    return this.cancelLeaveform.get('date_ranges') as FormArray;
  }

  getDataofCancelRequest() {
    this.apiService.getData(`${environment.live_url}/${environment.get_cancel_leave_requests}/?leave_id=${this.data.id}`).subscribe(
      (response: any) => {
        this.date_ranges_list = response?.date_ranges || [];
        this.buildForm();
      },
      (error) => {
        console.error(error);
      }
    );

  }

  buildForm() {
    this.dateRanges.clear();

    this.date_ranges_list.forEach(d => {

      // extract sessions dynamically from response
      const availableSessions = Object.keys(d).filter(k => k !== 'date');

      // preselected sessions (true ones)
      const selectedSessions = availableSessions.filter(k => d[k] === true);

      const group = this.fb.group({
        selected: [false],
        date: [d.date],
        availableSessions: [availableSessions],  // for dropdown options
        sessions: [{ value: selectedSessions, disabled: true }], // for display
        original: [d] // for submit toggle
      });

      group.get('selected')?.valueChanges.subscribe(v => {
        if (v) group.get('sessions')?.enable();
        else group.get('sessions')?.disable();
      });

      this.dateRanges.push(group);
    });
  }


  // buildForm() {
  //  this.dateRanges.clear();
  //   this.date_ranges_list.forEach(d => {
  //     const group = this.fb.group({
  //       selected: [false],
  //       date: [d.date],
  //       session1: [{ value: d.session1, disabled: true }],
  //       session2: [{ value: d.session2, disabled: true }]
  //     });
  //     group.get('selected')?.valueChanges.subscribe(v => {
  //       if (v) {
  //         group.get('session1')?.enable();
  //         group.get('session2')?.enable();
  //       } else {
  //         group.get('session1')?.disable();
  //         group.get('session2')?.disable();
  //       }
  //     });
  //     this.dateRanges.push(group);
  //   });
  // }
  get hasAnySelected(): boolean {
    return this.dateRanges.controls.some(row => {

    const original = row.get('original')?.value;
    const sessions: string[] = row.get('availableSessions')?.value || [];
    const selected: string[] = row.get('sessions')?.value || [];

    return sessions.some(session => {
      const originalValue = original[session];
      const currentValue = selected.includes(session);
      return originalValue !== currentValue;
    });

  });
  }

  submit() {
    const payload = {
      leave_id: this.data.id,
      date_ranges: this.dateRanges.controls.map(row => {
      const date = row.get('date')?.value;
      const sessions: string[] = row.get('availableSessions')?.value || [];
      const selected: string[] = row.get('sessions')?.value || [];
      const obj: any = { date };
      // send EXACT dropdown state
      sessions.forEach(session => {
        obj[session] = selected.includes(session);
      });
      return obj;
    })
    };

    // console.log(payload);
    this.apiService.postData(`${environment.live_url}/${environment.update_leave_cancellation}/`, payload).subscribe(
      (response:any) => {
        this.apiService.showSuccess(response?.message)
        this.dialogRef.close({ data: 'refresh' });
      },
      (error) => {
        console.error(error);
      }
    );
  }


  // this.dialogRef.close({data:'refresh'});

}
