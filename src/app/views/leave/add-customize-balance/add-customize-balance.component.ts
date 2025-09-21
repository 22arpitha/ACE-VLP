import { Component, OnInit, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { error } from 'console';
import { DatePipe } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-customize-balance',
  templateUrl: './add-customize-balance.component.html',
  styleUrls: ['./add-customize-balance.component.scss']
})
export class AddCustomizeBalanceComponent implements OnInit {

  customizeBalanceForm: FormGroup;
  headingText: string;
  buttonName: string;
  user_id: number
  userRole: string
  leaveTypes = [
    { leave_type: 'Loss Of Pay', existing_balance: 0 },
    { leave_type: 'Casual Leave', existing_balance: 7 },
    { leave_type: 'Sick Leave', existing_balance: 12 },
    { leave_type: 'Paternity Leave', existing_balance: 5 },
    { leave_type: 'Earned Leave', existing_balance: 28 },
  ];
  constructor(
    private fb: FormBuilder,
    private apiService: ApiserviceService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<AddCustomizeBalanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = Number(sessionStorage.getItem('user_id'));
  }

  ngOnInit(): void {
    this.initialForm();
    if (this.data.edit) {
      this.headingText = 'Update Balance';
      this.buttonName = 'Update';
      this.getEmpCustomBalance();
    } else {
      this.headingText = 'Customize Balance'
      this.buttonName = 'Add'
    }
    console.log(this.data)
  }


  initialForm() {
    this.customizeBalanceForm = this.fb.group({
      leaves: this.fb.array([]) 
    });
  }

  get leavesFormArray(): FormArray {
  return this.customizeBalanceForm.get('leaves') as FormArray;
}

  get f() {
    return this.customizeBalanceForm.controls;
  }

  getEmpCustomBalance() {
    this.apiService.getData(`${environment.live_url}/${environment.all_emp_custom_balance}/?employee-ids=[${this.data?.item?.employee}]`).subscribe(
      (res: any) => {
        console.log(res)
        if (res.results.length) {
          this.leavesFormArray.clear();
          res.results[0].leave.forEach((leave: any) => {
            this.leavesFormArray.push(
              this.fb.group({
                leave_type_id: [leave.leave_type_id || leave.id || ''],
                leave_type: [leave.name || leave.leave_type],
                existing_balance: [leave.available || 0],
                new_balance: [leave.new_leave_value || 0, Validators.required],
                reason: [leave.reason ]
              })
            );
          });
        }
      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }

  addOrUpdateBalance() {
    if (this.customizeBalanceForm.invalid) {
      this.customizeBalanceForm.markAllAsTouched();
    } else {
      const payload = {
      employee: this.data?.item?.employee,
      leave: this.leavesFormArray.controls.map(c => ({
        leave_type_id: c.get('leave_type_id')?.value,
        new_leave_value: c.get('new_balance')?.value,
        reason: c.get('reason')?.value || ''
        }))
      };
      console.log(payload)
       this.apiService.postData(`${environment.live_url}/${environment.all_emp_custom_balance}/`, payload).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
             this.dialogRef.close({data:'refresh'});
          },
          (error: any) => {
            console.log('error', error)
          }
        )
    }
  }

  public closeEditDetails() {
    this.dialogRef.close();
  }


  getEmpLeaveBalance(emp_id){
    
  }

 
}

