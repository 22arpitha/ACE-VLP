import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employeeForm:FormGroup;
  constructor( private fb:FormBuilder) { }
  ngOnInit(): void {
    this.initForm()
  }
  initForm(){
    this.employeeForm = this.fb.group({
      employee:['',Validators.required]
    })
  }

  get f (){
    return this.employeeForm.controls;
  }
}
