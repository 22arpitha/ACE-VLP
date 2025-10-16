import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-update-holiday',
  templateUrl: './create-update-holiday.component.html',
  styleUrls: ['./create-update-holiday.component.scss']
})
export class CreateUpdateHolidayComponent implements OnInit {
  holidayForm: FormGroup;
  headingText: string;
  buttonName: string;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiserviceService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    public dialogRef: MatDialogRef<CreateUpdateHolidayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initialForm();
    if (this.data.edit) {
      this.headingText = 'Update Holiday Details';
      this.buttonName = 'Update';
      this.getHolidayDataById();
    } else {
      this.headingText = 'Add Holidays'
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

  initialForm() {
    this.holidayForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(30)]],
      date: ['', Validators.required],
      // classification: ['', Validators.required],
      description: ['', [Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(100)]]
    })
  }

  get f() {
    return this.holidayForm.controls;
  }

  getHolidayDataById() {
    this.apiService.getData(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`).subscribe(
      (res: any) => {
        this.holidayForm.patchValue({
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
    if (this.holidayForm.invalid) {
      this.holidayForm.markAllAsTouched();
    } else {
      this.holidayForm.patchValue({ date: this.datepipe.transform(this.holidayForm?.get('date')?.value, 'YYYY-MM-dd') })
      if (this.data.edit) {
        this.apiService.updateData(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`, this.holidayForm.value).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
             this.dialogRef.close({data:'refresh'});
          },
          (error: any) => {
            console.log('error', error);
            this.apiService.showError(error.error.detail.name);
          }
        )
      } else {
        this.apiService.postData(`${environment.live_url}/${environment.holiday_calendar}/`, this.holidayForm.value).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
             this.dialogRef.close({data:'refresh'});
          },
          (error: any) => {
            console.log('error', error);
            this.apiService.showError(error.error.detail.name);
          }
        )
      }
    }
  }
  //    disabledDatesWithTooltip = [
  //   { date: new Date(2025, 6, 4), reason: 'Independence Day' },
  //   { date: new Date(2025, 6, 10), reason: 'Maintenance Day' },
  //   { date: new Date(2025, 6, 15), reason: 'Company Holiday' },
  // ];
  //   dateFilter = (d: Date | null): boolean => {
  //   const date = d?.setHours(0, 0, 0, 0);
  //   return !this.disabledDatesWithTooltip.some(disabled =>
  //     disabled.date.setHours(0, 0, 0, 0) === date
  //   );
  // };
  // dateClass = (d: Date): string => {
  //   const match = this.disabledDatesWithTooltip.find(
  //     x => x.date.setHours(0, 0, 0, 0) === d.setHours(0, 0, 0, 0)
  //   );
  //   return match ? `disabled-tooltip tooltip-${d.getTime()}` : '';
  // };

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
            this.dialogRef.close({data:'refresh'});
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
}
