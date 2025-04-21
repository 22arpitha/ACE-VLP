import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit {
  periodForm!: FormGroup;
  constructor(private fb:FormBuilder) { }

  initForm(){
    this.periodForm = this.fb.group({
      period : ['',Validators.required]
    })
  }
  joiningDateFun(event){}

  get f (){
    return this.periodForm.controls;
  }
  ngOnInit(): void {
    this.initForm()
  }

}
