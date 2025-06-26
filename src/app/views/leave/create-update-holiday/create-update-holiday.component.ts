import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
    public dialogRef: MatDialogRef<CreateUpdateHolidayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data.edit) {
      this.headingText = 'Update Holiday Details';
      this.buttonName = 'Update';
    } else {
      this.headingText = 'Add Holidays'
      this.buttonName = 'Add'
    }
    this.initialForm();
    console.log(this.data)
  }

  initialForm() {
    this.holidayForm = this.fb.group({
      holiday_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(20)]],
      holiday_date: ['', Validators.required],
      classification: ['', Validators.required],
      description: ['',[Validators.pattern(/^[a-zA-Z]+( [a-zA-Z]+)*$/), Validators.maxLength(100)]]
    })
  }

  get f() {
    return this.holidayForm.controls;
  }


  updateInvoice() {
    if(this.holidayForm.invalid){
      this.holidayForm.markAllAsTouched();
    } else{
      
    }
  }

  public closeEditDetails() {
    this.dialogRef.close();
  }
}
