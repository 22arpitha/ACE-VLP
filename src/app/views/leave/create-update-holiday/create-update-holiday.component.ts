import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubModuleService } from '../../../service/sub-module.service';

@Component({
  selector: 'app-create-update-holiday',
  templateUrl: './create-update-holiday.component.html',
  styleUrls: ['./create-update-holiday.component.scss']
})
export class CreateUpdateHolidayComponent implements OnInit {
  holidayForm: FormGroup;
  headingText: string;
  buttonName: string;
  accessPermissions = [];
  editButton:boolean = false;
   access_name: any;
   user_id:any
   user_role_name:string;
   shouldDisableFields:boolean = false;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiserviceService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    private accessControlService: SubModuleService,
    public dialogRef: MatDialogRef<CreateUpdateHolidayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.user_id = Number(sessionStorage.getItem('user_id'));
    this.user_role_name = sessionStorage.getItem('user_role_name');
  }

  ngOnInit(): void {
    this.initialForm();
    this.getModuleAccess()
  }

  initialForm() {
    this.holidayForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(30)]],
      date: ['', Validators.required],
      description: ['', [Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(100)]]
    })
  }

  editBtnFun(){
     if (this.user_role_name === 'Admin') {
      this.editButton = true;
      this.shouldDisableFields = true;
    }
    else {
      this.editButton = true;
         this.shouldDisableFields = this.accessPermissions[0]?.['update'];
    }
  }

  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((res) => {
      let temp = res.find((item: any) => item.name === sessionStorage.getItem('access-name'));
      this.accessPermissions = temp.operations;
      if (this.data.edit) {
      this.headingText = 'Update Holiday Details';
      this.buttonName = 'Update';
      if(this.user_role_name!='Admin'){
        this.editButton =!this.accessPermissions[0].update;
      } else{
        this.editButton = false;
      }
      // this.editButton = this.user_role_name === 'Admin'? true: this.accessPermissions[0].update;
      this.getHolidayDataById();
      
      } else {
        this.headingText = 'Add Holidays'
        this.shouldDisableFields = this.user_role_name === 'Admin'? true: this.accessPermissions[0].create;
        this.buttonName = 'Add'
      }
    });
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
      this.holidayForm.patchValue({ date: this.datepipe.transform(this.holidayForm?.get('date')?.value, 'yyyy-MM-dd') })
      if (this.data.edit) {
        this.apiService.updateData(`${environment.live_url}/${environment.holiday_calendar}/${this.data.item_id}/`, this.holidayForm.value).subscribe(
          (res: any) => {
            console.log(res);
            this.apiService.showSuccess(res['message']);
            sessionStorage.removeItem('access-name');
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
            sessionStorage.removeItem('access-name');
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
 public closeEditDetails() {
    sessionStorage.removeItem('access-name');
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
            sessionStorage.removeItem('access-name');
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
