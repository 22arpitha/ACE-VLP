import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  compOffForm: FormGroup;
  headingText: string;
  buttonName: string;
  minDate: string;
  accessPermissions = [];
  user_id: any;
  userRole: any;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiserviceService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    public dialogRef: MatDialogRef<AddCompoffRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initialForm();
    if (this.data.edit) {
      this.headingText = 'Compensatory Request';
      this.buttonName = 'Approve';
      // this.getHolidayDataById();
    } else {
      this.headingText = 'Add Request'
      this.buttonName = 'Add'
    }
    console.log(this.data)
  }
  //   ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.disabledDatesWithTooltip.forEach(disabled => {
  //       const timestamp = disabled.date.setHours(0, 0, 0, 0);
  //       const el = document.querySelector(`.tooltip-${timestamp}`) as HTMLElement;
  //       if (el) {
  //         el.setAttribute('data-tooltip', disabled.reason);
  //       }
  //     });
  //   }, 100); // Delay needed to ensure datepicker DOM is rendered
  // }

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
    this.compOffForm = this.fb.group({
      worked_date: ['', Validators.required],
      duration: ['', Validators.required],
      expiry_date: ['', Validators.required],
      reason: ['', Validators.required, [Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(100)]]
    })
  }

  get f() {
    return this.compOffForm.controls;
  }

  getHolidayDataById() {
    this.apiService.getData(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`).subscribe(
      (res: any) => {
        this.compOffForm.patchValue({
          name: res.name,
          date: res.date,
          // classification: res.classification,
          description: res.description,
        })
      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }

  addOrUpdateHoliday() {
    if (this.compOffForm.invalid) {
      this.compOffForm.markAllAsTouched();
    } else {
      this.compOffForm.patchValue({ date: this.datepipe.transform(this.compOffForm?.get('date')?.value, 'YYYY-MM-dd') })
      if (this.data.edit) {
        this.apiService.updateData(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`, this.compOffForm.value).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
            this.dialogRef.close();
          },
          (error: any) => {
            console.log('error', error)
          }
        )
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.holiday_calendar}/`, this.compOffForm.value).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
            this.dialogRef.close();
          },
          (error: any) => {
            console.log('error', error)
          }
        )
      }
    }
  }
  workedDateFun(event) {
    this.minDate = event.value
  }
  public closeEditDetails() {
    this.dialogRef.close();
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

  approve(){

  }
}
