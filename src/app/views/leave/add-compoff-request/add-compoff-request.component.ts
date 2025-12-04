import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubModuleService } from 'src/app/service/sub-module.service';

@Component({
  selector: 'app-add-compoff-request',
  templateUrl: './add-compoff-request.component.html',
  styleUrls: ['./add-compoff-request.component.scss']
})
export class AddCompoffRequestComponent implements OnInit {
  rejectCompOffForm: FormGroup;
  headingText: string;
  buttonName: string;
  minDate: string;
  accessPermissions = [];
  allEmp
  user_id: any;
  userRole: any;
  comOffGrantData: any
  constructor(
    private fb: FormBuilder,
    private apiService: ApiserviceService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    public dialogRef: MatDialogRef<AddCompoffRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = Number(sessionStorage.getItem('user_id'));
  }

  ngOnInit(): void {
    this.initialForm();
    if (this.data.edit) {
      this.headingText = 'Compensatory Request';
      this.buttonName = 'Approve';
      this.getCompoffDataById();
    } else {
      this.headingText = 'Add Request'
      this.buttonName = 'Add'
    }
    console.log(this.data)
  }
  

  access_name: any;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.access_name = access[0]
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }

  initialForm() {
    this.rejectCompOffForm = this.fb.group({
      status: "rejected",
      leave_type_id:[''],
      rejected_by: [Number(sessionStorage.getItem('user_id'))],
       rejected_reason: ['', 
        [
          Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/),
          Validators.maxLength(200)
        ]
  ]
    })
  }

  get f() {
    return this.rejectCompOffForm.controls;
  }

  getCompoffDataById() {
    this.apiService.getData(`${environment.live_url}/${environment.comp_off_grant}/${this.data.item_id}/`).subscribe(
      (res: any) => {
        this.comOffGrantData = res
      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }
  
  workedDateFun(event) {
    this.minDate = event.value
  }
  public closeEditDetails() {
    this.dialogRef.close();
  }

  reject(data) {
     this.simpleToggleRequired(true, [
      'rejected_reason'
    ]);
    this.rejectCompOffForm.patchValue({leave_type_id:data.leave_type})
    if (this.rejectCompOffForm.invalid) {
      this.rejectCompOffForm.markAllAsTouched();
    } else {
      console.log(this.rejectCompOffForm.value)
      this.apiService.updateData(
         `${environment.live_url}/${environment.comp_off_grant}/${data.id}/`,
         this.rejectCompOffForm.value
       )
       .subscribe((res: any) => {
         this.apiService.showSuccess(res?.detail);
          this.dialogRef.close({data:'refresh'});
       },
       (error:any)=>{
        console.log(error)
       }
      );
    }
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

  approve(data) {
     this.simpleToggleRequired(false, [
      'rejected_reason'
    ]);
    let data_to_send = {
      status: 'approved',
      approved_by: Number(sessionStorage.getItem('user_id')),
      leave_type_id:data.leave_type
    };
    console.log(data_to_send)
    this.apiService
      .updateData(
        `${environment.live_url}/${environment.comp_off_grant}/${data.id}/`,
        data_to_send
      )
      .subscribe((res: any) => {
        this.apiService.showSuccess(res?.detail);
         this.dialogRef.close({data:'refresh'});
      },
       (error:any)=>{
        console.log(error)
       }
    );
  }

  simpleToggleRequired(enable: boolean, controlNames: string[]) {
  controlNames.forEach(name => {
    const control: any = this.rejectCompOffForm.get(name);
    if (enable) {
      control?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/),
        Validators.maxLength(200)
      ]);
    } else {
      control?.clearValidators();
      control?.setValidators([
        Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/),
        Validators.maxLength(200)
      ]);
      control?.reset();
    }
    control?.updateValueAndValidity();
  });
}

 openInNewTab(url: string): void {
    window.open(url, '_blank');
  }
 
}
