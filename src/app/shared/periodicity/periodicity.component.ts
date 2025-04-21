import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-periodicity',
  templateUrl: './periodicity.component.html',
  styleUrls: ['./periodicity.component.scss']
})
export class PeriodicityComponent implements OnInit {
  periodicityForm:FormGroup;
  selectedYear: Date;
  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.initForm()
  }
  initForm(){
    this.periodicityForm = this.fb.group({
      periodicity : ['',Validators.required]
    })
  }
  joiningDateFun(event){}

  get f (){
    return this.periodicityForm.controls;
  }

  chosenYearHandler(normalizedYear: Date) {
    this.selectedYear = new Date(normalizedYear);
  }


}
